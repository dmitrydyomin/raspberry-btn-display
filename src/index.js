const Display = require('./display');
const Key = require('./key');
const rf = require('random-facts');
const sysinfo = require('./sysinfo');
const cp = require('child_process');

const display = new Display();

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

let stopping = false;
const onShutdown = () => { stopping = true; }
process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
process.on('SIGUSR1', onShutdown);
process.on('SIGUSR2', onShutdown);

const t = (prev) => {
  const now = (new Date()).getTime();
  return typeof prev === 'number' ? now - prev : now;
}

let lastClick = 0;
let shutdownMode = undefined;
let mode = undefined;
const MODE_COUNT = 5;
let modeResetTimeout = undefined;
const MODE_TIMEOUT = 15000;
const SHUTDOWN_CLICK_MAX_INTERVAL = 500;

Key.on('keydown', async () => {
  if (shutdownMode === 5) {
    return;
  }
  const x = t(lastClick);
  if (x < SHUTDOWN_CLICK_MAX_INTERVAL) {
    clearTimeout(modeResetTimeout);
    lastClick = 0;
    shutdownMode = 0;
    mode = undefined;
    display.oled.clearDisplay();
  } else {
    if (mode === undefined) {
      mode = 0;
    } else {
      mode = (mode + 1) % MODE_COUNT;
    }
    display.oled.clearDisplay();
    switch (mode) {
      case 0:
        display.writeText(sysinfo.ipAddr());
        break;
      case 1:
        display.writeText(sysinfo.memCpu());
        break;
      case 2:
        sysinfo.disk((err, data) => {
          if (!err) {
            display.writeText(data);
          }
        })
        break;
      case 3:
        display.writeText('Press and hold any key to shut down');
        break;
      case 4:
        display.writeText(rf.randomFact());
        break;
    }
    clearTimeout(modeResetTimeout);
    modeResetTimeout = setTimeout(() => {
      display.oled.clearDisplay();
    }, MODE_TIMEOUT);
    lastClick = t();
  }
});

Key.on('keyup', () => {
  if (shutdownMode === 5) {
    return;
  }
  if (shutdownMode !== undefined) {
    shutdownMode = undefined;
    mode = undefined;
    display.oled.clearDisplay();
  }
});

(async () => {
  display.oled.clearDisplay();
  await sleep(0);

  while (!stopping) {
    if (shutdownMode === undefined) {
      if (mode === undefined) {
        await display.blinkRandomPixel();
      } else {
        await sleep(200);
      }
    } else {
      if (shutdownMode < 4) {
        await sleep(1000);
        display.oled.fillRect(shutdownMode * 32 + 10, 26, 10, 10, 1);
        if (shutdownMode !== undefined) {
          shutdownMode += 1;
        }
        if (shutdownMode === 4) {
          display.oled.invertDisplay(true);
          // await new Promise(() => { });
          cp.exec('sudo poweroff');
          shutdownMode = 5;
        }
      } else {
        await sleep(200);
      }
    }
  }
  display.oled.invertDisplay(false);
  display.oled.clearDisplay();
  await sleep(0);

})()
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
