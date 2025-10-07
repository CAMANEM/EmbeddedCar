#ifndef GPIO_LIB_H
#define GPIO_LIB_H

#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/**
 * @file gpio_lib.h
 * @brief Biblioteca GPIO para Raspberry Pi con soporte para PWM hardware
 * @author EmbeddedCar Project
 * @version 1.0
 * 
 * Esta biblioteca proporciona funciones para controlar los pines GPIO de la
 * Raspberry Pi, incluyendo operaciones digitales básicas y PWM hardware.
 * 
 * Pines PWM soportados: 12, 13, 18, 19 (usando PWM0 hardware)
 * - Pin 12, 18: PWM0 canal 0
 * - Pin 13, 19: PWM0 canal 1
 */

// Pin modes
typedef enum {
    OUTPUT = 0,  /**< Modo salida digital */
    INPUT = 1,   /**< Modo entrada digital */
    PWM = 2,     /**< Modo PWM hardware */
    SOFT_PWM = 3 /**< Modo PWM software */
} Mode_t;

// Logic levels
typedef enum {
    LOW = 0,     /**< Nivel lógico bajo (0V) */
    HIGH = 1     /**< Nivel lógico alto (3.3V) */
} state_t;

/**
 * @brief Configura el modo de un pin GPIO
 * @param pin Número del pin GPIO (0-21)
 * @param mode Modo del pin (OUTPUT, INPUT, PWM)
 * @return 0 si es exitoso, código de error del sistema en caso contrario
 * 
 * @example
 * // Configurar pin 18 como salida digital
 * pinMode(18, OUTPUT);
 * 
 * // Configurar pin 12 como PWM
 * pinMode(12, PWM);
 * 
 * // Configurar pin 21 como entrada
 * pinMode(21, INPUT);
 */
int pinMode(int pin, Mode_t mode);

/**
 * @brief Escribe un valor digital en un pin configurado como OUTPUT
 * @param pin Número del pin GPIO
 * @param value Valor a escribir (HIGH o LOW)
 * @return 0 si es exitoso, código de error del sistema en caso contrario
 * 
 * @example
 * // Encender LED en pin 18
 * pinMode(18, OUTPUT);
 * digitalWrite(18, HIGH);
 * 
 * // Apagar LED
 * digitalWrite(18, LOW);
 */
int digitalWrite(int pin, state_t value);

/**
 * @brief Lee el valor digital de un pin configurado como INPUT
 * @param pin Número del pin GPIO
 * @return 1 si el pin está en HIGH, 0 si está en LOW, -1 en caso de error
 * 
 * @example
 * // Leer estado de un botón en pin 21
 * pinMode(21, INPUT);
 * int button_state = digitalRead(21);
 * if (button_state == HIGH) {
 *     printf("Botón presionado\n");
 * }
 */
int digitalRead(int pin);

/**
 * @brief Hace parpadear un LED con frecuencia y duración específicas (BLOQUEANTE)
 * @param pin Número del pin GPIO donde está conectado el LED
 * @param freq Frecuencia en Hz (parpadeos por segundo)
 * @param duration Duración total en segundos
 * 
 * @note Esta función es BLOQUEANTE - el programa se detiene hasta que termine
 * @note Para uso no bloqueante, usar blinkStart() y blinkStop()
 * 
 * @example
 * // Parpadear LED en pin 18 a 2Hz durante 5 segundos (BLOQUEANTE)
 * pinMode(18, OUTPUT);
 * blink(18, 2, 5);  // El programa se pausa aquí por 5 segundos
 * 
 * // Parpadeo rápido: 10Hz durante 2 segundos
 * blink(18, 10, 2); // 20 parpadeos total
 */
void blink(int pin, int freq, int duration);

/**
 * @brief Inicia parpadeo no bloqueante en background
 * @param pin Número del pin GPIO donde está conectado el LED
 * @param freq Frecuencia en Hz (parpadeos por segundo)
 * @param duration Duración total en segundos
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @note Esta función es NO BLOQUEANTE - el programa continúa inmediatamente
 * @note El parpadeo se ejecuta en un thread separado
 * 
 * @example
 * // Parpadear LED mientras se ejecuta otro código
 * pinMode(17, OUTPUT);
 * blinkStart(17, 3, 10);  // Parpadear 3Hz por 10 segundos
 * 
 * // Continuar con otro código inmediatamente
 * printf("El LED está parpadeando en background\n");
 * 
 * // Opcional: detener antes de que termine
 * sleep(5);
 * blinkStop(17);  // Detener después de 5 segundos
 */
int blinkStart(int pin, int freq, int duration);

