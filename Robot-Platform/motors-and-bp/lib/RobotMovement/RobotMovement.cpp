#include "RobotMovement.h"

void nudgeForwardClean() {
    unsigned long duration = 150;  // Set your thirdDuration in milliseconds
    int speed1 = 210;
    int speed2 = 140;
    int speed3 = 60;
    int delayTime = 200;

    forwardLeft(speed1);
    forwardRight(speed1);
    delay(duration);

    forwardLeft(speed2);
    forwardRight(speed2);
    delay(duration);

    forwardLeft(speed3);
    forwardRight(speed3);
    delay(duration);

    forwardLeft(0);
    forwardRight(0);
    delay(delayTime);

    reverseLeft(speed1);
    reverseRight(speed1);
    delay(duration);

    reverseLeft(speed2);
    reverseRight(speed2);
    delay(duration);

    reverseLeft(speed3);
    reverseRight(speed3);
    delay(duration);

    reverseLeft(0);
    reverseRight(0);
    delay(delayTime);
}
