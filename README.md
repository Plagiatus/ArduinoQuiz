# ArduinoQuiz

![Screenshot](https://user-images.githubusercontent.com/7681159/207215220-6b675ad1-3486-4e9f-99b7-ded22e3942ff.png)

A Quiz system using an arduino as the input and an optional website as the display, connected through node.js

You can use the hardware without connecting it to a PC if you power it through e.g. a battery instead, that way the frontend isn't needed. It's just an optional addon.

For now the frontend supports two gametypes: 

1. a basic display that shows who pressed their button first, if something was wrong or correct and lets you automatically count points. Supports any number of players.  
2. A FamilyFeud option, which needs a json file with the questions to be able to display them. Have a look at the provided examples for guidance.

![Lightmode](https://user-images.githubusercontent.com/7681159/207215381-23b46030-0cab-4e9e-bfd5-bc41a369fcca.png)
_Lightmode example of the basic view with settings._

![Darkmode](https://user-images.githubusercontent.com/7681159/207215397-9b8768b3-704c-48c8-b83f-d3b217f90de5.png)
_Darkmode example of the Family Feud display without visible settings._


The frontend also comes equipped to adjust to your prefered color scheme automatically.

There are two options for frontends: A clean "Display Only" view, as well as a "Control View". **At least one Control View is needed to start playing a game**, however you can disable (almost) all control settings to make it look almost like a display view. Thus the display only is meant to be used in tandem with a control view on a different screen (e.g. the gamemasters phone).

# Hardware 

We're making a quiz set, powered by an arduino and with an optional PC connection for more visual feedback and functionality, such as point counting etc.

## Checklist

The following is needed to get the same setup as described in this post, creating 1 base station and 4 player buzzer stations.  
You can ditch half or all of the LEDs if you don't care for feedback lights.  
The setup is also envisioned to have lights at / in the player buttons, so if you ditch that you need only a two-core cable to connect the player buttons to the main station.

- Arduino (I used a nano)
- LEDs (8x) 
  - I used two per button, so I took 2 each in the same color as the buttons (red, blue, yellow, white)
  - don't forget the resistors to put in front of them
  - also you might need/want some sockets for easier installing
- Buttons  
	- 4x for the players (i took 4 different colored ones with the option to have a lamp inside)
	- 3x for the main console. I recommend using 3 different colors (red, green, black), but as long as you label them you'll be fine.
- Stripboard to build your circuits out of
- On/Off Switch if you plan to power it through a battery
- 9V battery connector (and battery)
- Resistor array  
  - either get a 7 pin (8 with GND) resistor array or 7 individual (one per button) high resistance resistors (e.g. 5k-10k), we use them to "pull down" the signal to prevent wrong input reads.
- Cables and connectors (three-core)  
  - I'm using 3.6mm Jack cables (the ones you might know from headphones or other audio) with the corresponding plugs. If you do not want to have an LED at the button, two-core is fine.
- a handful of coated wires to connect various components to each other
- something to encase all of these things. Here you can get very creative, also depending on your arduino and button sizes as well as available tools. Anything from cardboard boxes over old jam jars to custom 3D printed cases can work. Just make sure it doesn't conduct electricity or if it does, that your boards are well enough isolated.
- soldering equipment and some uncoated wires to solder with

## Upload the sketch

Check out the [arduino sketch](/arduino/arduino.ino) and use one of the methods [described here](https://www.arduino.cc/en/Guide) to connect to it and upload the sketch. But first, adjust the following global variables:

- `buttons` needs to be the amount of player buttons you intend to have
- `inputs` are the (digital) pins you'll use for reading the button inputs. it needs to be (at least) the same length as you've set in `buttons`.
- `outputs` are the (digital) pins you'll use for turning on the lights and enabling the buttons. it needs to be (at least) the same length as you've set in `buttons`.
- `RIGHT_PIN`, `WRONG_PIN` and `RESET_PIN` need to be set to the pins 

I recommend avoiding the TX and RX pins (on the nano they are digital 0 and digital 1), as they can be very useful for future upgrades to the system.

If you have a breadboard available, you should probably to try the sketch before soldering everything together and see if it works as you want it to.

## Assembly instructions

_coming soon_

# Software

_Hopefully there will be an easy executeable in the future. Until then you'll need to follow the setup instructions._

### Setup

1. install [NodeJS](https://nodejs.org/en/) (whichever LTS version is currently available) and npm (included). You might need to restart your PC for step 3/4 to work.
2. download / clone the project
3. open the frontend folder through a terminal/commandline, then run these two commands: `npm install` and `npm run build`. This should create a `node_modules` and a `dist` folder.
4. open the backend folder in the terminal/commandline, then run `npm install`. You are now ready to run the program.

### Run the program

To run the program, you now run the terminal/commandline command `npm start` in the `backend` folder. It should give you an IP address through which you can connect. If you see multiple addresses, you should be able to connect to it from other devices (phone, other PCs) in the same network.  

They will all connect to the same game instance, that way you can for example use your computer as the display while controlling the game from your phone (especially useful for games like FamilyFeud where the host needs to see the answers beforehand).

In theory you can also use the frontend without the arduino, changing values manually or using the hardware "emulator" page.

### Connect the Arduino

To connect your arduino to the backend, you need to add the serial port that your arduino is connected through. The easiest way to find that is in my opinion through the arduino IDE, but a computers device manager should work just fine. Once you have the connection string, you can add it as the first argument to the start command.

for example, if your serial port is "COM3", run the start command like this: `npm start "COM3"`. Other values like "/dev/cu.usbmodem13431" are also possible and depend on both your arduino and computer.

### Change the port

By default the game will be served on **port 9090**. If you want/need to change that, you can pass the port as the second argument to the start command. If you want to change the port without setting an arduino connection, use `""` as the first argument, e.g. `npm start "" 8000`.


# Still Todo:

- add proper setup instructions in readme
- clean up GameView, probably into multiple components
- add more quiz styles
	- jeopardy
	- go for gold
- add sounds
- add a way to play with phones instead of arduino hardware
- control arduino through game
