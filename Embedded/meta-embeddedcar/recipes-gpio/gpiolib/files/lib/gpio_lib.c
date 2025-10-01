#define _GNU_SOURCE
#include "../include/gpio_lib.h"


int pinMode(int pin, Mode_t mode) {
    char cmd[64];
    if (mode == INPUT) {
        snprintf(cmd, sizeof(cmd), "raspi-gpio set %d ip", pin);
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

void blink(int pin, int freq, int duration) {
    pinMode(pin, OUTPUT);

    int delayTime = 500000 / freq; // tiempo ON/OFF en microsegundos

    int cycles = freq * duration; // cantidad de parpadeos
    for (int i = 0; i < cycles; i++) {
        digitalWrite(pin, HIGH); // encender
        usleep(delayTime);
        digitalWrite(pin, LOW);  // apagar
        usleep(delayTime);
    }
}
