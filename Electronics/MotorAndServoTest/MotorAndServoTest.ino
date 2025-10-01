#include <Servo.h>

// Servo on pin 9
Servo myServo;

// Motor driver pins
// Motor A direction
const int motorA1 = 4;
const int motorA2 = 5;
// Motor B direction
const int motorB1 = 6;
const int motorB2 = 7;

// Motor speed control (PWM)
const int motorEnable = 11;  // ENA/ENB tied together

void setup() {
  // Attach servo
  myServo.attach(9);

  // Set motor pins as outputs
  pinMode(motorA1, OUTPUT);
  pinMode(motorA2, OUTPUT);
  pinMode(motorB1, OUTPUT);
  pinMode(motorB2, OUTPUT);

  // Set PWM pin
  pinMode(motorEnable, OUTPUT);

  // Start with motors stopped
  stopMotors();
  analogWrite(motorEnable, 0); // speed = 0
}

void loop() {
  // ---- Servo test ----
  myServo.write(35);     // Move to 0 degrees
  delay(1000);
  myServo.write(125);   // Move to 180 degrees
  delay(1000);
  myServo.write(90);    // Return to center
  delay(1000);

  // ---- Motor test ----
  // Forward
  forward();
  analogWrite(motorEnable, 100);  // speed (0-255)
  delay(2000);
  stopMotors();
  analogWrite(motorEnable, 0);
  delay(1000);

  // Backward
  backward();
  analogWrite(motorEnable, 100);  // same speed backward
  delay(2000);
  stopMotors();
  analogWrite(motorEnable, 0);
  delay(1000);
}

// ---- Motor control functions ----
void forward() {
  digitalWrite(motorA1, HIGH);
  digitalWrite(motorA2, LOW);
  digitalWrite(motorB1, HIGH);
  digitalWrite(motorB2, LOW);
}

void backward() {
  digitalWrite(motorA1, LOW);
  digitalWrite(motorA2, HIGH);
  digitalWrite(motorB1, LOW);
  digitalWrite(motorB2, HIGH);
}

void stopMotors() {
  digitalWrite(motorA1, LOW);
  digitalWrite(motorA2, LOW);
  digitalWrite(motorB1, LOW);
  digitalWrite(motorB2, LOW);
}
