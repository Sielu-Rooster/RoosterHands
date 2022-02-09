# RoosterHands

This library is intended to provide tools and code for DCS pilots to build their own low(ish)-profile, modular, wireless button sets to extend immersion with virtual cockpits.  Many current leap motion users, myself included, are fairly disappointed with DCS's current leap integration, and feel like it's a bit finicky and unreliable.  The best solution we've found is PointCTRL:
https://pointctrl.com/

But having sat on the waitlist for about a year with no end in sight, some of us have started taking matters into our own hands.  If you want a more professional project and don't mind waiting, get on the PointCTRL waitlist.  If you want to get your hands dirty, and don't mind kludging something together now... read on!

## Hand Tracking
This library is dependant on other hardware and software to track your hands and translate that data into a cursor that DCS can interpret.  All I'm providing here is a method to actually actuate a mouse buttons once the cursor is where you need it to be.  Getting the cursor into place requires some hand tracking:

### Hand Tracking Hardware
I use an UltraLeap Stereo IR 170, which is a bit overkill and I wouldn't suggest going with it.  A basic OG Leap Motion strapped to a headset should work just fine!
https://www.ultraleap.com/ 

You'll need some way to attach the leap device to your VR headset.  I 3D printed a mount straight off of Ultraleaps' thingiverse page for my Reverb G2, works great!
https://www.thingiverse.com/ultraleap/designs

### Hand Tracking Software, part 1
Ultraleap's Gemini software package is very robust and provides reliable-enough tracking to emulate mouse input.  You'll need to create a developer account on Ultraleap to download, but this is free.
https://developer.leapmotion.com/tracking-software-download

### Hand Tracking Software, part 2
The real secret sauce here is glenmurphy/Frenzon's 'Fingers' app, which translates the Leap Motion hand tracking into a single mouse cursor. It's lightweight, sits on top of Ultraleaps' gemini software, and just 'works'.  Make sure you have bluetooth enabled, even though we won't be using the finger's button input... the software crashes without it.
https://github.com/glenmurphy/fingers

## Mouse Button Input
The next piece of the puzzle is getting the actual clickity bit of the mouse emulation.  One lightweight option is to bind mouse right/left click to your HOTAS within DCS.  This allows you to use one hand to move the cursor through Fingers and then 'click' with your other hand on the controls.  It works, but it's not very immersive.  

Frenzon's working on some VERY low-profile rings with integrated batteries, based on the Espruino MDBT42Q bare module.  Since that code and design haven't been released yet, I started working on a much less low-profile version based on the MDBT42Q breakout and some AAA batteries.  It's chunkier, but more approachable.  

### Hand Tracking Hardware, part 1
First up, the main piece of the hardware is the microcontroller.  Espruino boards are designed to be lightweight and VERY efficient, and program easily over bluetooth using javascript.  I didn't know JS at all going into this, and managed to bungle together a mouse script out of it.  At the end of the day I actually like it better than Arduino, and based on my rough math the AAA batteries I'm feeding this thing should last about a year with routine use.
https://www.espruino.com/MDBT42Q

I picked up my actual hardware for adafruit: https://www.adafruit.com/product/3876?gclid=Cj0KCQiAxoiQBhCRARIsAPsvo-zQEBPivOWm7WrN4SnVlN8_yXTU7Vnga4baXUxkf6yPqXVuJFA918AaAiGVEALw_wcB

### Hand Tracking Hardware, part 2
Next, you're gonna need some buttons.  I bought an assortment of clicky momentary buttons off of Amazon (https://www.amazon.com/gp/product/B09HNN1GPM/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1) but only ended up using the 6MM and 12MM basic variants.  You can also find these on Adafruit if you want to one-stop-shop: https://www.adafruit.com/product/1119 and https://www.adafruit.com/product/367

I also had a wire crimper and terminal/header kit lying around, which is useful for making the connections.  
Crimper: https://www.amazon.com/gp/product/B007JLN93S/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1
Kit: https://www.amazon.com/dp/B07TB8QXMC?psc=1&ref=ppx_yo2_dt_b_product_details

### Hand Tracking Hardware, part 3
Here we get to my actual contribution.  I designed two components, [the button mount](https://github.com/Sielu-Rooster/RoosterHands/blob/main/designs/FingerBase%20V3.stl) that gets glued on to the index finger of a glove, and [battery/chip holder](https://github.com/Sielu-Rooster/RoosterHands/blob/main/designs/ChipBase%20AAA%20V2.stl) that gets glued on the back of the hand and runs the whole operation.

These were 3D printed on a resin printer.  A FDM printer may not be able to get the resolution for the wire lead holes, but I haven't done FDM printing in a long time.

![range of motion](https://github.com/Sielu-Rooster/RoosterHands/blob/main/pictures/PXL_20220209_000744302._exported_stabilized_1644365386516.gif)
![buttons](https://github.com/Sielu-Rooster/RoosterHands/blob/main/pictures/PXL_20220209_000836399._exported_stabilized_1644365351093.gif)
![clearance](https://github.com/Sielu-Rooster/RoosterHands/blob/main/pictures/PXL_20220209_000612267._exported_stabilized_1644365400455.gif)

The two 12MM buttons slot into the two in-line 12mm slots on the button mount, and the 6mms into the front two slots. All four buttons should be wired to a common lead, which I punch through the center 'hole' in the button mount.  The remaining four leads should then go to four additional wires, then all five of those plugged into five pins on the Espruino board.  I used a bit of extra resin to secure everything in place before hot-gluing to the glove.  My highly professional wiring diagram may help:

![much professional](https://github.com/Sielu-Rooster/RoosterHands/blob/main/pictures/wiringDiagram.png)

For the battery/chip mount, you're going to need some AAA battery terminals.  I designed the spacing and clips in each battery slot for these: https://www.amazon.com/dp/B07V9G87L9?psc=1&ref=ppx_yo2_dt_b_product_details which clip right in with a bit of force.  Then just wire up each battery in series, and pass the leads through the included hole in the mount.  I made the hole a smidge too small, so you may need to drill it out a bit to pass two 1mm leads through.  

The battery mount also has a slot for press-fitting the chip into, although I had to sand down one side slightly to get one of my boards to fit.

The gloves are fingerless which is nice for HOTAS controls, but still have a long-enough finger to attach the buttons to.  

### Hand Tracking Firmware
And finally, my other contribution.  I've inluded a javascript...[script](https://github.com/Sielu-Rooster/RoosterHands/blob/main/javascript/roosterMouse_v07.js) that gets uploaded to the MDBT42Q board and mimicks a bluetooth mouse.  One button each is assigned to left and right click, and then another two buttons are assigned to scroll up and scroll down in order to turn knobs in the cockpit.  Scrolling has acceleration built into it, so the longer the button is held down the faster the 'scroll wheel' turns.  This allows for pretty rapid turning of really slow knobs (like barometric pressure), but also very precise adjustment if the button is only clicked momentarily.  

To upload the firmware:
1. Make sure you have bluetooth or go buy a bluetooth adapter.  I had to also install the wifi antenna on my desktop because apparently bluetooth runs over that too.  Then, open www.espruino.com/ide/ in Chrome or Edge (gross), Firefox doesn't like it.  
2. Hit the 'connect' button in the top-left corner, then copy and paste the [script](https://github.com/Sielu-Rooster/RoosterHands/blob/main/javascript/roosterMouse_v07.js) into the right-hand window and hit 'flash'.  It should show a confirmation and then say "waiting on restart".  
3. Power down the module, power it back up and connect it to bluetooth through windows and you should be good to go!  
