// HallSensor.cpp

#include "HallSensors.h"

// Constructor to initialize the pin and set the count to 0
HallSensor::HallSensor(uint8_t pin) : pin(pin), count(0) {}

// Initialize the sensor pin and attach the interrupt
void HallSensor::begin() {
  pinMode(pin, INPUT_PULLUP);
  attachInterruptArg(digitalPinToInterrupt(pin), handleInterrupt, this,
                     FALLING);
}

// Get the current count of the sensor
unsigned long HallSensor::getCount() const { return count; }

// Reset the sensor count
void HallSensor::resetCount() { count = 0; }

// Static ISR handler
void IRAM_ATTR HallSensor::handleInterrupt(void* arg) {
  HallSensor* sensor = static_cast<HallSensor*>(arg);
  sensor->count++;
}
