#include "IMU.h"

IMU::IMU() {
  // Constructor implementation
}

void IMU::begin() {
  // Initialize the MPU6050
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1) {
      delay(10);
    }
  }
  Serial.println("MPU6050 Found!");
  Serial.println("Setting up IMU");
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  Serial.print("Accelerometer range set to: ");
  switch (mpu.getAccelerometerRange()) {
    case MPU6050_RANGE_2_G:
      Serial.println("+-2G");
      break;
    case MPU6050_RANGE_4_G:
      Serial.println("+-4G");
      break;
    case MPU6050_RANGE_8_G:
      Serial.println("+-8G");
      break;
    case MPU6050_RANGE_16_G:
      Serial.println("+-16G");
      break;
  }

  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  Serial.print("Gyro range set to: ");
  switch (mpu.getGyroRange()) {
    case MPU6050_RANGE_250_DEG:
      Serial.println("+- 250 deg/s");
      break;
    case MPU6050_RANGE_500_DEG:
      Serial.println("+- 500 deg/s");
      break;
    case MPU6050_RANGE_1000_DEG:
      Serial.println("+- 1000 deg/s");
      break;
    case MPU6050_RANGE_2000_DEG:
      Serial.println("+- 2000 deg/s");
      break;
  }

  mpu.setFilterBandwidth(MPU6050_BAND_5_HZ);
  Serial.print("Filter bandwidth set to: ");
  switch (mpu.getFilterBandwidth()) {
    case MPU6050_BAND_260_HZ:
      Serial.println("260 Hz");
      break;
    case MPU6050_BAND_184_HZ:
      Serial.println("184 Hz");
      break;
    case MPU6050_BAND_94_HZ:
      Serial.println("94 Hz");
      break;
    case MPU6050_BAND_44_HZ:
      Serial.println("44 Hz");
      break;
    case MPU6050_BAND_21_HZ:
      Serial.println("21 Hz");
      break;
    case MPU6050_BAND_10_HZ:
      Serial.println("10 Hz");
      break;
    case MPU6050_BAND_5_HZ:
      Serial.println("5 Hz");
      break;
  }

  delay(100);
  Serial.println("IMU setup complete\n");
}

void IMU::loop() {
  mpu.getEvent(&a, &g, &temp);

  // Parse acceleration data
  accelX = a.acceleration.x;
  accelY = a.acceleration.y;
  accelZ = a.acceleration.z;

  // Parse gyro data
  gyroX = g.gyro.x;
  gyroY = g.gyro.y;
  gyroZ = g.gyro.z;

  // Parse temperature data
  temperature = temp.temperature;
}

// Getter methods to access parsed data
float IMU::getAccelX() { return accelX; }
float IMU::getAccelY() { return accelY; }
float IMU::getAccelZ() { return accelZ; }
float IMU::getGyroX() { return gyroX; }
float IMU::getGyroY() { return gyroY; }
float IMU::getGyroZ() { return gyroZ; }
float IMU::getTemperature() { return temperature; }

// Methods to return formatted strings
String IMU::getAccelerationString() {
  return "Acceleration X: " + String(accelX) + ", Y: " + String(accelY) +
         ", Z: " + String(accelZ) + " m/s^2";
}

String IMU::getRotationString() {
  return "Rotation X: " + String(gyroX) + ", Y: " + String(gyroY) +
         ", Z: " + String(gyroZ) + " rad/s";
}

String IMU::getTempString() {
  return "Temperature: " + String(temperature) + " degC";
}

String IMU::getFullReading() {
  return getAccelerationString() + "\n" + getRotationString() + "\n" +
         getTempString();
}
