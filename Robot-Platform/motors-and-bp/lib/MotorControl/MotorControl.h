#ifndef MOTOR_CONTROL_H
#define MOTOR_CONTROL_H

#include <Arduino.h>

void forwardRight(int speed);
void forwardLeft(int speed);
void reverseRight(int speed);
void reverseLeft(int speed);
void brakeRight();
void brakeLeft();

#endif
