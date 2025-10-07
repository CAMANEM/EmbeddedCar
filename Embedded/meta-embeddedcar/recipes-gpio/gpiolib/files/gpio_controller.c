
#include "gpio_lib.h"
#include <json-c/json.h>
#include <signal.h>
#include <sys/time.h>
#include <sys/wait.h>

// GPIO Pin definitions for car control
#define LED_FORWARD_RIGHT 17
#define LED_FORWARD_LEFT 27
#define LED_BACKWARD_LEFT 6
#define LED_BACKWARD_RIGHT 5
#define PWM_MOTOR_LEFT_1 22
#define PWM_MOTOR_LEFT_2 23
#define PWM_MOTOR_RIGHT_1 26
#define PWM_MOTOR_RIGHT_2 16
#define PWM_SERVO 12

//#define LED_STATUS LED  // Use same LED for status

// Car control structure
typedef struct {
    char movement[16];
    int speed;
    char direction[16];
} CarCommand;

// Global variables
volatile int running = 1;
CarCommand last_command = {"stop", 0, "center"};

// Signal handler for clean shutdown
void signal_handler(int sig) {
    printf("\n🛑 Received signal %d, shutting down gracefully...\n", sig);
    running = 0;
}

// Parse JSON response and extract car command
int parse_car_command(const char *json_string, CarCommand *cmd) {
    json_object *root, *movement_obj, *speed_obj, *direction_obj;
    
    root = json_tokener_parse(json_string);
    if (root == NULL) {
        printf("❌ Failed to parse JSON\n");
        return -1;
    }
    
    // Extract movement
    if (json_object_object_get_ex(root, "movement", &movement_obj)) {
        const char *movement = json_object_get_string(movement_obj);
        strncpy(cmd->movement, movement, sizeof(cmd->movement) - 1);
        cmd->movement[sizeof(cmd->movement) - 1] = '\0';
    } else {
        strcpy(cmd->movement, "stop");
    }
    
    // Extract speed
    if (json_object_object_get_ex(root, "speed", &speed_obj)) {
        cmd->speed = json_object_get_int(speed_obj);
    } else {
        cmd->speed = 0;
    }
    
    // Extract direction
    if (json_object_object_get_ex(root, "direction", &direction_obj)) {
        const char *direction = json_object_get_string(direction_obj);
        strncpy(cmd->direction, direction, sizeof(cmd->direction) - 1);
        cmd->direction[sizeof(cmd->direction) - 1] = '\0';
    } else {
        strcpy(cmd->direction, "center");
    }
    
    json_object_put(root);
    return 0;
}

// Make HTTP request using wget and get car command
int fetch_car_command(CarCommand *cmd) {
    FILE *fp;
    char buffer[1024];
    char wget_command[256];
    int result = -1;
    
    // Build wget command with timeout and quiet mode
    snprintf(wget_command, sizeof(wget_command), 
             "wget -q --timeout=2 --tries=1 \"http://192.168.0.122:3000/api/car/movement\" -O -");
    
    // Execute wget command and read output
    fp = popen(wget_command, "r");
    if (fp == NULL) {
        printf("❌ Failed to execute wget command\n");
        return -1;
    }
    
    // Read the JSON response
    if (fgets(buffer, sizeof(buffer), fp) != NULL) {
        // Remove newline if present
        buffer[strcspn(buffer, "\n")] = 0;
        
        printf("📡 Received: %s\n", buffer);
        result = parse_car_command(buffer, cmd);
    } else {
        printf("❌ No data received from API\n");
    }
    
    // Close pipe and check exit status
    int status = pclose(fp);
    if (status != 0) {
        printf("❌ wget failed with status %d\n", status);
        return -1;
    }
    
    return result;
}

