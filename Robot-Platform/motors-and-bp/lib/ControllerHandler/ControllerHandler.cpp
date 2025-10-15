#include "ControllerHandler.h"
#include "RobotMovement.h"
#define DEBUG
#define JOYSTICK

ControllerPtr myControllers[BP32_MAX_GAMEPADS];
void (*moveLeftWheel)(int);
void (*moveRightWheel)(int);

void onConnectedController(ControllerPtr ctl) {
    bool foundEmptySlot = false;
    for (int i = 0; i < BP32_MAX_GAMEPADS; i++) {
        if (myControllers[i] == nullptr) {
            Console.printf("CALLBACK: Controller is connected, index=%d\n", i);
            ControllerProperties properties = ctl->getProperties();
            Console.printf("Controller model: %s, VID=0x%04x, PID=0x%04x\n", ctl->getModelName(), properties.vendor_id,
                           properties.product_id);
            myControllers[i] = ctl;
            foundEmptySlot = true;
            break;
        }
    }
    if (!foundEmptySlot) {
        Console.println("CALLBACK: Controller connected, but could not found empty slot");
    }
}

void onDisconnectedController(ControllerPtr ctl) {
    bool foundController = false;

    for (int i = 0; i < BP32_MAX_GAMEPADS; i++) {
        if (myControllers[i] == ctl) {
            Console.printf("CALLBACK: Controller disconnected from index=%d\n", i);
            myControllers[i] = nullptr;
            foundController = true;
            break;
        }
    }

    if (!foundController) {
        Console.println("CALLBACK: Controller disconnected, but not found in myControllers");
    }
}

void dumpGamepad(ControllerPtr ctl) {
    Console.printf(
        "idx=%d, dpad: 0x%02x, buttons: 0x%04x, axis L: %4d, %4d, axis R: %4d, %4d, brake: %4d, throttle: %4d, "
        "misc: 0x%02x, gyro x:%6d y:%6d z:%6d, accel x:%6d y:%6d z:%6d\n",
        ctl->index(),        // Controller Index
        ctl->dpad(),         // D-pad
        ctl->buttons(),      // bitmask of pressed buttons
        ctl->axisX(),        // (-511 - 512) left X Axis
        ctl->axisY(),        // (-511 - 512) left Y axis
        ctl->axisRX(),       // (-511 - 512) right X axis
        ctl->axisRY(),       // (-511 - 512) right Y axis
        ctl->brake(),        // (0 - 1023): brake button
        ctl->throttle(),     // (0 - 1023): throttle (AKA gas) button
        ctl->miscButtons(),  // bitmask of pressed "misc" buttons
        ctl->gyroX(),        // Gyro X
        ctl->gyroY(),        // Gyro Y
        ctl->gyroZ(),        // Gyro Z
        ctl->accelX(),       // Accelerometer X
        ctl->accelY(),       // Accelerometer Y
        ctl->accelZ()        // Accelerometer Z
    );
}

void processGamepad(ControllerPtr ctl) {
// FOLLOWING CODE USES TRIGGERS TO DRIVE
#ifndef JOYSTICK

    moveLeftWheel = ctl->r1() ? reverseLeft : forwardLeft;
    moveRightWheel = ctl->l1() ? reverseRight : forwardRight;

    int L2value = map(ctl->l2() ? ctl->brake() : 0, 0, 1050, 0, 250);

    int R2value = map(ctl->r2() ? ctl->throttle() : 0, 0, 1050, 0, 250);

    moveRightWheel(R2value);

    moveLeftWheel(L2value);

#endif

#ifdef JOYSTICK

    if (ctl->isConnected()) {
        Console.printf("CALLBACK: Controller is connected, index=%d\n", ctl->index());
        if (ctl->x()) {
            ctl->setRumble(0x80, 0x80);
            Console.println("Rumble on\n");
        } else {
            ctl->setRumble(0x00, 0x00);
            Console.println("Rumble off\n");
        }
    }

    int dirtyX = ctl->axisX();
    int sensiTrash = 20;
    int cleanX = dirtyX;
    if (dirtyX < sensiTrash && dirtyX > (-1 * sensiTrash)) {
        // need to clean x
        cleanX = 0;
    }

    int R2value = map(ctl->r2() ? ctl->throttle() : 0, 0, 1050, 0, 250);
    int L2value = map(ctl->l2() ? ctl->brake() : 0, 0, 1050, 0, 250);

    int movingFwd = (R2value == 0) ? 0 : 1;
    int movingBack = (L2value == 0) ? 0 : 1;

    // Calculate differential speeds
    int turnFactor = map(cleanX, -512, 512, -255, 255);
    int speedRight = constrain(R2value + turnFactor, 50, 250) * movingFwd;
    int speedLeft = constrain(R2value - turnFactor, 50, 250) * movingFwd;
    int speedRightBack = constrain(L2value + turnFactor, 50, 250) * movingBack;
    int speedLeftBack = constrain(L2value - turnFactor, 50, 250) * movingBack;
    int shouldForward = R2value > L2value;

#ifdef DEBUG
    Console.printf("lX:%d \n", cleanX);
    Console.printf("shouldForward:%d \n", shouldForward);
    Console.printf("movingBack:%d \n", movingBack);
    Console.printf("movingFwd:%d \n", movingFwd);
    Console.printf("R2Value:%d \n", R2value);
    Console.printf("speedLeft:%d \n", speedLeft);
    Console.printf("speedRight:%d \n", speedRight);
#endif

    if (shouldForward && movingFwd) {
        forwardRight(speedRight);
        forwardLeft(speedLeft);
    } else if (movingBack) {
        reverseRight(speedRightBack);
        reverseLeft(speedLeftBack);
    } else {
        forwardRight(0);
        forwardLeft(0);
    }
    if (ctl->dpad() == 1) {
        nudgeForwardClean();
    }
#endif
}

void processControllers() {
    for (auto myController : myControllers) {
        if (myController && myController->isConnected() && myController->hasData()) {
            if (myController->isGamepad()) {
                processGamepad(myController);
            } else {
                Console.printf("Unsupported controller\n");
            }
        }
    }
}
