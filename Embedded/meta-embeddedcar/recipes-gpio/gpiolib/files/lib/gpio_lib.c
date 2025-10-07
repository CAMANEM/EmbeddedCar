#define _GNU_SOURCE
#include "../include/gpio_lib.h"
#include <pthread.h>
#include <sys/time.h>

// Estructura para manejar PWM software
typedef struct {
    int pin;
    int duty_cycle;    // 0-100
    int frequency;     // Hz
    int active;        // 1 = activo, 0 = inactivo
    pthread_t thread;
} soft_pwm_t;

// Estructura para manejar blink no bloqueante
typedef struct {
    int pin;
    int freq;          // Hz (parpadeos por segundo)
    int duration;      // duración en segundos
    int active;        // 1 = activo, 0 = inactivo
    pthread_t thread;
} blink_t;

// Array para manejar hasta 22 pines PWM software simultáneamente
static soft_pwm_t soft_pwm_pins[28] = {0};  // GPIO 0-27 para RPi4
static pthread_mutex_t soft_pwm_mutex = PTHREAD_MUTEX_INITIALIZER;

// Array para manejar hasta 22 pines blink simultáneamente
static blink_t blink_pins[22] = {0};
static pthread_mutex_t blink_mutex = PTHREAD_MUTEX_INITIALIZER;


int pinMode(int pin, Mode_t mode) {
    char cmd[64];
    if (mode == INPUT) {
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d ip", pin);
    } else if (mode == PWM) {
        // Set pin to PWM mode (alternative function)
        // PWM pins on RPi4: 12, 13, 18, 19 (PWM0)
        if (pin == 12 || pin == 18) {
            snprintf(cmd, sizeof(cmd), "raspi-gpio set %d a0", pin); // PWM0 channel 0
        } else if (pin == 13 || pin == 19) {
            snprintf(cmd, sizeof(cmd), "raspi-gpio set %d a0", pin); // PWM0 channel 1
        } else if (pin == 14 || pin == 15) {
            snprintf(cmd, sizeof(cmd), "raspi-gpio set %d a0", pin); // PWM1 (diferentes chip)
        } else {
            snprintf(cmd, sizeof(cmd), "raspi-gpio set %d a0", pin);
        }
    } else if (mode == SOFT_PWM) {
        // Software PWM: configurar como OUTPUT
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d op", pin);
    } else {
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d op", pin);
    }
    return system(cmd);
}

int digitalWrite(int pin, state_t value) {
    char cmd[64];
    if (value == HIGH) {
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d dh", pin);
    } else {
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d dl", pin);
    }
    return system(cmd);
}

int digitalRead(int pin) {
    char cmd[64];
    char buffer[128];
    snprintf(cmd, sizeof(cmd), "raspi-gpio get %d", pin);
    FILE *fp = popen(cmd, "r");
    if (fp == NULL) return -1;
    while (fgets(buffer, sizeof(buffer), fp)) {
        if (strstr(buffer, "level=1")) {
            pclose(fp);
            return 1;
        } else if (strstr(buffer, "level=0")) {
            pclose(fp);
            return 0;
        }
    }
    pclose(fp);
    return -1;
}

// Thread function para blink no bloqueante
static void* blink_thread(void* arg) {
    blink_t* blink_data = (blink_t*)arg;
    
    int delayTime = 500000 / blink_data->freq; // tiempo ON/OFF en microsegundos
    int cycles = blink_data->freq * blink_data->duration; // cantidad de parpadeos
    
    for (int i = 0; i < cycles && blink_data->active; i++) {
        digitalWrite(blink_data->pin, HIGH); // encender
        usleep(delayTime);
        if (!blink_data->active) break;
        digitalWrite(blink_data->pin, LOW);  // apagar
        usleep(delayTime);
    }
    
    // Asegurar que el pin quede en LOW al terminar
    digitalWrite(blink_data->pin, LOW);
    blink_data->active = 0;
    return NULL;
}

// Función blink bloqueante (original)
void blink(int pin, int freq, int duration) {
    //pinMode(pin, OUTPUT);

    int delayTime = 500000 / freq; // tiempo ON/OFF en microsegundos
    int cycles = freq * duration; // cantidad de parpadeos
    
    for (int i = 0; i < cycles; i++) {
        digitalWrite(pin, HIGH); // encender
        usleep(delayTime);
        digitalWrite(pin, LOW);  // apagar
        usleep(delayTime);
    }
}

