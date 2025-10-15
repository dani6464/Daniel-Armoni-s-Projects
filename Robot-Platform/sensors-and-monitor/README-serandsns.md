# ESP32 Wireless Monitoring System with IMU and Hall Sensors

This project implements a wireless monitoring system on an ESP32, featuring:

- An Inertial Measurement Unit (IMU) for motion tracking  
- Hall sensors for counting rotational or linear movements  
- A captive portal for easy connection  
- Embedded web pages (HTML/CSS/JS) served directly from the ESP32  

The goal is to gather, process, and transmit sensor data wirelessly for remote monitoring, suitable for applications in robotics, IoT, and more.



## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)



## Project Overview

The **ESP32 Wireless Monitoring System** collects data from:
- An **MPU6050** IMU for acceleration, rotation, and temperature readings.
- Two **Hall sensors** for counting events (e.g., rotations on pins 25 and 26).

All data is processed on the ESP32 and broadcast via a WebSocket server over Wi-Fi. A simple captive portal is also included to guide devices to a web interface hosted on the ESP32, where real-time sensor data can be monitored.



## Features

1. **Real-Time IMU Data Acquisition**  
   Collects and processes orientation, motion, and temperature data from the MPU6050.

2. **Hall Sensor Integration**  
   Two Hall sensors are read and their event counts are displayed in real-time.

3. **Wireless Transmission**  
   Transmits data over a Wi-Fi Access Point (AP) created by the ESP32, viewable through a captive portal or a direct IP connection.

4. **Captive Portal**  
   When a device connects to the ESP32’s AP, it is redirected to a local web page with links to the real-time monitor.

5. **Embedded Web Pages**  
   The HTML, CSS, and JS files are embedded in the ESP32’s flash memory, minimizing external file dependencies.

6. **WebSocket Communication**  
   Uses a WebSocket server for efficient, real-time data streaming to connected clients.

7. **Modular Design**  
   Organized code with reusable modules (`WirelessMonitor`, `IMU`, `HallSensors`, `EmbeddedFiles`).



## Requirements

### Hardware
- **ESP32 Development Board**
- **IMU Sensor** (e.g., MPU6050)
- **Hall Sensors** (2x, if using the hall sensor functionality)
- **Wi-Fi** capability (built-in on most ESP32 boards)

### Software
- **[PlatformIO](https://platformio.org/) (recommended)** or Arduino IDE
- **ESP-IDF** or **ESP32 Arduino Core**
- **Required Libraries** (handled automatically by PlatformIO if listed in `platformio.ini`):
  - `AsyncTCP`
  - `ESPAsyncWebServer`
  - `WebSocketsServer`
  - `Adafruit MPU6050`
  - `Adafruit Unified Sensor`



## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/idc-milab/Robot-Platform.git
   ```

2. **Install PlatformIO**  
   - Follow the [PlatformIO installation guide](https://platformio.org/install/cli).

3. **Open the Project**  
   - Open the repository folder in VS Code with the PlatformIO extension installed.

4. **Build and Upload**  
   - Connect your ESP32 board.
   - In the PlatformIO terminal, run:
     ```bash
     pio run --target upload
     ```



## Usage

1. **Power on the ESP32**  
   The ESP32 will start in AP mode with the default SSID `ESP32-AP` and password `12345678` (configurable in `WirelessMonitor.cpp`).

2. **Connect a Device**  
   - Connect your phone or computer to the `ESP32-AP` Wi-Fi network using the password `12345678`.
   - A captive portal may appear automatically. If not, open a web browser and go to `http://serialmonitor.local` (or the ESP32’s IP address).

3. **View Real-Time Data**  
   - The main page (`/`) displays real-time IMU readings and Hall sensor counts via WebSocket.
   - The data auto-scrolls; you can scroll manually to view past messages.

4. **Captive Portal**  
   - Any HTTP request (when connected to the AP) that does not match known endpoints will redirect to a captive portal page with a link to `serialmonitor.local`.



## Configuration

- **Wi-Fi AP Credentials**  
  In `WirelessMonitor.cpp`:
  ```cpp
  const char *ssid = "ESP32-AP";
  const char *password = "12345678";
  ```
  Change these to configure your preferred SSID and password.

- **Hall Sensor Pins**  
  In `main.cpp`:
  ```cpp
  int hallSensorPinRight = 25;
  int hallSensorPinLeft = 26;
  ```
  Adjust these pins as needed.

- **IMU Settings**  
  In `IMU.cpp`, you can change ranges, filter bandwidth, and other MPU6050 settings.



## File Structure

Below is the relevant structure of the project:

```plaintext
├── .pio/                  # PlatformIO build artifacts (auto-generated)
├── docs/
│   ├── Captive.png
│   └── Monitor.png
├── lib/
│   ├── EmbeddedFiles/
│   │   ├── EmbeddedFiles.cpp    # Contains embedded HTML, CSS, JS, and captive portal pages
│   │   └── EmbeddedFiles.h
│   ├── HallSensors/
│   │   ├── HallSensors.cpp      # Hall sensor interrupt handling and counting
│   │   └── HallSensors.h
│   ├── IMU/
│   │   ├── IMU.cpp              # MPU6050 initialization, data reading
│   │   └── IMU.h
│   └── WirelessMonitor/
│       ├── WirelessMonitor.cpp  # Wi-Fi AP setup, WebSocket server, captive portal
│       └── WirelessMonitor.h
├── src/
│   └── main.cpp                 # Entry point; initializes WirelessMonitor, IMU, HallSensors
├── platformio.ini               # PlatformIO configuration
└── README.md                    # This README file
```



## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** this repository.
2. **Create a new branch** for your feature or fix.
3. **Commit** your changes and push them to your fork.
4. **Submit a Pull Request** to this repository’s main branch for review.



## License

This project is licensed under the [MIT License](LICENSE).
