/**
   (`\ .-') /`       _  .-')     ('-.              ('-.    .-')     .-') .-')
('-.  _  .-')             ('-.
   `.( OO ),'      ( \( -O )  _(  OO)           _(  OO)  ( OO ).  ( OO ). ( OO
).  _(  OO)( \( -O )           ( OO ).-.
,--./  .--.  ,-.-') ,------. (,------.,--.     (,------.(_)---\_)(_)---\_)
(_)---\_)(,------.,------.  ,-.-')   / . --. / ,--. |      |  |  |  |OO)|   /`.
' |  .---'|  |.-')  |  .---'/    _ | /    _ |       /    _ |  |  .---'|   /`. '
|  |OO)  | \-.  \  |  |.-') |  |   |  |, |  |  \|  /  | | |  |    |  | OO ) |  |
\  :` `. \  :` `.       \  :` `.  |  |    |  /  | | |  |  \.-'-'  |  | |  | OO )
|  |.'.|  |_)|  |(_/|  |_.' |(|  '--. |  |`-' |(|  '--.  '..`''.) '..`''.)
'..`''.)(|  '--. |  |_.' | |  |(_/ \| |_.'  | |  |`-' | |         | ,|  |_.'|  .
'.' |  .--'(|  '---.' |  .--' .-._)   \.-._)   \      .-._)   \ |  .--' |  .
'.',|  |_.'  |  .-.  |(|  '---.' |   ,'.   |(_|  |   |  |\  \  |  `---.|      |
|  `---.\       /\       /      \       / |  `---.|  |\  \(_|  |     |  | |  | |
|
'--'   '--'  `--'   `--' '--' `------'`------'  `------' `-----'  `-----'
`-----'  `------'`--' '--' `--'     `--' `--' `------'
*/

// Headers
#include "WirelessMonitor.h"

#include "EmbeddedFiles.h"

// Constants
// the adderess serial monitor is available at http://serialmonitor.local -- can
// be changed in 'embeddedfiles.cpp'
const char *ssid = "ESP32-AP";
const char *password = "12345678";
const byte DNS_PORT = 53;
const int ws_port = 81;
const int server_port = 80;
const int serial_port = 9600;

// Wireless Monitor Class Implementation
WirelessMonitor::WirelessMonitor()
    : webSocket(ws_port), logBuffer(""), server(server_port) {}

void WirelessMonitor::print(const String &message) {
  Serial.println(message);
  logBuffer += message + "<br>";
  webSocket.broadcastTXT(message.c_str());
}
void WirelessMonitor::setup() {
  // Serial.begin(serial_port);
  initWiFi();
  setupServer();
  initDNS();
  server.begin();
  Serial.println("Server started");
  initmDNS();
  Serial.println("mDNS responder started");
  webSocket.begin();
  webSocket.onEvent(
      [this](uint8_t num, WStype_t type, uint8_t *payload, size_t length) {
        this->onWebSocketEvent(num, type, payload, length);
      });

  Serial.println("WebSocket server started");
  Serial.println("Wireless Monitor setup complete\n");
}
void WirelessMonitor::loop() {
  dnsServer.processNextRequest();
  webSocket.loop();
}

void WirelessMonitor::onWebSocketEvent(uint8_t num, WStype_t type,
                                       uint8_t *payload, size_t length) {
  if (type == WStype_TEXT) {
    Serial.printf("WebSocket[%u] received: %s\n", num, payload);
  } else if (type == WStype_CONNECTED) {
    webSocket.sendTXT(num, logBuffer);
  }
}

void WirelessMonitor::initWiFi() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
}

void WirelessMonitor::setupServer() {
  server.on("/", HTTP_GET, serveIndexHtml);          // Serve the embedded HTML
  server.on("/style.css", HTTP_GET, serveStyleCss);  // Serve the embedded CSS
  server.on("/script.js", HTTP_GET, serveScriptJs);  // Serve the embedded JS

  server.addHandler(new CaptivePortalHandler()).setFilter(ON_AP_FILTER);

  server.onNotFound([&](AsyncWebServerRequest *request) {
    request->send(200, "text/html", captive_html);
  });
}

void WirelessMonitor::initDNS() {
  dnsServer.setErrorReplyCode(DNSReplyCode::NoError);
  dnsServer.setTTL(300);
  dnsServer.start(DNS_PORT, "*", WiFi.softAPIP());
}

void WirelessMonitor::initmDNS() {
  if (!MDNS.begin("serialmonitor")) {
    Serial.println("Error setting up MDNS responder!");
  }
}

// CaptivePortalHandler Class Implementation
CaptivePortalHandler::CaptivePortalHandler() {}

CaptivePortalHandler::~CaptivePortalHandler() {}

bool CaptivePortalHandler::canHandle(AsyncWebServerRequest *request) {
  // Handle all requests
  return true;
}

void CaptivePortalHandler::handleRequest(AsyncWebServerRequest *request) {
  // Serve a simple HTML page
  request->send(200, "text/html", captive_html);
}