// Función blink no bloqueante
int blinkStart(int pin, int freq, int duration) {
    if (pin < 0 || pin > 21) return -1;
    if (freq <= 0 || duration <= 0) return -1;
    
    pthread_mutex_lock(&blink_mutex);
    
    // Detener blink existente en este pin si existe
    if (blink_pins[pin].active) {
        blink_pins[pin].active = 0;
        pthread_join(blink_pins[pin].thread, NULL);
    }
    
    // Configurar nuevo blink
    blink_pins[pin].pin = pin;
    blink_pins[pin].freq = freq;
    blink_pins[pin].duration = duration;
    blink_pins[pin].active = 1;
    
    // Asegurar que el pin esté configurado como salida
    pinMode(pin, OUTPUT);
    
    // Crear thread para blink
    int result = pthread_create(&blink_pins[pin].thread, NULL, 
                               blink_thread, &blink_pins[pin]);
    
    if (result != 0) {
        blink_pins[pin].active = 0;
        pthread_mutex_unlock(&blink_mutex);
        return -1;
    }
    
    pthread_mutex_unlock(&blink_mutex);
    return 0;
}

// Detener blink en un pin específico
int blinkStop(int pin) {
    if (pin < 0 || pin > 21) return -1;
    
    pthread_mutex_lock(&blink_mutex);
    
    if (!blink_pins[pin].active) {
        pthread_mutex_unlock(&blink_mutex);
        return -1;  // Blink no activo en este pin
    }
    
    // Marcar como inactivo y esperar que termine el thread
    blink_pins[pin].active = 0;
    pthread_join(blink_pins[pin].thread, NULL);
    
    // Asegurar que el pin quede en LOW
    digitalWrite(pin, LOW);
    
    pthread_mutex_unlock(&blink_mutex);
    return 0;
}

// Función para escribir valor PWM (duty cycle 0-1024)
int pwmWrite(int pin, int duty_cycle) {
    char cmd[128];
    FILE *fp;
    
    // Validar duty cycle (0-1024 para compatibilidad con RPi)
    if (duty_cycle < 0) duty_cycle = 0;
    if (duty_cycle > 1024) duty_cycle = 1024;
    
    // Determinar qué canal PWM usar basado en el pin
    int pwm_channel = 0;
    if (pin == 12 || pin == 18) {
        pwm_channel = 0; // PWM0 canal 0
    } else if (pin == 13 || pin == 19) {
        pwm_channel = 1; // PWM0 canal 1  
    } else if (pin == 14 || pin == 15) {
        pwm_channel = 0; // PWM1 canal 0 (en /sys/class/pwm/pwmchip1/)
    }
    
    // Usar interfaz sysfs para PWM
    // Exportar el canal PWM si no existe
    snprintf(cmd, sizeof(cmd), "echo %d > /sys/class/pwm/pwmchip0/export 2>/dev/null", pwm_channel);
    system(cmd);
    
    // Configurar período (20ms = 50Hz, típico para servos)
    snprintf(cmd, sizeof(cmd), "echo 20000000 > /sys/class/pwm/pwmchip0/pwm%d/period", pwm_channel);
    system(cmd);
    
    // Configurar duty cycle (convertir de 0-1024 a nanosegundos)
    int duty_ns = (duty_cycle * 20000000) / 1024; // duty cycle en nanosegundos
    snprintf(cmd, sizeof(cmd), "echo %d > /sys/class/pwm/pwmchip0/pwm%d/duty_cycle", duty_ns, pwm_channel);
    system(cmd);
    
    // Habilitar PWM
    snprintf(cmd, sizeof(cmd), "echo 1 > /sys/class/pwm/pwmchip0/pwm%d/enable", pwm_channel);
    return system(cmd);
}

// Función para configurar frecuencia PWM
int pwmSetFrequency(int pin, int frequency) {
    char cmd[128];
    
    // Determinar canal PWM
    int pwm_channel = 0;
    if (pin == 12 || pin == 18) {
        pwm_channel = 0;
    } else if (pin == 13 || pin == 19) {
        pwm_channel = 1;
    }
    
    // Calcular período en nanosegundos
    int period_ns = 1000000000 / frequency;
    
    // Exportar canal si no existe
    snprintf(cmd, sizeof(cmd), "echo %d > /sys/class/pwm/pwmchip0/export 2>/dev/null", pwm_channel);
    system(cmd);
    
    // Deshabilitar PWM antes de cambiar período
    snprintf(cmd, sizeof(cmd), "echo 0 > /sys/class/pwm/pwmchip0/pwm%d/enable", pwm_channel);
    system(cmd);
    
    // Configurar nuevo período
    snprintf(cmd, sizeof(cmd), "echo %d > /sys/class/pwm/pwmchip0/pwm%d/period", period_ns, pwm_channel);
    return system(cmd);
}

