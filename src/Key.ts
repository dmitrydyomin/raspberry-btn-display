import EventEmitter from 'events';
import gpio from 'rpi-gpio';

let keyPressed = false;

export const Key = new EventEmitter();

gpio.on('change', function (channel, value) {
  if (keyPressed !== value) {
    Key.emit(value ? 'keydown' : 'keyup');
    keyPressed = value;
  }
});

gpio.setup(13, gpio.DIR_IN, gpio.EDGE_BOTH);
