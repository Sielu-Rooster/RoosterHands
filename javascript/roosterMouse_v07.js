//Code is derived from https://www.espruino.com/modules/ble_hid_mouse.js and https://www.espruino.com/modules/USBMouse.js

//set up our mouse buttons on the board
var outputPin = D19; //pin for providing voltage to buttons
var m1 = D18; //mouse 1
var m2 = D20; //mouse 2
var sUp = D22; //scroll up
var sDn = D17; //scroll down

//set up parameters
var scroll = 2; //initial scroll speed
var maxScroll = 1000; //maximum scroll speed
var strength = 1800; //how many seconds the board will stay awake for after button input
var caff = 0; 
var voltlimit = 2.6; //below what voltage should the LED flash red?
var b3;
var b4;
var sip;

//initialize pins
pinMode(outputPin, "output");
pinMode(m1, "input_pulldown");
pinMode(m2, "input_pulldown");
pinMode(sUp, "input_pulldown");
pinMode(sDn, "input_pulldown");

//power on voltage check and indicate, red is bad
if(E.getAnalogVRef() > voltlimit) {
  digitalPulse(LED2, 1, 1000);
} else {
  digitalPulse(LED1, 1, 1000);
}

//set outputPin to provide voltage
digitalWrite(outputPin, 1);

//this array tells windows this is a mouse
report = new Uint8Array([
  0x05,   0x01,
  0x09,   0x02,
  0xA1,   0x01,
  0x09,   0x01,

  0xA1,   0x00,
  0x05,   0x09,
  0x19,   0x01,
  0x29,   0x03,

  0x15,   0x00,
  0x25,   0x01,
  0x95,   0x03,
  0x75,   0x01,

  0x81,   0x02,
  0x95,   0x01,
  0x75,   0x05,
  0x81,   0x01,

  0x05,   0x01,
  0x09,   0x30,
  0x09,   0x31,
  0x09,   0x38,

  0x15,   0x81,
  0x25,   0x7F,
  0x75,   0x08,
  0x95,   0x03,

  0x81,   0x06,
  0xC0,   0x09,
  0x3c,   0x05,
  0xff,   0x09,

  0x01,   0x15,
  0x00,   0x25,
  0x01,   0x75,
  0x01,   0x95,

  0x02,   0xb1,
  0x22,   0x75,
  0x06,   0x95,
  0x01,   0xb1,

  0x01,   0xc0 
  ]);

//this starts broadcasting the array
NRF.setServices(undefined, { hid : report });

//this function keeps the board from going into deep sleep, and keeps poking windows so windows doesn't forget about it.  Makes the whole thing more responsive in testing
function coffee(){
  caff--;
  if (caff % 10 == 0) {
    if (E.getAnalogVRef() > 2.55) {
      digitalPulse(LED2, 1, 100);
    } else {
      digitalPulse(LED1, 1, 100);
    }
  }
  if(caff < 1){
    changeInterval(sip, 3153600000000);
  }
  if(digitalRead(m1) + digitalRead(m2) + digitalRead(sUp) + digitalRead(sDn) < 1){
    //print("awake");
    NRF.sendHIDReport([0,0,0,0]);
  }
}

//sets initial keep awake interval to 100 years
sip = setInterval('coffee()', 3153600000000);

//mouse 1 release
setWatch(function() {
  NRF.sendHIDReport([1,0,0,0]);
  caff = strength;
  changeInterval(sip, 1000);
},m1, {repeat:true, edge:"rising", debounce:25} );

//mouse 2 release
setWatch(function() {
  NRF.sendHIDReport([2,0,0,0]);
  caff = strength;
  changeInterval(sip, 1000);
},m2, {repeat:true, edge:"rising", debounce:25} );

//mouse scroll up press
setWatch(function() {
    b3 = setInterval(function() {
    if(scroll < maxScroll){scroll++;}
    print(scroll);
    NRF.sendHIDReport([0,0,0,scroll]);
  },100);
  caff = strength;
  changeInterval(sip, 1000);
},sUp, {repeat:true, edge:"rising", debounce:25} );

//mouse scroll down press
setWatch(function() {
    b4 = setInterval(function() {
    if(scroll < maxScroll){scroll--;}
    print(scroll);
    NRF.sendHIDReport([0,0,0,scroll]);
  },100);
  caff = strength;
  changeInterval(sip, 1000);
},sDn, {repeat:true, edge:"rising", debounce:25} );

//mouse 1 release
setWatch(function() {
  NRF.sendHIDReport([0,0,0,0]);
},m1, {repeat:true, edge:"falling", debounce:25} );

//mouse 2 release
setWatch(function() {
  NRF.sendHIDReport([0,0,0,0]);
},m2, {repeat:true, edge:"falling", debounce:25} );

//mouse scroll up release
setWatch(function() {
  scroll = 0;
  clearInterval(b3);
  NRF.sendHIDReport([0,0,0,0]);
},sUp, {repeat:true, edge:"falling", debounce:25} );

//mouse scroll down release
setWatch(function() {
  scroll = 0;
  clearInterval(b4);
  NRF.sendHIDReport([0,0,0,0]);
},sDn, {repeat:true, edge:"falling", debounce:25} );