// Función para detener PWM
int pwmStop(int pin) {
    char cmd[128];
    
    // Determinar canal PWM
    int pwm_channel = 0;
    if (pin == 12 || pin == 18) {
        pwm_channel = 0;
    } else if (pin == 13 || pin == 19) {
        pwm_channel = 1;
    }
    
    // Deshabilitar PWM
    snprintf(cmd, sizeof(cmd), "echo 0 > /sys/class/pwm/pwmchip0/pwm%d/enable", pwm_channel);
    system(cmd);
    
    // Configurar duty cycle a 0
    snprintf(cmd, sizeof(cmd), "echo 0 > /sys/class/pwm/pwmchip0/pwm%d/duty_cycle", pwm_channel);
    return system(cmd);
}

// ============================================================================
// FUNCIONES PWM SOFTWARE
// ============================================================================

// Función auxiliar para obtener tiempo en microsegundos
static long long get_time_us(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (long long)tv.tv_sec * 1000000 + tv.tv_usec;
}

// Thread function para PWM software
static void* soft_pwm_thread(void* arg) {
    soft_pwm_t* pwm = (soft_pwm_t*)arg;
    
    while (pwm->active) {
        // Calcular tiempos del ciclo PWM (en cada iteración para refrescar duty_cycle)
        double period_us = 1000000.0 / pwm->frequency;  // Período en microsegundos
        double high_time_us = (period_us * pwm->duty_cycle) / 100.0;
        double low_time_us = period_us - high_time_us;
        
        // Fase HIGH
        if (high_time_us > 1.0) {  // Mínimo 1 microsegundo
            digitalWrite(pwm->pin, HIGH);
            usleep((useconds_t)high_time_us);
        }
        
        // Fase LOW
        if (low_time_us > 1.0 && pwm->active) {  // Mínimo 1 microsegundo
            digitalWrite(pwm->pin, LOW);
            usleep((useconds_t)low_time_us);
        }
        
        // Si duty cycle es 0, solo LOW
        if (pwm->duty_cycle == 0) {
            digitalWrite(pwm->pin, LOW);
            usleep((useconds_t)period_us);
        }
        // Si duty cycle es 100, solo HIGH
        else if (pwm->duty_cycle == 100) {
            digitalWrite(pwm->pin, HIGH);
            usleep((useconds_t)period_us);
        }
    }
    
    // Asegurar que el pin quede en LOW al terminar
    digitalWrite(pwm->pin, LOW);
    return NULL;
}

// Función PWM software bloqueante
int softPwm(int pin, int duty_cycle, int frequency, int duration_ms) {
    if (pin < 0 || pin > 27) return -1;  // Expandido para RPi4 GPIO 0-27
    if (duty_cycle < 0 || duty_cycle > 100) return -1;
    if (frequency <= 0) return -1;
    
    // Configurar pin como salida
    pinMode(pin, OUTPUT);
    
    // Calcular tiempos con precisión de punto flotante
    double period_us = 1000000.0 / frequency;
    double high_time_us = (period_us * duty_cycle) / 100.0;
    double low_time_us = period_us - high_time_us;
    
    long long start_time = get_time_us();
    long long duration_us = (long long)duration_ms * 1000;
    
    // Generar PWM
    while (duration_ms == 0 || (get_time_us() - start_time) < duration_us) {
        // Fase HIGH
        if (high_time_us > 1.0) {
            digitalWrite(pin, HIGH);
            usleep((useconds_t)high_time_us);
        }
        
        // Fase LOW
        if (low_time_us > 1.0) {
            digitalWrite(pin, LOW);
            usleep((useconds_t)low_time_us);
        }
        
        // Si duration_ms = 0, solo hacer un ciclo para evitar bucle infinito en modo bloqueante
        if (duration_ms == 0) break;
    }
    
    digitalWrite(pin, LOW);
    return 0;
}

