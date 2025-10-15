#ifndef IMU_H
#define IMU_H

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

class IMU {
 private:
  Adafruit_MPU6050 mpu;          // MPU6050 object
  sensors_event_t a, g, temp;    // Sensor event variables
  float accelX, accelY, accelZ;  // Parsed acceleration data
  float gyroX, gyroY, gyroZ;     // Parsed gyro data
  float temperature;             // Parsed temperature data

 public:
  IMU();  // Constructor

  void begin();  // Method to initialize the IMU
  void loop();   // Combined method to read and parse data

  // Getter methods to access parsed data
  float getAccelX();
  float getAccelY();
  float getAccelZ();
  float getGyroX();
  float getGyroY();
  float getGyroZ();
  float getTemperature();

  // Methods to return formatted strings
  String getAccelerationString();
  String getRotationString();
  String getTempString();
  String getFullReading();
};

#endif  // IMU_H
