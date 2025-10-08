
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


// Car control structure
typedef struct {
    char movement[16];
    int speed;
    char direction[16];
} CarCommand;

// Global variables
volatile int running = 1;
CarCommand last_command = {"stop", 0, "center"};
char server_ip[16] = "10.90.36.240";  // IP por defecto, puede ser modificada por argumento

// Signal handler for clean shutdown
void signal_handler(int sig) {
    //printf("\n Received signal %d, shutting down gracefully...\n", sig);
    running = 0;
}

// Validar formato básico de IP
int is_valid_ip_format(const char *ip) {
    int dots = 0;
    int digit_count = 0;
    
    for (int i = 0; ip[i] != '\0'; i++) {
        if (ip[i] == '.') {
            if (digit_count == 0 || digit_count > 3) return 0; // No digits before dot or too many
            dots++;
            digit_count = 0;
        } else if (ip[i] >= '0' && ip[i] <= '9') {
            digit_count++;
        } else {
            return 0; // Invalid character
        }
    }
    
    // Should have exactly 3 dots and end with digits
    return (dots == 3 && digit_count > 0 && digit_count <= 3);
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
             "wget -q --timeout=2 --tries=1 \"http://%s:3000/api/car/movement\" -O -", server_ip);
    
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
        
        //printf("Received: %s\n", buffer);
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
    
    // control pins
    pinMode(LED_FORWARD_LEFT, OUTPUT);
    pinMode(LED_FORWARD_RIGHT, OUTPUT);
    pinMode(LED_BACKWARD_LEFT, OUTPUT);
    pinMode(LED_BACKWARD_RIGHT, OUTPUT);
    pinMode(PWM_MOTOR_LEFT_1, OUTPUT);
    pinMode(PWM_MOTOR_LEFT_2, OUTPUT);
    pinMode(PWM_MOTOR_RIGHT_1, OUTPUT);
    pinMode(PWM_MOTOR_RIGHT_2, OUTPUT);
    
    // Initialize servo (hardware PWM)
    servoInit(PWM_SERVO);
    
    // Initialize all LEDS to OFF
    digitalWrite(LED_FORWARD_LEFT, LOW);
    digitalWrite(LED_FORWARD_RIGHT, LOW);
    digitalWrite(LED_BACKWARD_LEFT, LOW);
    digitalWrite(LED_BACKWARD_RIGHT, LOW);
    
    // Initialize all MOTORS to OFF
    softPwmStart(PWM_MOTOR_LEFT_1, 0, 500);
    softPwmStart(PWM_MOTOR_LEFT_2, 0, 500);
    softPwmStart(PWM_MOTOR_RIGHT_1, 0, 500);
    softPwmStart(PWM_MOTOR_RIGHT_2, 0, 500);

    
}



// Función para cambiar frecuencia PWM de motores (para testing)
void set_motor_frequency(int freq) {
    
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
    
    //printf("Frecuencia de motores actualizada a %dHz\n", freq);
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

// Control servo dirección con ángulos específicos (65° a 115°) usando PWM HARDWARE
void set_steering_direction(const char* direction) {
    if (strcmp(direction, "left") == 0) {
        // Girar a la izquierda (65°)
        servoWriteLimited(PWM_SERVO, 65, 65, 115);
    } else if (strcmp(direction, "right") == 0) {
        // Girar a la derecha (115°)
        servoWriteLimited(PWM_SERVO, 115, 65, 115);
    } else {
        // Centro (90°)
        servoWriteLimited(PWM_SERVO, 90, 65, 115);
    }
}

// Execute car movement based on command
void execute_car_command(const CarCommand *cmd) {
    //printf("Executing: movement=%s, speed=%d, direction=%s\n", 
    //       cmd->movement, cmd->speed, cmd->direction);
    
    //stop_all();

    set_steering_direction(cmd->direction);

    // Basic movement control
    if (strcmp(cmd->movement, "forward") == 0) {
        if (strcmp(cmd->direction, "left") == 0) {
            // Forward + Left: Reduce left motor speed or reverse it slightly
            blinkStart(LED_FORWARD_LEFT, 2, 3); // Blink left LED to indicate turn
            blinkStart(LED_BACKWARD_LEFT, 2, 3); // Blink left LED to indicate turn
            
            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);
            
            
            } else if (strcmp(cmd->direction, "right") == 0) {
            // Forward + Right: Reduce right motor speed or reverse it slightly
            blinkStart(LED_FORWARD_RIGHT, 2, 3); // Blink right LED to indicate turn
            blinkStart(LED_BACKWARD_RIGHT, 2, 3); // Blink right LED to indicate turn

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, cmd->speed);
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

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, cmd->speed);

        } else if (strcmp(cmd->direction, "right") == 0) {
            // Backward + Right
            blinkStart(LED_BACKWARD_RIGHT, 2, 3); // Blink right LED to indicate turn
            blinkStart(LED_FORWARD_RIGHT, 2, 3); // Blink right LED to indicate turn

            softPwmUpdateDuty(PWM_MOTOR_LEFT_1, 0);
            softPwmUpdateDuty(PWM_MOTOR_LEFT_2, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_1, cmd->speed);
            softPwmUpdateDuty(PWM_MOTOR_RIGHT_2, 0);

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
        printf("HTTP request failed, stopping car for safety\n");
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
}

int main(int argc, char *argv[]) {

    // Procesar argumentos de línea de comandos (ip default o dada por parámetro)
    if (argc > 1) {
        // Validar formato de IP básico
        if (strlen(argv[1]) < sizeof(server_ip) && is_valid_ip_format(argv[1])) {
            strncpy(server_ip, argv[1], sizeof(server_ip) - 1);
            server_ip[sizeof(server_ip) - 1] = '\0';
            //printf("Usando IP del servidor: %s\n", server_ip);
        } else {
            //printf("❌ Error: Formato de IP inválido '%s'. Usando IP por defecto: %s\n", argv[1], server_ip);
            //printf("Formato esperado: xxx.xxx.xxx.xxx (ejemplo: 192.168.1.100)\n");
        }
    } else {
        //printf("Usando IP por defecto: %s\n", server_ip);
        //printf("Uso: %s [IP_SERVIDOR] (ejemplo: %s 192.168.1.100)\n", argv[0], argv[0]);
    }
    
    // Install signal handlers for clean shutdown
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);
    
    // Initialize GPIO
    init_gpio_pins();

    // Setup periodic timer
    setup_timer();
    
  
    // Main loop - just wait for signals
    while (running) {
        sleep(1);
    }
    
    // Cleanup
    //printf("\n🧹 Cleaning up...\n");
    stop_all();
    
    // Detener servo HARDWARE PWM y centrarlo
    set_steering_direction("center");
    usleep(500000); // Esperar 500ms para que alcance la posición
    servoStop(PWM_SERVO);
    
    return 0;
}