// Iniciar PWM software en background
int softPwmStart(int pin, int duty_cycle, int frequency) {
    if (pin < 0 || pin > 27) return -1;  // Expandido para RPi4 GPIO 0-27
    if (duty_cycle < 0 || duty_cycle > 100) return -1;
    if (frequency <= 0) return -1;
    
    pthread_mutex_lock(&soft_pwm_mutex);
    
    // Detener PWM existente en este pin si existe
    if (soft_pwm_pins[pin].active) {
        soft_pwm_pins[pin].active = 0;
        pthread_join(soft_pwm_pins[pin].thread, NULL);
    }
    
    // Configurar nuevo PWM
    soft_pwm_pins[pin].pin = pin;
    soft_pwm_pins[pin].duty_cycle = duty_cycle;
    soft_pwm_pins[pin].frequency = frequency;
    soft_pwm_pins[pin].active = 1;
    
    // Configurar pin como salida
    pinMode(pin, OUTPUT);
    
    // Crear thread para PWM
    int result = pthread_create(&soft_pwm_pins[pin].thread, NULL, 
                               soft_pwm_thread, &soft_pwm_pins[pin]);
    
    if (result != 0) {
        soft_pwm_pins[pin].active = 0;
        pthread_mutex_unlock(&soft_pwm_mutex);
        return -1;
    }
    
    pthread_mutex_unlock(&soft_pwm_mutex);
    return 0;
}

// Actualizar duty cycle de PWM software activo
int softPwmUpdateDuty(int pin, int duty_cycle) {
    if (pin < 0 || pin > 27) {
        printf("🔍 DEBUG softPwmUpdateDuty: Pin %d fuera de rango\n", pin);
        return -1;  // Expandido para RPi4 GPIO 0-27
    }
    if (duty_cycle < 0 || duty_cycle > 100) {
        printf("🔍 DEBUG softPwmUpdateDuty: Duty cycle %d fuera de rango\n", duty_cycle);
        return -1;
    }
    
    pthread_mutex_lock(&soft_pwm_mutex);
    
    if (!soft_pwm_pins[pin].active) {
        printf("🔍 DEBUG softPwmUpdateDuty: Pin %d NO ESTÁ ACTIVO\n", pin);
        pthread_mutex_unlock(&soft_pwm_mutex);
        return -1;  // PWM no activo en este pin
    }
    
    printf("🔍 DEBUG softPwmUpdateDuty: Pin %d activo, cambiando duty de %d%% a %d%%\n", 
           pin, soft_pwm_pins[pin].duty_cycle, duty_cycle);
    
    soft_pwm_pins[pin].duty_cycle = duty_cycle;
    
    pthread_mutex_unlock(&soft_pwm_mutex);
    return 0;
}

// Detener PWM software
int softPwmStop(int pin) {
    if (pin < 0 || pin > 27) return -1;  // Expandido para RPi4 GPIO 0-27
    
    pthread_mutex_lock(&soft_pwm_mutex);
    
    if (!soft_pwm_pins[pin].active) {
        pthread_mutex_unlock(&soft_pwm_mutex);
        return -1;  // PWM no activo en este pin
    }
    
    // Marcar como inactivo y esperar que termine el thread
    soft_pwm_pins[pin].active = 0;
    pthread_join(soft_pwm_pins[pin].thread, NULL);
    
    // Asegurar que el pin quede en LOW
    digitalWrite(pin, LOW);
    
    pthread_mutex_unlock(&soft_pwm_mutex);
    return 0;
}

// ============================================================================
// FUNCIONES SERVO CONTROL (PWM HARDWARE)
// ============================================================================

/**
 * Convierte ángulo (0-180°) a valor duty cycle para servo
 * Servo estándar: 1ms=0°, 1.5ms=90°, 2ms=180°
 * Con período de 20ms (50Hz): duty_cycle = (pulse_width_ms / 20ms) * 1024
 */
static int angle_to_duty_cycle(int angle) {
    // Limitar ángulo entre 0 y 180
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;
    
    // Convertir ángulo a ancho de pulso en microsegundos
    // 0° = 1000µs, 90° = 1500µs, 180° = 2000µs
    int pulse_width_us = 1000 + (angle * 1000) / 180;
    
    // Convertir a duty cycle para período de 20ms (20000µs)
    // duty_cycle = (pulse_width_us * 1024) / 20000
    int duty_cycle = (pulse_width_us * 1024) / 20000;
    
    return duty_cycle;
}

