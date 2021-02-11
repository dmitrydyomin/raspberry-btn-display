const EventEmitter = require('events');

const gpio = require('rpi-gpio');

let keyPressed = false;

const Key = new EventEmitter();

gpio.on('change', function (channel, value) {
  console.log({ channel, value });
  if (keyPressed !== value) {
    Key.emit(value ? 'keydown' : 'keyup');
    keyPressed = value;
  }
});
gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);

module.exports = Key;
