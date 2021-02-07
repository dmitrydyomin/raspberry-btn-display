const Key = require('./key');
const Display = require('./display');

const display = new Display();

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

let stopping = false;
const onShutdown = () => { stopping = true; }
process.on('SIGINT', onShutdown);
process.on('SIGUSR1', onShutdown);
process.on('SIGUSR2', onShutdown);

const t = (prev) => {
  const now = (new Date()).getTime();
  return typeof prev === 'number' ? now - prev : now;
}

let lastClick = 0;
let shutdownMode = undefined;

Key.on('keydown', async () => {
  if (t(lastClick) < 1000) {
    lastClick = 0;
    shutdownMode = 0;
  } else {
    lastClick = t();
  }
});

Key.on('keyup', () => {
  if (shutdownMode !== undefined) {
    shutdownMode = undefined;
    display.oled.clearDisplay();
  }
});

(async () => {
  display.oled.clearDisplay();
  await sleep(0);

  while (!stopping) {
    if (shutdownMode === undefined) {
      await display.blinkRandomPixel();
    } else {
      if (shutdownMode < 4) {
        await sleep(1000);
        display.oled.fillRect(shutdownMode * 32 + 10, 26, 10, 10, 1);
        if (shutdownMode !== undefined) {
          shutdownMode += 1;
        }
        if (shutdownMode === 4) {
          display.oled.invertDisplay(1);
          await sleep(0);
          process.exit(0);
        }
      }
    }
  }
  display.oled.clearDisplay();
  await sleep(0);

})()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
