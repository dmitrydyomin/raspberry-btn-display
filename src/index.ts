import 'reflect-metadata';
import Container from 'typedi';

import { MainLoop } from './MainLoop';

const mainLoop = Container.get(MainLoop)

mainLoop.run()
  .then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  })

const shutdown = () => {
  console.log('Shutting down...');
  mainLoop.stop();
}

const gracefulShutdownSignals: NodeJS.Signals[] = [
  'SIGTERM',
  'SIGINT',
  'SIGUSR1',
  'SIGUSR2',
];

gracefulShutdownSignals.forEach((signal) =>
  process.on(signal, shutdown)
);
