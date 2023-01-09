const int buttons = 4;
const int inputs[] = { 2, 3, 4, 5 };
const int outputs[] = { 9, 10, 11, 12 };
const int RIGHT_PIN = 6;
const int WRONG_PIN = 7;
const int RESET_PIN = 8;

const int PERM_PIN = 19;

bool playerStatus[] = { true, true, true, true };  // true for enabled, false for disabled
/*
  0: waiting for player input
  1: waiting for gamemaster input
 */
int status = 0;
int activePlayer = -1;

//button status
bool lastResetButtonState = false;
bool lastWrongButtonState = false;
bool lastRightButtonState = false;


void setup() {
  for (int i = 0; i < buttons; i++) {
    pinMode(inputs[i], INPUT);
    pinMode(outputs[i], OUTPUT);
    digitalWrite(outputs[i], HIGH);
  }
  pinMode(RIGHT_PIN, INPUT);
  pinMode(WRONG_PIN, INPUT);
  pinMode(RESET_PIN, INPUT);
  pinMode(PERM_PIN, OUTPUT);
  digitalWrite(PERM_PIN, HIGH);  
  Serial.begin(9600);
}

void loop() {
  // check reset
  bool resetButtonState = digitalRead(RESET_PIN);
  if (resetButtonState == HIGH) {
    if (lastResetButtonState != resetButtonState) {
      resetAll();
      enableAll();
      activePlayer = -1;
      status = 0;
      Serial.println("{\"command\":\"reset\"}");
      delay(1000);
    }
    lastResetButtonState = resetButtonState;
    return;
  }
  lastResetButtonState = resetButtonState;


  // waiting for player inputs
  if (status == 0) {
    for (int i = 0; i < buttons; i++) {
      // if player input, set them active
      if (digitalRead(inputs[i]) == HIGH && playerStatus[i]) {
        disableOthers(outputs[i]);
        activePlayer = i;
        status = 1;
        String player = "{\"player\":" + String(i) + "}";
        Serial.println(player);
      }
    }
  }

  // other gamemaster input
  bool wrongButtonState = digitalRead(WRONG_PIN);
  bool rightButtonState = digitalRead(RIGHT_PIN);
  if (wrongButtonState == HIGH) {
    if (wrongButtonState != lastWrongButtonState) {
      playerStatus[activePlayer] = false;
      status = 0;
      enableAll();
      Serial.println("{\"command\":\"wrong\"}");
      delay(1000);
    }
  } else if (rightButtonState == HIGH) {
    if (rightButtonState != lastRightButtonState) {
      playerStatus[activePlayer] = true;
      status = 0;
      Serial.println("{\"command\":\"correct\"}");
      delay(1000);
    }
  }
  
  lastWrongButtonState = wrongButtonState;
  lastRightButtonState = rightButtonState;
}

void disableOthers(int in) {
  for (int i = 0; i < buttons; i++) {
    digitalWrite(outputs[i], LOW);
  }
  digitalWrite(in, HIGH);
}

void enableAll() {
  for (int i = 0; i < buttons; i++) {
    digitalWrite(outputs[i], playerStatus[i] ? HIGH : LOW);
  }
}

void resetAll() {
  for (int i = 0; i < buttons; i++) {
    playerStatus[i] = true;
  }
}