/**
 * @brief Detiene el parpadeo no bloqueante en un pin
 * @param pin Número del pin GPIO
 * @return 0 si es exitoso, -1 si no hay parpadeo activo en el pin
 * 
 * @example
 * // Parpadeo con control manual
 * blinkStart(18, 5, 60);  // Parpadear por 1 minuto
 * sleep(10);              // Esperar 10 segundos
 * blinkStop(18);          // Detener anticipadamente
 */
int blinkStop(int pin);

/**
 * @brief Escribe un valor PWM (duty cycle) en un pin configurado como PWM
 * @param pin Número del pin PWM (12, 13, 18, 19)
 * @param duty_cycle Ciclo de trabajo (0-1024, donde 1024 = 100%)
 * @return 0 si es exitoso, código de error del sistema en caso contrario
 * 
 * @example
 * // Control de servo en pin 12
 * pinMode(12, PWM);
 * pwmSetFrequency(12, 50);  // 50Hz para servos
 * pwmWrite(12, 77);         // ~1.5ms pulse (posición central)
 * 
 * // Control de velocidad de motor en pin 18
 * pinMode(18, PWM);
 * pwmWrite(18, 512);        // 50% velocidad
 * pwmWrite(18, 1024);       // 100% velocidad
 * pwmWrite(18, 0);          // Motor detenido
 */
int pwmWrite(int pin, int duty_cycle);

/**
 * @brief Configura la frecuencia de PWM para un pin
 * @param pin Número del pin PWM (12, 13, 18, 19)
 * @param frequency Frecuencia en Hz
 * @return 0 si es exitoso, código de error del sistema en caso contrario
 * 
 * @example
 * // Configurar PWM para servo (50Hz)
 * pinMode(12, PWM);
 * pwmSetFrequency(12, 50);
 * 
 * // Configurar PWM para control de motor (1000Hz)
 * pinMode(18, PWM);
 * pwmSetFrequency(18, 1000);
 * 
 * // PWM para dimmer de LED (500Hz)
 * pinMode(13, PWM);
 * pwmSetFrequency(13, 500);
 */
int pwmSetFrequency(int pin, int frequency);

/**
 * @brief Detiene la señal PWM en un pin
 * @param pin Número del pin PWM (12, 13, 18, 19)
 * @return 0 si es exitoso, código de error del sistema en caso contrario
 * 
 * @example
 * // Detener servo
 * pwmStop(12);
 * 
 * // Detener motor y cambiar a modo digital
 * pwmStop(18);
 * pinMode(18, OUTPUT);
 * digitalWrite(18, LOW);
 */
int pwmStop(int pin);

/**
 * @brief Genera PWM por software en cualquier pin GPIO
 * @param pin Número del pin GPIO (0-21)
 * @param duty_cycle Ciclo de trabajo (0-100)
 * @param frequency Frecuencia en Hz
 * @param duration_ms Duración en milisegundos (0 = infinito)
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @note Esta función es BLOQUEANTE si duration_ms > 0
 * @note Para uso no bloqueante, usar softPwmStart() y softPwmStop()
 * 
 * @example
 * // PWM software en pin 21 (50% duty, 1000Hz, 5 segundos)
 * pinMode(21, OUTPUT);
 * softPwm(21, 50, 1000, 5000);
 * 
 * // Dimmer LED suave
 * for(int brightness = 0; brightness <= 100; brightness += 10) {
 *     softPwm(21, brightness, 500, 200); // 200ms cada nivel
 * }
 */
int softPwm(int pin, int duty_cycle, int frequency, int duration_ms);

/**
 * @brief Inicia PWM software en background (no bloqueante)
 * @param pin Número del pin GPIO (0-21)
 * @param duty_cycle Ciclo de trabajo (0-100)
 * @param frequency Frecuencia en Hz
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @example
 * // Iniciar PWM continuo en pin 20
 * pinMode(20, OUTPUT);
 * softPwmStart(20, 75, 2000);  // 75% duty, 2kHz
 * 
 * // Cambiar duty cycle sobre la marcha
 * softPwmUpdateDuty(20, 25);   // Cambiar a 25%
 * 
 * // Detener cuando se necesite
 * softPwmStop(20);
 */
int softPwmStart(int pin, int duty_cycle, int frequency);

/**
 * @brief Actualiza el duty cycle de un PWM software activo
 * @param pin Número del pin GPIO
 * @param duty_cycle Nuevo ciclo de trabajo (0-100)
 * @return 0 si es exitoso, -1 si el pin no tiene PWM activo
 * 
 * @example
 * // Control dinámico de velocidad de motor
 * softPwmStart(20, 0, 1000);
 * for(int speed = 0; speed <= 100; speed += 5) {
 *     softPwmUpdateDuty(20, speed);
 *     usleep(100000); // 100ms entre cambios
 * }
 */
