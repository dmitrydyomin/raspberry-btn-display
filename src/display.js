const font = require('oled-font-5x7');
const i2c = require('i2c-bus');
const oled = require('oled-i2c-bus');

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

class Display {
  constructor() {
    const i2cBus = i2c.openSync(1);

    const opts = {
      width: 128,
      height: 64,
      address: 0x3C
    };

    this.oled = new oled(i2cBus, opts);
  }

  async blinkRandomPixel(t = 200) {
    const i = Math.floor(Math.random() * 128);
    const j = Math.floor(Math.random() * 64);
    this.oled.drawPixel([i, j, 1])
    await sleep(t);
    this.oled.drawPixel([i, j, 0])
    await sleep(0);
  }

  async writeText(s) {
    this.oled.setCursor(1, 1);
    this.oled.writeString(font, 1, s, 1, true);
    await sleep(0);
  }
}

module.exports = Display;
