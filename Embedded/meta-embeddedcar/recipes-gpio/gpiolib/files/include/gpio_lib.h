#ifndef GPIO_LIB_H
#define GPIO_LIB_H

#define _GNU_SOURCE

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>


// Pin modes
typedef enum {
    OUTPUT = 0,
    INPUT = 1
} Mode_t;

// Logic levels
typedef enum {
    LOW = 0,
    HIGH = 1
} state_t;

// Funciones principales de la biblioteca GPIO
int pinMode(int pin, Mode_t mode);
int digitalWrite(int pin, state_t value);
int digitalRead(int pin);
void blink(int pin, int freq, int duration);

#endif // GPIO_LIB_H
