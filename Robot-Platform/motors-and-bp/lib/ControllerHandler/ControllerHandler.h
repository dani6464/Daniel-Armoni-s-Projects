#ifndef CONTROLLER_HANDLER_H
#define CONTROLLER_HANDLER_H

#include <Bluepad32.h>
#include "MotorControl.h"

void onConnectedController(ControllerPtr ctl);
void onDisconnectedController(ControllerPtr ctl);
void dumpGamepad(ControllerPtr ctl);
void processGamepad(ControllerPtr ctl);
void processControllers();

#endif
