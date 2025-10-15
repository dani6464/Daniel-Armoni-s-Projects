#ifndef EMBEDDED_FILES_H
#define EMBEDDED_FILES_H

#include <Arduino.h>
#include <ESPAsyncWebServer.h>

// Embedded HTML, CSS, and JS content
extern const char index_html[] PROGMEM;
extern const char style_css[] PROGMEM;
extern const char script_js[] PROGMEM;
extern const char captive_html[] PROGMEM;

// Functions to serve the embedded content
void serveIndexHtml(AsyncWebServerRequest *request);
void serveStyleCss(AsyncWebServerRequest *request);
void serveScriptJs(AsyncWebServerRequest *request);

#endif  // EMBEDDED_FILES_H