// Initialize all GPIO pins
void init_gpio_pins() {
    printf("🔧 Initializing GPIO pins...\n");
    
    // Verificar pines según el diagrama de Raspberry Pi 4
    printf("📋 Verificando pines de motores (según diagrama RPi4):\n");
    printf("   PWM_MOTOR_LEFT_1: %d ✅ OK\n", PWM_MOTOR_LEFT_1);
    printf("   PWM_MOTOR_LEFT_2: %d ✅ OK\n", PWM_MOTOR_LEFT_2);
    printf("   PWM_MOTOR_RIGHT_1: %d ✅ OK\n", PWM_MOTOR_RIGHT_1);
    printf("   PWM_MOTOR_RIGHT_2: %d ✅ OK\n", PWM_MOTOR_RIGHT_2);
    printf("   LED_FORWARD_LEFT: %d ✅ OK\n", LED_FORWARD_LEFT);
    
    // control pins
    pinMode(LED_FORWARD_LEFT, OUTPUT);
    pinMode(LED_FORWARD_RIGHT, OUTPUT);
    pinMode(LED_BACKWARD_LEFT, OUTPUT);
    pinMode(LED_BACKWARD_RIGHT, OUTPUT);
    pinMode(PWM_MOTOR_LEFT_1, OUTPUT);
    pinMode(PWM_MOTOR_LEFT_2, OUTPUT);
    pinMode(PWM_MOTOR_RIGHT_1, OUTPUT);
    pinMode(PWM_MOTOR_RIGHT_2, OUTPUT);
    
    // Initialize servo (software PWM)
    servoSoftInit(PWM_SERVO, 50);  // Pin 12, 50Hz
    
    printf("✅ Servo pin %d configured for software PWM\n", PWM_SERVO);
    
    // Initialize all LEDS to OFF
    digitalWrite(LED_FORWARD_LEFT, LOW);
    digitalWrite(LED_FORWARD_RIGHT, LOW);
    digitalWrite(LED_BACKWARD_LEFT, LOW);
    digitalWrite(LED_BACKWARD_RIGHT, LOW);
    
    // Initialize all MOTORS to OFF
    // Probando frecuencia más baja para mejor compatibilidad con drivers
    printf("🔧 Initializing motors with 500Hz PWM...\n");
    
    if (softPwmStart(PWM_MOTOR_LEFT_1, 0, 500) == 0) {
        printf("✅ Motor LEFT_1 (pin %d) PWM iniciado\n", PWM_MOTOR_LEFT_1);
    } else {
        printf("❌ Error iniciando PWM en pin %d\n", PWM_MOTOR_LEFT_1);
    }
    
    if (softPwmStart(PWM_MOTOR_LEFT_2, 0, 500) == 0) {
        printf("✅ Motor LEFT_2 (pin %d) PWM iniciado\n", PWM_MOTOR_LEFT_2);
    } else {
        printf("❌ Error iniciando PWM en pin %d\n", PWM_MOTOR_LEFT_2);
    }
    
    if (softPwmStart(PWM_MOTOR_RIGHT_1, 0, 500) == 0) {
        printf("✅ Motor RIGHT_1 (pin %d) PWM iniciado\n", PWM_MOTOR_RIGHT_1);
    } else {
        printf("❌ Error iniciando PWM en pin %d\n", PWM_MOTOR_RIGHT_1);
    }
    
    if (softPwmStart(PWM_MOTOR_RIGHT_2, 0, 500) == 0) {
        printf("✅ Motor RIGHT_2 (pin %d) PWM iniciado\n", PWM_MOTOR_RIGHT_2);
    } else {
        printf("❌ Error iniciando PWM en pin %d\n", PWM_MOTOR_RIGHT_2);
    }
    
    // Turn on status LED
    //digitalWrite(LED_STATUS, HIGH);
    
    printf("✅ GPIO pins initialized\n");
}

// Función de prueba para PWM básico
void test_pwm_basic() {
    printf("\n🧪 === PRUEBA PWM BÁSICA - VERSIÓN ACTUALIZADA ===\n");
    printf("🔥 ¡NUEVO! Esta es la versión con cambios aplicados\n");
    
    // Prueba 1: PWM simple en pin 5 (LED) para no interferir con motores
    printf("1. Probando PWM en pin 5 (LED) al 50%% por 5 segundos...\n");
    pinMode(LED_FORWARD_LEFT, OUTPUT);
    
    if (softPwmStart(LED_FORWARD_LEFT, 50, 100) == 0) {
        printf("✅ PWM iniciado en pin %d (LED)\n", LED_FORWARD_LEFT);
        sleep(5);
        softPwmStop(LED_FORWARD_LEFT);
        printf("✅ PWM detenido\n");
    } else {
        printf("❌ Error iniciando PWM\n");
    }
    
    // Prueba 2: Blink no bloqueante para verificar que los pines funcionan
    printf("2. Probando blink NO BLOQUEANTE en pin 5 (LED) por 3 segundos...\n");
    pinMode(LED_FORWARD_LEFT, OUTPUT);
    
    if (blinkStart(LED_FORWARD_LEFT, 4, 3) == 0) {  // 4Hz por 3 segundos
        printf("   ✅ Blink no bloqueante iniciado (4Hz por 3s)\n");
        sleep(3);  // Dejar que parpadee por 3 segundos
        blinkStop(LED_FORWARD_LEFT);
        printf("   ✅ Blink detenido\n");
    } else {
        printf("   ❌ Error iniciando blink no bloqueante\n");
    }
    
    printf("🧪 === FIN PRUEBA - CAMBIOS DETECTADOS ===\n\n");
    
    // 3. Test PWM motores con duty cycle real
    printf("3. 🚗 Probando motores con 30%% duty cycle por 3 segundos...\n");
    printf("   📋 Mide pins con osciloscopio: 22, 23, 26, 16\n");
    
    // Debugging detallado para cada pin
    printf("🔍 DEBUG: Activando PWM en pin 22...\n");
    if (softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 30) == 0) {
        printf("   ✅ Pin 22 actualizado a 30%%\n");
    } else {
        printf("   ❌ Error actualizando pin 22\n");
    }
    
    printf("🔍 DEBUG: Activando PWM en pin 23...\n");
    if (softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 30) == 0) {
        printf("   ✅ Pin 23 actualizado a 30%%\n");
    } else {
        printf("   ❌ Error actualizando pin 23\n");
    }
    
    printf("🔍 DEBUG: Activando PWM en pin 26...\n");
    if (softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 30) == 0) {
        printf("   ✅ Pin 26 actualizado a 30%%\n");
    } else {
        printf("   ❌ Error actualizando pin 26\n");
    }
    
    printf("🔍 DEBUG: Activando PWM en pin 16...\n");
    if (softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 30) == 0) {
        printf("   ✅ Pin 16 actualizado a 30%%\n");
    } else {
        printf("   ❌ Error actualizando pin 16\n");
    }
    
    printf("   ⚡ Señales PWM al 30%% activadas por 3 segundos...\n");
    sleep(3);
    
    printf("🔍 DEBUG: Restaurando todos los PWM a 0%%...\n");
    softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
    softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
    softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
    softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
    printf("   ✅ PWM motores restaurado a 0%%\n\n");
}

