import { Service } from 'typedi';

import font from 'oled-font-5x7';
import i2c from 'i2c-bus';
import oled from 'oled-i2c-bus';

@Service()
export class Display {
  private oled: any;

  constructor() {
    const i2cBus = i2c.openSync(1);

    const opts = {
      width: 128,
      height: 64,
      address: 0x3C
    };

    this.oled = new oled(i2cBus, opts);
  }

  private sleep(t = 0) {
    return new Promise(resolve => setTimeout(resolve, t));
  }

  async clear() {
    this.oled.clearDisplay();
    await this.sleep();
  }

  async text(s: string) {
    this.oled.clearDisplay();
    this.oled.setCursor(1, 1);
    this.oled.writeString(font, 1, s, 1, true);
    await this.sleep();
  }

  async shutdownRect(n: number) {
    this.oled.fillRect(n * 32 + 10, 26, 10, 10, 1);
    await this.sleep();
  }

  invert(i: boolean) {
    this.oled.invertDisplay(i);
  }

  async blinkRandomPixel(t = 200) {
    const i = Math.floor(Math.random() * 128);
    const j = Math.floor(Math.random() * 64);
    this.oled.drawPixel([i, j, 1])
    await this.sleep(t);
    this.oled.drawPixel([i, j, 0])
    await this.sleep();
  }
}