int softPwmUpdateDuty(int pin, int duty_cycle);

/**
 * @brief Detiene PWM software en un pin
 * @param pin Número del pin GPIO
 * @return 0 si es exitoso, -1 si el pin no tiene PWM activo
 * 
 * @example
 * // Detener PWM software y apagar pin
 * softPwmStop(20);
 * digitalWrite(20, LOW);
 */
int softPwmStop(int pin);

/**
 * @brief Configura un servo en un pin PWM hardware
 * @param pin Número del pin PWM hardware (12, 13, 18, 19)
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @note Configura el PWM a 50Hz (20ms de período) estándar para servos
 * 
 * @example
 * // Configurar servo en pin 12
 * servoInit(12);
 */
int servoInit(int pin);

/**
 * @brief Mueve un servo a un ángulo específico
 * @param pin Número del pin PWM donde está conectado el servo
 * @param angle Ángulo en grados (0-180, pero se puede limitar)
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @note Convierte automáticamente el ángulo a ancho de pulso PWM
 * @note Ángulo 0° = 1ms, 90° = 1.5ms, 180° = 2ms
 * 
 * @example
 * // Controlar servo de dirección (65° a 115°)
 * servoInit(12);
 * servoWrite(12, 90);   // Centro
 * servoWrite(12, 65);   // Máximo izquierda
 * servoWrite(12, 115);  // Máximo derecha
 */
int servoWrite(int pin, int angle);

/**
 * @brief Mueve un servo con rango limitado (para aplicaciones específicas)
 * @param pin Número del pin PWM donde está conectado el servo
 * @param angle Ángulo en grados dentro del rango permitido
 * @param min_angle Ángulo mínimo permitido
 * @param max_angle Ángulo máximo permitido
 * @return 0 si es exitoso, -1 si el ángulo está fuera del rango
 * 
 * @example
 * // Servo de dirección limitado (65° a 115°)
 * servoInit(12);
 * servoWriteLimited(12, 90, 65, 115);   // Centro
 * servoWriteLimited(12, 65, 65, 115);   // Izquierda
 * servoWriteLimited(12, 115, 65, 115);  // Derecha
 * servoWriteLimited(12, 45, 65, 115);   // ERROR: fuera de rango
 */
int servoWriteLimited(int pin, int angle, int min_angle, int max_angle);

/**
 * @brief Detiene un servo (coloca en posición neutra)
 * @param pin Número del pin PWM donde está conectado el servo
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @example
 * // Detener servo y dejarlo en centro
 * servoStop(12);
 */
int servoStop(int pin);

/**
 * @brief Configura un servo usando PWM software (funciona en cualquier pin)
 * @param pin Número del pin GPIO (0-27)
 * @param frequency Frecuencia en Hz (normalmente 50Hz para servos)
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @example
 * // Configurar servo en pin 22 con PWM software
 * servoSoftInit(22, 50);
 */
int servoSoftInit(int pin, int frequency);

/**
 * @brief Mueve un servo usando PWM software a un ángulo específico
 * @param pin Número del pin GPIO donde está conectado el servo
 * @param angle Ángulo en grados (0-180)
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @example
 * // Controlar servo con PWM software
 * servoSoftInit(22, 50);
 * servoSoftWrite(22, 90);   // Centro
 * servoSoftWrite(22, 0);    // Izquierda
 * servoSoftWrite(22, 180);  // Derecha
 */
int servoSoftWrite(int pin, int angle);

/**
 * @brief Mueve un servo software con rango limitado
 * @param pin Número del pin GPIO donde está conectado el servo
 * @param angle Ángulo en grados dentro del rango permitido
 * @param min_angle Ángulo mínimo permitido
 * @param max_angle Ángulo máximo permitido
 * @return 0 si es exitoso, -1 si el ángulo está fuera del rango
 * 
 * @example
 * // Servo de dirección con PWM software limitado (65° a 115°)
 * servoSoftInit(22, 50);
 * servoSoftWriteLimited(22, 90, 65, 115);   // Centro
 * servoSoftWriteLimited(22, 65, 65, 115);   // Izquierda
 * servoSoftWriteLimited(22, 115, 65, 115);  // Derecha
 */
int servoSoftWriteLimited(int pin, int angle, int min_angle, int max_angle);

/**
 * @brief Detiene un servo con PWM software
 * @param pin Número del pin GPIO donde está conectado el servo
 * @return 0 si es exitoso, código de error en caso contrario
 * 
 * @example
 * // Detener servo software
 * servoSoftStop(22);
 */
int servoSoftStop(int pin);

#endif // GPIO_LIB_H