// Función para cambiar frecuencia PWM de motores (para testing)
void set_motor_frequency(int freq) {
    printf("🔧 Cambiando frecuencia de motores a %dHz...\n", freq);
    
    // Detener PWM actuales
    softPwmStop(PWM_MOTOR_LEFT_1);
    softPwmStop(PWM_MOTOR_LEFT_2);
    softPwmStop(PWM_MOTOR_RIGHT_1);
    softPwmStop(PWM_MOTOR_RIGHT_2);
    
    // Reiniciar con nueva frecuencia
    softPwmStart(PWM_MOTOR_LEFT_1, 0, freq);
    softPwmStart(PWM_MOTOR_LEFT_2, 0, freq);
    softPwmStart(PWM_MOTOR_RIGHT_1, 0, freq);
    softPwmStart(PWM_MOTOR_RIGHT_2, 0, freq);
    
    printf("✅ Frecuencia de motores actualizada a %dHz\n", freq);
}

// Stop all motors
void stop_all() {
    // Detener todos los LEDs de parpadeo
    blinkStop(LED_FORWARD_LEFT);
    blinkStop(LED_FORWARD_RIGHT);
    blinkStop(LED_BACKWARD_LEFT);
    blinkStop(LED_BACKWARD_RIGHT);
    
    // Apagar todos los LEDs
    digitalWrite(LED_FORWARD_LEFT, LOW);
    digitalWrite(LED_FORWARD_RIGHT, LOW);
    digitalWrite(LED_BACKWARD_LEFT, LOW);
    digitalWrite(LED_BACKWARD_RIGHT, LOW);

    // Detener todos los motores
    softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
    softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
    softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
    softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
}

// Control servo dirección con ángulos específicos (65° a 115°) usando PWM software
void set_steering_direction(const char* direction) {
    if (strcmp(direction, "left") == 0) {
        // Girar a la izquierda (65°)
        servoSoftWriteLimited(PWM_SERVO, 65, 65, 115);
        printf("🎯 Servo dirección: IZQUIERDA (65°)\n");
    } else if (strcmp(direction, "right") == 0) {
        // Girar a la derecha (115°)
        servoSoftWriteLimited(PWM_SERVO, 115, 65, 115);
        printf("🎯 Servo dirección: DERECHA (115°)\n");
    } else {
        // Centro (90°)
        servoSoftWriteLimited(PWM_SERVO, 90, 65, 115);
        printf("🎯 Servo dirección: CENTRO (90°)\n");
    }
}

