import { Service } from 'typedi';

@Service()
export class Loop {
  protected loopTimeout = 1000;
  protected errorMessage = 'Loop error';

  private running = false;
  private stopping = false;
  private sleepResolve = (v?: any) => { };
  private stopResolve = (v?: any) => { };

  async stop() {
    this.stopping = true;
    if (!this.running) {
      return;
    }
    return new Promise((resolve) => {
      this.stopResolve = resolve;
      this.sleepResolve();
    });
  }

  protected sleep(t: number) {
    return new Promise((resolve) => {
      this.sleepResolve = resolve;
      setTimeout(resolve, t);
    });
  }

  protected async prepare() { }

  protected async main() { }

  protected async cleanup() { }

  async run() {
    this.running = true;
    while (!this.stopping) {
      try {
        await this.main();
      } catch (err) {
        console.error(`${this.errorMessage}: ${err.message}`);
      }
      await this.sleep(this.loopTimeout);
    }
    await this.cleanup();
    this.stopResolve();
    this.running = false;
  }
}
