# Daniel Armoni's Projects

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ESP32](https://img.shields.io/badge/Platform-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Arduino](https://img.shields.io/badge/Framework-Arduino-green.svg)](https://www.arduino.cc/)
[![PlatformIO](https://img.shields.io/badge/IDE-PlatformIO-orange.svg)](https://platformio.org/)

A collection of ESP32-based robotics, IoT, and automation projects featuring wireless communication, sensor integration, and motor control systems.

## 🎯 Projects Overview

### 🤖 Robot Platform
**Location:** `Robot-Platform/`

A comprehensive ESP32-based robotics platform with dual microcontroller architecture:

#### Motors & Bluetooth Control (`motors-and-bp/`)
- **Framework:** ESP-IDF + Arduino + Bluepad32
- **Features:**
  - Wireless gamepad control via Bluetooth
  - Motor control and movement systems
  - Real-time controller input processing
  - OTA (Over-The-Air) update capability
- **Hardware:** ESP32 with motor drivers and Bluetooth gamepad support
- **Libraries:** Bluepad32, BTStack, Arduino Core for ESP32

#### Sensors & Monitoring (`sensors-and-monitor/`)
- **Framework:** PlatformIO + Arduino
- **Features:**
  - IMU (MPU6050) for motion tracking and orientation
  - Hall sensors for rotational/linear movement counting
  - Wireless data transmission via WebSocket
  - Captive portal for easy device connection
  - Real-time web-based monitoring interface
- **Hardware:** ESP32, MPU6050 IMU, Hall sensors

### 🎛️ Servo Tray Controller
**Location:** `Tray/`

A precision servo control system for tray positioning and automation:

- **Framework:** Arduino IDE
- **Features:**
  - Multi-servo control via PCA9685 PWM driver
  - I²C communication protocol
  - Precise positioning control
- **Hardware:** ESP32, PCA9685 PWM Servo Driver, multiple servos
- **Use Cases:** Automated tray systems, precision positioning

## 🚀 Quick Start

### Prerequisites

- **Hardware:**
  - ESP32 development boards
  - Various sensors (MPU6050, Hall sensors)
  - Servo motors and PCA9685 driver
  - Motor drivers
  - Bluetooth gamepad (for robot control)

- **Software:**
  - [PlatformIO IDE](https://platformio.org/) or [Arduino IDE](https://www.arduino.cc/en/software)
  - [ESP-IDF v4.4.x](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/) (for Robot Platform)
  - Git for version control

### Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone --recursive https://github.com/dani6464/Daniel-Armoni-s-Projects.git
   cd Daniel-Armoni-s-Projects
   ```

2. **Choose Your Project:**
   - For **Robot Platform**: Navigate to `Robot-Platform/motors-and-bp/` or `Robot-Platform/sensors-and-monitor/`
   - For **Servo Tray**: Navigate to `Tray/`

3. **Install Dependencies:**
   - **PlatformIO:** Open the project folder in PlatformIO IDE
   - **Arduino IDE:** Install required libraries as specified in each project's README

4. **Build and Upload:**
   - Follow the specific build instructions in each project's directory
   - Flash to your ESP32 device

## 🔧 Hardware Configuration

### Robot Platform - Motors & BP
```
ESP32 → Motor Drivers → Motors
ESP32 → Bluetooth Module → Gamepad Controller
```

### Robot Platform - Sensors & Monitor
```
ESP32 ← MPU6050 (I²C: SDA/SCL)
ESP32 ← Hall Sensor 1 (GPIO 25)
ESP32 ← Hall Sensor 2 (GPIO 26)
ESP32 → Wi-Fi Access Point
```

### Servo Tray Controller
```
ESP32 → PCA9685 PWM Driver → Multiple Servos
SDA: GPIO 21 (I²C Data)
SCL: GPIO 22 (I²C Clock)
```

## 📊 Features & Capabilities

- **🎮 Wireless Control:** Bluetooth gamepad integration for robot control
- **📡 IoT Connectivity:** Wi-Fi access point and WebSocket communication
- **🔄 Real-time Monitoring:** Live sensor data visualization
- **⚡ Motor Control:** Precision motor and servo control systems
- **🌐 Web Interface:** Embedded web pages with captive portal
- **📱 Mobile Friendly:** Responsive web interface for mobile devices
- **🔄 OTA Updates:** Over-the-air firmware update capability

## 🛠️ Development

### Project Structure
```
Daniel-Armoni-s-Projects/
├── Robot-Platform/
│   ├── motors-and-bp/          # Motor control & Bluetooth
│   │   ├── components/         # ESP-IDF components
│   │   ├── main/              # Main application code
│   │   ├── lib/               # Custom libraries
│   │   └── platformio.ini     # PlatformIO configuration
│   └── sensors-and-monitor/   # Sensor monitoring system
│       ├── src/               # Source code
│       ├── lib/               # Custom libraries
│       └── platformio.ini     # PlatformIO configuration
├── Tray/
│   ├── Tray.ino              # Arduino sketch
│   └── README.md             # Tray-specific documentation
└── README.md                 # This file
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Requirements

### Software Requirements
- ESP-IDF v4.4.x (for Robot Platform)
- PlatformIO or Arduino IDE
- Git with submodule support

### Hardware Requirements
- ESP32 development boards (multiple)
- MPU6050 IMU sensor
- Hall sensors
- PCA9685 PWM Servo Driver
- Servo motors
- Motor drivers
- Bluetooth gamepad
- Jumper wires and breadboards

## 🐛 Troubleshooting

### Common Issues

1. **Compilation Errors:**
   - Ensure ESP-IDF version is 4.4.x (not 5.x)
   - Update git submodules: `git submodule update --init --recursive`

2. **Connection Issues:**
   - Check I²C connections (SDA: GPIO 21, SCL: GPIO 22)
   - Verify power supply stability
   - Ensure proper ground connections

3. **Bluetooth Pairing:**
   - Reset ESP32 and re-pair gamepad
   - Check Bluepad32 configuration
   - Verify gamepad compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Issues:** Report bugs and request features via GitHub Issues
- **Documentation:** Check individual project READMEs for detailed setup instructions
- **Community:** Join discussions in the project discussions section

## 🔗 Related Projects

- [Bluepad32](https://gitlab.com/ricardoquesada/bluepad32/) - Bluetooth gamepad support
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32) - Arduino framework for ESP32
- [PlatformIO](https://platformio.org/) - Professional IDE for embedded development

---

**Built with ❤️ by Daniel Armoni**