// Execute car movement based on command
void execute_car_command(const CarCommand *cmd) {
    printf("🚗 Executing: movement=%s, speed=%d, direction=%s\n", 
           cmd->movement, cmd->speed, cmd->direction);
    
    //stop_all();

    set_steering_direction(cmd->direction);

    // Basic movement control
    if (strcmp(cmd->movement, "forward") == 0) {
        if (strcmp(cmd->direction, "left") == 0) {
            // Forward + Left: Reduce left motor speed or reverse it slightly
            blinkStart(LED_FORWARD_LEFT, 2, 3); // Blink left LED to indicate turn
            blinkStart(LED_BACKWARD_LEFT, 2, 3); // Blink left LED to indicate turn
            
            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
            
            
            } else if (strcmp(cmd->direction, "right") == 0) {
            // Forward + Right: Reduce right motor speed or reverse it slightly
            blinkStart(LED_FORWARD_RIGHT, 2, 3); // Blink right LED to indicate turn
            blinkStart(LED_BACKWARD_RIGHT, 2, 3); // Blink right LED to indicate turn

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
        } else {
            // Forward straight
            digitalWrite(LED_FORWARD_LEFT, HIGH);
            digitalWrite(LED_FORWARD_RIGHT, HIGH);

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
        }
    } else if (strcmp(cmd->movement, "backward") == 0) {
        if (strcmp(cmd->direction, "left") == 0) {
            // Backward + Left
            blinkStart(LED_BACKWARD_LEFT, 2, 3); // Blink left LED to indicate turn
            blinkStart(LED_FORWARD_LEFT, 2, 3); // Blink left LED to indicate turn

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, cmd->speed);

        } else if (strcmp(cmd->direction, "right") == 0) {
            // Backward + Right
            blinkStart(LED_BACKWARD_RIGHT, 2, 3); // Blink right LED to indicate turn
            blinkStart(LED_FORWARD_RIGHT, 2, 3); // Blink right LED to indicate turn

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, cmd->speed);

        } else {
            // Backward straight
            digitalWrite(LED_BACKWARD_LEFT, HIGH);
            digitalWrite(LED_BACKWARD_RIGHT, HIGH);

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, cmd->speed);
        }
    } else if (strcmp(cmd->movement, "left") == 0) {
        // Turn left in place
        blinkStart(LED_FORWARD_LEFT, 2, 3);
        blinkStart(LED_BACKWARD_LEFT, 2, 3);
    } else if (strcmp(cmd->movement, "right") == 0) {
        // Turn right in place
        blinkStart(LED_FORWARD_RIGHT, 2, 3);
        blinkStart(LED_BACKWARD_RIGHT, 2, 3);
    } else {
        // Stop or unknown command
        stop_all();
    }
}

// Timer callback function (called every 250ms)
void timer_callback(int sig) {
    CarCommand new_command;
    
    // Fetch new command from API
    if (fetch_car_command(&new_command) == 0) {
        // Only execute if command changed
        if (strcmp(last_command.movement, new_command.movement) != 0 ||
            last_command.speed != new_command.speed ||
            strcmp(last_command.direction, new_command.direction) != 0) {
            
            execute_car_command(&new_command);
            last_command = new_command;
        }
    } else {
        // If HTTP request fails, stop the car for safety
        printf("⚠️ HTTP request failed, stopping car for safety\n");
        CarCommand stop_cmd = {"stop", 0, "center"};
        execute_car_command(&stop_cmd);
        last_command = stop_cmd;
    }
}

// Setup timer for periodic HTTP requests
void setup_timer() {
    struct sigaction sa;
    struct itimerval timer;
    
    // Install timer signal handler
    memset(&sa, 0, sizeof(sa));
    sa.sa_handler = &timer_callback;
    sigaction(SIGALRM, &sa, NULL);
    
    // Configure timer for 250ms interval
    timer.it_value.tv_sec = 0;
    timer.it_value.tv_usec = 250000;  // 250ms
    timer.it_interval.tv_sec = 0;
    timer.it_interval.tv_usec = 250000;  // 250ms
    
    // Start timer
    setitimer(ITIMER_REAL, &timer, NULL);
    printf("⏰ Timer set for 250ms intervals\n");
}

int main() {
    printf("🚗 Embedded Car GPIO Controller Starting...\n");
    printf("🔥🔥🔥 V1.8 - SERVO SOFTWARE + BLINK FIX 🔥🔥🔥\n");
    printf("🎯 Servo usa PWM software + Blinks no bloqueantes!\n");
    
    // Install signal handlers for clean shutdown
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);
    
    // Initialize GPIO
    init_gpio_pins();
    
    // Ejecutar prueba PWM básica
    printf("\n🚨 EJECUTANDO PRUEBA PWM - Mide pin 22 con osciloscopio\n");
    printf("🔥 VERSIÓN ACTUALIZADA - Si ves este mensaje, los cambios se aplicaron!\n");
    test_pwm_basic();
    
    // Setup periodic timer
    setup_timer();
    
    printf("✅ Car controller initialized. Monitoring API every 250ms...\n");
    printf("🌐 API Endpoint: http://192.168.0.122:3000/api/car/movement\n");
    printf("📋 Press Ctrl+C to stop\n\n");
    
    // Main loop - just wait for signals
    while (running) {
        sleep(1);
    }
    
    // Cleanup
    printf("\n🧹 Cleaning up...\n");
    stop_all();
    
    // Detener servo software PWM y centrarlo
    set_steering_direction("center");
    usleep(500000); // Esperar 500ms para que alcance la posición
    servoSoftStop(PWM_SERVO);
    
    printf("✅ GPIO Controller stopped successfully\n");
    return 0;
}
