import { Service } from 'typedi';
import { Key } from './Key';

import { Loop } from './Loop';
import { StateMachine } from './StateMachine';

@Service()
export class MainLoop extends Loop {
  protected loopTimeout = 10;

  constructor(private stateMachine: StateMachine) {
    super();

    Key.on('keydown', () => {
      this.stateMachine.handleKeyDown();
    });

    Key.on('keyup', () => {
      this.stateMachine.handleKeyUp();
    });
  }

  protected async prepare() {
    await this.stateMachine.onStart();
  }

  protected async main() {
    await this.stateMachine.step();
  }

  protected async cleanup() {
    await this.stateMachine.onExit();
  }
}
