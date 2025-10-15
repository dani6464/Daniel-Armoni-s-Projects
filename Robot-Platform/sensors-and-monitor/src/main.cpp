#include <Arduino.h>

#include "HallSensors.h"
#include "IMU.h"
#include "WirelessMonitor.h"

WirelessMonitor wm;  // Create a WirelessMonitor object
IMU imu;             // Create an IMU object

int hallSensorPinRight = 25;
int hallSensorPinLeft = 26;

HallSensor hallSensorR(hallSensorPinRight);  // Initialize with pin 25
HallSensor hallSensorL(hallSensorPinLeft);   // Initialize with pin 26

void setup() {
  Serial.begin(9600);  // Initialize serial communication for debugging
  wm.setup();          //  Initialize and setup WirelessMonitor
  imu.begin();         // Initialize and setup IMU using the
  hallSensorR.begin();
  hallSensorL.begin();
}

void loop() {
  wm.loop();   // Run the WirelessMonitor to handle websocket events
  imu.loop();  // Read and parse IMU data

  // Print raw data using WirelessMonitor
  // wm.print("Acceleration X: " + String(imu.getAccelX()));
  // wm.print("Acceleration Y: " + String(imu.getAccelY()));
  // wm.print("Acceleration Z: " + String(imu.getAccelZ()));

  // wm.print("Rotation X: " + String(imu.getGyroX()));
  // wm.print("Rotation Y: " + String(imu.getGyroY()));
  // wm.print("Rotation Z: " + String(imu.getGyroZ()));

  // wm.print("Temperature: " + String(imu.getTemperature()) + " degC");

  wm.print("");  // Print an empty line for separation

  // Alternatively, use the full reading
  // wm.print(imu.getFullReading());

  // Alternatively, use the formatted strings
  wm.print(imu.getAccelerationString());
  wm.print(imu.getRotationString());
  wm.print(imu.getTempString());
  // Print Hall Sensor counts
  wm.print("Counts Sensor R: " + String(hallSensorR.getCount()));
  wm.print("Counts Sensor L: " + String(hallSensorL.getCount()));
  wm.print("");  // Print an empty line for separation

  delay(500);  // delay for half a second
}
