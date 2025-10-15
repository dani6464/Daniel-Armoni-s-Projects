TRAY project:
Updated version - "Trail_0deg.ino" 

## Required Libraries

Adafruit PWM Servo Driver Library @ 3.0.2

- https://docs.arduino.cc/libraries/adafruit-pwm-servo-driver-library/
- https://github.com/adafruit/Adafruit-PWM-Servo-Driver-Library



## ESP32 to PCA9685 Wiring

Connect the ESP32 pins to the PCA9685 module as shown:

VCC (PCA9685) → 3.3 V (or 5 V) power input

GND → GND (common ground between ESP32 and PCA9685)

SDA → GPIO 21 (I²C data line)

SCL → GPIO 22 (I²C clock line)

OE → GND (pull low to enable PWM outputs)

Servo Power & Signal

V+ terminal: servo +5V (red)

GND terminal: servo GND (black)

PWM pins: signal (yellow/white) from PCA9685 channel to servo control wire
