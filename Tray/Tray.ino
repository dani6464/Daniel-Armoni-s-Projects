#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>

int pos_R = 0;
int pos_L = 0;
int pos_M = 0;
const char* ssid = "TRAY";
const char* password = "123456789";
String state = "off";
WebServer server(80);

int servoDelay = 14; // delay Time for servo movement in milliseconds
int targetPos_R = 0;
int targetPos_L = 0; 
int targetPos_M = 0;
unsigned long lastServoMoveTime = 0;
const int motorSyncDelay = 80;

// Create a PCA9685 object
Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

// Define the servo pins (channels on PCA9685)
// R = Right, M = Middle, L = Left
#define SERVO_R_PIN 0
#define SERVO_M_PIN 1 
#define SERVO_L_PIN 2

/*
 * A 2D array for all motors, containing a mapping between the minimum PWM
 * value and the corresponding angle, to the maximum PWM value and its angle.
 *
 * Each motor array is composed as 4 elements:
 * min_pwm, min_angle, max_pwm, max_angle
 */
int SERVO_RANGES[3][4] = {
  { 101, 0, 600, 180 }, // SERVO_R_PIN
  { 101, 0, 653, 330 }, // SERVO_M_PIN
  { 101, 0, 640, 195 }  // SERVO_L_PIN
};

/*
 * 2D array with angle definitions per animation/motion.
 * Each sub-array contains the desired angle for the servo motor (R, L, M).
 * A value of -1 means ignore setting.
 */
int ANIMATION_PRESETS[12][3] = {
  { 135,  45,  -1 },        // Forward
  {  90,  90,  -1 },        // Middle Linear
  {  35, 145,  90 },        // Backwards
  {  -1,  -1,  30 },        // Left (Short)
  {  -1,  -1, 140 },        // Right (Short)
  {  -1,  -1,  90 },        // Middle spin
  {  -1,  -1, 330 },        // Left (Long)
  {  -1,  -1, 235 },        // Right (Long)
  { 135,  45,  30 },        // Left & Forward (Short)
  { 135,  45, 140 },        // Right & Forward (Short)
  { 135,  45, 330 },        // Left & Forward (Long)
  { 135,  45, 235 },        // Right & Forward (Long)
};

// Set requested animation angles.
void setAnimation(int id)
{
  Serial.printf("Setting animation %d\n", id);

  // Protect against invalid animation id.
  if (id < 1 || id > 12) return;

  if (ANIMATION_PRESETS[id - 1][0] != -1) targetPos_R = ANIMATION_PRESETS[id - 1][0];
  if (ANIMATION_PRESETS[id - 1][1] != -1) targetPos_L = ANIMATION_PRESETS[id - 1][1];
  if (ANIMATION_PRESETS[id - 1][2] != -1) targetPos_M = ANIMATION_PRESETS[id - 1][2];
}