// Configurar servo (PWM hardware a 50Hz)
int servoInit(int pin) {
    // Verificar que sea un pin PWM hardware válido
    if (pin != 12 && pin != 13 && pin != 18 && pin != 19) {
        printf("❌ Error: Pin %d no soporta PWM hardware para servo\n", pin);
        printf("   Pines PWM válidos: 12, 13, 18, 19\n");
        return -1;
    }
    
    // Configurar pin como PWM
    if (pinMode(pin, PWM) != 0) {
        printf("❌ Error configurando pin %d como PWM\n", pin);
        return -1;
    }
    
    // Configurar frecuencia a 50Hz (estándar para servos)
    if (pwmSetFrequency(pin, 50) != 0) {
        printf("❌ Error configurando frecuencia PWM en pin %d\n", pin);
        return -1;
    }
    
    // Colocar servo en posición central (90°)
    servoWrite(pin, 90);
    
    printf("✅ Servo inicializado en pin %d (50Hz, posición 90°)\n", pin);
    return 0;
}

// Mover servo a ángulo específico
int servoWrite(int pin, int angle) {
    // Verificar pin válido
    if (pin != 12 && pin != 13 && pin != 18 && pin != 19) {
        printf("❌ Error: Pin %d no es un pin PWM hardware\n", pin);
        return -1;
    }
    
    // Convertir ángulo a duty cycle
    int duty_cycle = angle_to_duty_cycle(angle);
    
    // Aplicar PWM
    if (pwmWrite(pin, duty_cycle) != 0) {
        printf("❌ Error escribiendo PWM en pin %d\n", pin);
        return -1;
    }
    
    printf("🎯 Servo pin %d: ángulo %d° (duty cycle: %d/1024)\n", 
           pin, angle, duty_cycle);
    return 0;
}

// Mover servo con rango limitado
int servoWriteLimited(int pin, int angle, int min_angle, int max_angle) {
    // Validar rango
    if (min_angle > max_angle) {
        printf("❌ Error: min_angle (%d) > max_angle (%d)\n", min_angle, max_angle);
        return -1;
    }
    
    // Verificar que el ángulo esté en el rango permitido
    if (angle < min_angle || angle > max_angle) {
        printf("❌ Error: Ángulo %d° fuera del rango permitido [%d°, %d°]\n", 
               angle, min_angle, max_angle);
        return -1;
    }
    
    // Usar función normal de servo
    return servoWrite(pin, angle);
}

// Detener servo (posición neutra)
int servoStop(int pin) {
    // Colocar en posición central (90°)
    if (servoWrite(pin, 90) != 0) {
        return -1;
    }
    
    // Opcional: después de un momento, detener PWM completamente
    // Esto evita que el servo consuma corriente manteniendo posición
    usleep(500000); // Esperar 500ms para que alcance la posición
    
    return pwmStop(pin);
}

// ==== FUNCIONES SERVO CON PWM SOFTWARE ====

// Configurar servo con PWM software
int servoSoftInit(int pin, int frequency) {
    // Configurar pin como salida
    pinMode(pin, OUTPUT);
    
    // Iniciar PWM software con duty cycle 0 (servo en neutro)
    // Para servos: duty cycle ~7.5% = 1.5ms = 90° (centro)
    return softPwmStart(pin, 8, frequency); // ~7.5% duty cycle para centro
}

// Escribir ángulo a servo con PWM software
int servoSoftWrite(int pin, int angle) {
    // Validar rango
    if (angle < 0 || angle > 180) {
        printf("❌ Error: Ángulo %d° fuera del rango [0°, 180°]\n", angle);
        return -1;
    }
    
    // Convertir ángulo a duty cycle
    // Para servos a 50Hz (20ms período):
    // - 0° = 1ms pulse = 5% duty cycle
    // - 90° = 1.5ms pulse = 7.5% duty cycle  
    // - 180° = 2ms pulse = 10% duty cycle
    
    double duty_cycle_percent = 5.0 + (angle * 5.0 / 180.0); // 5% a 10%
    int duty_cycle = (int)(duty_cycle_percent + 0.5); // Redondear
    
    // Actualizar PWM
    return softPwmUpdateDuty(pin, duty_cycle);
}

// Escribir ángulo limitado a servo con PWM software
int servoSoftWriteLimited(int pin, int angle, int min_angle, int max_angle) {
    // Validar rango permitido
    if (angle < min_angle || angle > max_angle) {
        printf("❌ Error: Ángulo %d° fuera del rango permitido [%d°, %d°]\n", 
               angle, min_angle, max_angle);
        return -1;
    }
    
    // Usar función normal de servo software
    return servoSoftWrite(pin, angle);
}

// Detener servo con PWM software
int servoSoftStop(int pin) {
    // Colocar en posición central (90°) primero
    if (servoSoftWrite(pin, 90) != 0) {
        return -1;
    }
    
    // Esperar que alcance la posición
    usleep(500000); // 500ms
    
    // Detener PWM software completamente
    return softPwmStop(pin);
}
