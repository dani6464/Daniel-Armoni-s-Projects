// HallSensor.h

#ifndef HALL_SENSOR_H
#define HALL_SENSOR_H

#include <Arduino.h>

class HallSensor {
 public:
  // Constructor to initialize the hall sensor with a specific pin
  HallSensor(uint8_t pin);

  // Initialize the sensor pin and attach the interrupt
  void begin();

  // Get the current count of the sensor
  unsigned long getCount() const;

  // Reset the sensor count
  void resetCount();

 private:
  uint8_t pin;                   // GPIO pin for the hall sensor
  volatile unsigned long count;  // Count of triggers

  // Static ISR handler to handle the interrupt and increment count
  static void IRAM_ATTR handleInterrupt(void* arg);
};

#endif  // HALL_SENSOR_H