void setup(void)
{
  Serial.begin(115200);

  // ----- Configure PCA9685 -----
  Serial.println("PCA9685 Servo Control");
  // Initialize PCA9685
  pwm.begin();
  // Set PWM frequency to 60 Hz (standard for servos)
  pwm.setPWMFreq(60);
  // ----- End Configure PCA9685 -----

  // ----- Move Servos -----
  // Wait a second.
  delay(1000);
  
  // Move servo motors to initial position = backwards.
  setAnimation(3);
  pos_R = ANIMATION_PRESETS[2][0];
  pos_L = ANIMATION_PRESETS[2][1];
  pos_M = ANIMATION_PRESETS[2][2];

  long mappedValue = map(pos_R, 
    SERVO_RANGES[SERVO_R_PIN][1], SERVO_RANGES[SERVO_R_PIN][3],
    SERVO_RANGES[SERVO_R_PIN][0], SERVO_RANGES[SERVO_R_PIN][2]);
  pwm.setPWM(SERVO_R_PIN, 0, mappedValue);
  mappedValue = map(pos_L, 
    SERVO_RANGES[SERVO_L_PIN][1], SERVO_RANGES[SERVO_L_PIN][3],
    SERVO_RANGES[SERVO_L_PIN][0], SERVO_RANGES[SERVO_L_PIN][2]);
  pwm.setPWM(SERVO_L_PIN, 0, mappedValue);
  mappedValue = map(pos_M, 
    SERVO_RANGES[SERVO_M_PIN][1], SERVO_RANGES[SERVO_M_PIN][3],
    SERVO_RANGES[SERVO_M_PIN][0], SERVO_RANGES[SERVO_M_PIN][2]);
  pwm.setPWM(SERVO_M_PIN, 0, mappedValue);
  
  // Let motors reach desired position, wait a second.
  delay(1000);
  // ----- End Move Servos -----

  // Connect to Wi-Fi network with SSID and password
  Serial.print("Setting AP (Access Point)…");
  // Remove the password parameter, if you want the AP (Access Point) to be open
  WiFi.softAP(ssid, password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  server.on("/", handleRoot);

  // ----- Register Web Handlers -----
  server.on("/1", []() { // Forward
      setAnimation(1);
      Serial.println("1");
      handleRoot();
  }); 

  server.on("/2", []() { // Middle Linear
    setAnimation(2);
    Serial.println("2");
    handleRoot();
  });

  server.on("/3", []() { // Backwards
    setAnimation(3);
    Serial.println("3");
    handleRoot(); 
  });

  server.on("/4", []() { // Left (Short)
    setAnimation(4);
    Serial.println("4");
    handleRoot();
  });

  server.on("/5", []() { // Right (Short)
    setAnimation(5);
    Serial.println("5");
    handleRoot();
  });

  server.on("/6", []() { // Middle spin
    setAnimation(6);
    Serial.println("6");
    handleRoot();
  });

  server.on("/7", []() { // Left (Long)
    setAnimation(7);
    Serial.println("7");
    handleRoot();
  });

  server.on("/8", []() { // Right (Long)
    setAnimation(8);
    Serial.println("8");
    handleRoot();
  });

  server.on("/9", []() { // Left & Forward (Short)
    setAnimation(9);
    Serial.println("9");
    handleRoot();
  }); 

  server.on("/10", []() { // Right & Forward (Short)
    setAnimation(10);
    Serial.println("10");
    handleRoot();
  }); 

  server.on("/11", []() { // Left & Forward (Long)
    setAnimation(11);
    Serial.println("11");
    handleRoot();
  }); 

  server.on("/12", []() { // Right & Forward (Long)
    setAnimation(12);
    Serial.println("12");
    handleRoot();
  });

  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
}

void loop(void) {
  server.handleClient();
  delay(2); // allow the cpu to switch to other tasks
  moveServo();

  if (Serial.available())
  {
    long val = Serial.parseInt();

    // Send commands to specific motor.
    if (val >= 1000 && val < 2000)
    {
      targetPos_R = val - 1000;
      handleRoot();
      return;
    }
    else if (val >= 2000 && val < 3000)
    {
      targetPos_L = val - 2000;
      handleRoot();
      return;
    }
    else if (val >= 3000 && val < 4000)
    {
      targetPos_M = val - 3000;
      handleRoot();
      return;
    }

    switch (val)
    {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        setAnimation(val);
        Serial.printf("doing %d\n", val);
        handleRoot();
        break;
    };
  }
}

void handleRoot() {
  // User interface - buttons
  String htmlContent = "<!DOCTYPE html>\n";
  htmlContent += "<html lang=\"en\">";
  htmlContent += "<head>";
  htmlContent += "    <meta charset=\"UTF-8\">";
  htmlContent += "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"";
  htmlContent += "    <title>TRAY</title>";
  htmlContent += "    <style>";
  htmlContent += "        body {";
  htmlContent += "            display: flex;";
  htmlContent += "            justify-content: center;";
  htmlContent += "            align-items: center;";
  htmlContent += "            height: 100vh;";
  htmlContent += "            font-family: 'Times New Roman', serif;";
  htmlContent += "            margin: 0;";
  htmlContent += "            padding: 0;";
  htmlContent += "            background-color: #C8C1C1;";
  htmlContent += "        }";
  htmlContent += "        .container {";
  htmlContent += "            text-align: center;";
  htmlContent += "        }";
  htmlContent += "        h1 {";
  htmlContent += "            font-size: 35px;";
  htmlContent += "            color: #2c3e50;";
  htmlContent += "            margin-bottom: 30px;";
  htmlContent += "        }";
  htmlContent += "        h2 {";
  htmlContent += "            font-size: 22px;";
  htmlContent += "            color: #2c3e50;";
  htmlContent += "            margin-bottom: 10px;";
  htmlContent += "            text-decoration: underline;";
  htmlContent += "        }";
  htmlContent += "        button {";
  htmlContent += "            font-size: 20px;";
  htmlContent += "            padding: 16px 30px;";
  htmlContent += "            margin: 10px;";
  htmlContent += "            cursor: pointer;";
  htmlContent += "            border: 2px solid #2c3e50;";
  htmlContent += "            border-radius: 10px;";
  htmlContent += "            background-color: #ecf0f1;";
  htmlContent += "            color: #2c3e50;";
  htmlContent += "            transition: all 0.3s ease;";
  htmlContent += "            min-width: 200px;";
  htmlContent += "        }";
  htmlContent += "        button:hover {";
  htmlContent += "            background-color: #bdc3c7;";
  htmlContent += "        }";
  htmlContent += "        .columns {";
  htmlContent += "            display: flex;";
  htmlContent += "            justify-content: center;";
  htmlContent += "            gap: 60px;";
  htmlContent += "            flex-wrap: wrap;";
  htmlContent += "            margin-top: 30px;";
  htmlContent += "        }";
  htmlContent += "        .column {";
  htmlContent += "            display: flex;";
  htmlContent += "            flex-direction: column;";
  htmlContent += "            align-items: center;";
  htmlContent += "        }";
  htmlContent += "    </style>";
  htmlContent += "</head>";
  htmlContent += "<body>";
  htmlContent += "    <div class=\"container\">";
  htmlContent += "        <h1>ROBOTIC TRAY</h1>";
  htmlContent += "        <div class=\"columns\">";
  htmlContent += "            <!-- Column 1 -->";
  htmlContent += "            <div class=\"column\">";
  htmlContent += "                <h2>Forwards / Backwards</h2>";
  htmlContent += "                <button id=\"button3\" onclick=\"toggleButton(this, 3)\">Backwards</button>";
  htmlContent += "                <button id=\"button1\" onclick=\"toggleButton(this, 1)\">Forward</button>";
  htmlContent += "            </div>";
  htmlContent += "            <!-- Column 2 -->";
  htmlContent += "            <div class=\"column\">";
  htmlContent += "                <h2>Rotate</h2>";
  htmlContent += "                <button id=\"button3\" onclick=\"toggleButton(this, 3)\">Backwards</button>";
  htmlContent += "                <button id=\"button4\" onclick=\"toggleButton(this, 4)\">Wooden Parts</button>";
  htmlContent += "                <button id=\"button8\" onclick=\"toggleButton(this, 8)\">Top Part</button>";
  htmlContent += "                <button id=\"button7\" onclick=\"toggleButton(this, 7)\">Glue</button>";
  htmlContent += "                <button id=\"button5\" onclick=\"toggleButton(this, 5)\">Tape</button>";
  htmlContent += "            </div>";
  htmlContent += "            <!-- Column 3 -->";
  htmlContent += "            <div class=\"column\">";
  htmlContent += "                <h2>Forward + Rotate</h2>";
  htmlContent += "                <button id=\"button3\" onclick=\"toggleButton(this, 3)\">Backwards</button>";
  htmlContent += "                <button id=\"button9\" onclick=\"toggleButton(this, 9)\">Wooden Parts</button>";
  htmlContent += "                <button id=\"button12\" onclick=\"toggleButton(this, 12)\">Top Part</button>";
  htmlContent += "                <button id=\"button11\" onclick=\"toggleButton(this, 11)\">Glue</button>";
  htmlContent += "                <button id=\"button10\" onclick=\"toggleButton(this, 10)\">Tape</button>";
  htmlContent += "            </div>";
  htmlContent += "        </div>";
  htmlContent += "    </div>";
  htmlContent += "    <script>";
  htmlContent += "        function toggleButton(button, id) {";
  htmlContent += "            console.log(id);";
  htmlContent += "            window.location.href = `/${id}`;";
  htmlContent += "        }";
  htmlContent += "    </script>";
  htmlContent += "</body>";
  htmlContent += "</html>";

  server.send(200, "text/html", htmlContent);
}

void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

void moveServo() {
  // Check if it's time to move the servos again
  if ((millis() - lastServoMoveTime >= servoDelay) && 
      (pos_R != targetPos_R || pos_L != targetPos_L || pos_M != targetPos_M)) {
    
    lastServoMoveTime = millis(); // Update the last time the servo moved

    // Move the first servo towards the target position
    if (pos_R != targetPos_R) {
      if (pos_R > targetPos_R) {
        pos_R = pos_R - 1;
      } else {
        pos_R = pos_R + 1;
      }

      long mappedValue = map((pos_R >= 0) ? pos_R : pos_R + 180, 
        SERVO_RANGES[SERVO_R_PIN][1], SERVO_RANGES[SERVO_R_PIN][3],
        SERVO_RANGES[SERVO_R_PIN][0], SERVO_RANGES[SERVO_R_PIN][2]);
      //Serial.printf("Mapping to %d\n", mappedValue);
      pwm.setPWM(SERVO_R_PIN, 0, mappedValue);
      //myservo.write(pos);
    }

    // Move the second servo towards the target position
    if (pos_L != targetPos_L) {
      if (pos_L > targetPos_L) {
        pos_L = pos_L - 1;
      } else {
        pos_L = pos_L + 1;
      }

      long mappedValue = map((pos_L >= 0) ? pos_L : pos_L + 180, 
        SERVO_RANGES[SERVO_L_PIN][1], SERVO_RANGES[SERVO_L_PIN][3],
        SERVO_RANGES[SERVO_L_PIN][0], SERVO_RANGES[SERVO_L_PIN][2]);
      //Serial.printf("Mapping to %d\n", mappedValue);
      pwm.setPWM(SERVO_L_PIN, 0, mappedValue);
      // myservo2.write(pos2);
    }

    // Move the third servo towards the target position
    if (pos_M != targetPos_M) {
      if (pos_M > targetPos_M) {
        pos_M = pos_M - 1;
      } else {
        pos_M = pos_M + 1;
      }

      long mappedValue = map((pos_M >= 0) ? pos_M : pos_M + 180, 
        SERVO_RANGES[SERVO_M_PIN][1], SERVO_RANGES[SERVO_M_PIN][3],
        SERVO_RANGES[SERVO_M_PIN][0], SERVO_RANGES[SERVO_M_PIN][2]);
      //Serial.printf("Mapping to %d\n", mappedValue);
      pwm.setPWM(SERVO_M_PIN, 0, mappedValue);

      // myservo3.write(pos3);
    }

    Serial.printf("T Pos 1 = %03d, Pos 2 = %03d, Pos 3 = %03d\n", targetPos_R, targetPos_L, targetPos_M);
    Serial.printf("Pos 1 = %03d, Pos 2 = %03d, Pos 3 = %03d\n", 
      (pos_R >= 0) ? pos_R : pos_R + 180, 
      (pos_L >= 0) ? pos_L : pos_L + 180, 
      (pos_M >= 0) ? pos_M : pos_M + 180);
  }
}