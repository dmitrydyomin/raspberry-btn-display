import { Service } from "typedi";
import cp from 'child_process';

import { Display } from "./Display";
import { SysInfo } from "./SysInfo";

enum State {
  Idle,
  IpAddr,
  MemCpu,
  Disk,
  HowTurnOff,
  Shutdown0,
  Shutdown1,
  Shutdown2,
  Shutdown3,
  Shutdown4,
}

@Service()
export class StateMachine {
  private lastKeyDown = 0;
  private lastKeyUp = 0;
  private state = State.Idle;
  private keyDown = false;

  constructor(private display: Display, private info: SysInfo) { }

  async onStart() {
    await this.display.clear();
  }

  async onStateChange() {
    switch (this.state) {
      case State.Idle:
        await this.display.clear();
        break;
      case State.IpAddr:
        await this.display.text(this.info.ipAddr());
        break;
      case State.MemCpu:
        await this.display.text(this.info.memCpu());
        break;
      case State.Disk:
        await this.display.text(await this.info.disk());
        break;
      case State.HowTurnOff:
        await this.display.text('Press and hold any key to shut down');
        break;

      case State.Shutdown0:
        await this.display.clear();
        break;
      case State.Shutdown1:
        await this.display.shutdownRect(0);
        break;
      case State.Shutdown2:
        await this.display.shutdownRect(1);
        break;
      case State.Shutdown3:
        await this.display.shutdownRect(2);
        break;
      case State.Shutdown4:
        this.display.invert(true);
        await this.display.shutdownRect(3);
        cp.exec('sudo poweroff');
        break;
    }
  }

  handleKay() {
    return State.Idle;
  }

  t(prev?: number) {
    const now = (new Date()).getTime();
    return prev === undefined ? now : now - prev;
  }

  setState(state: State) {
    this.state = state;
    this.onStateChange();
  }

  async step() {
    const keyDownTime = this.t(this.lastKeyDown);
    const keyUpTime = this.t(this.lastKeyUp);

    switch (this.state) {
      case State.Idle:
        await this.display.blinkRandomPixel();
        break;

      case State.IpAddr:
      case State.MemCpu:
      case State.Disk:
      case State.HowTurnOff:
        if (!this.keyDown && keyUpTime > 15000) {
          this.setState(State.Idle)
        }
        break;

      case State.Shutdown0:
        if (this.keyDown && keyDownTime > 1000) {
          this.setState(State.Shutdown1);
        }
        break;
      case State.Shutdown1:
        if (this.keyDown && keyDownTime > 2000) {
          this.setState(State.Shutdown2);
        }
        break;
      case State.Shutdown2:
        if (this.keyDown && keyDownTime > 3000) {
          this.setState(State.Shutdown3);
        }
        break;
      case State.Shutdown3:
        if (this.keyDown && keyDownTime > 4000) {
          this.setState(State.Shutdown4);
        }
        break;
    }

    if ([State.Idle, State.IpAddr, State.MemCpu, State.Disk, State.HowTurnOff].includes(this.state)) {
      if (this.keyDown && keyUpTime < 1500 && keyDownTime > 1000) {
        this.setState(State.Shutdown0);
      }
    }
  }

  handleKeyDown() {
    this.keyDown = true;
    this.lastKeyDown = this.t();
  }

  handleKeyUp() {
    this.keyDown = false;
    this.lastKeyUp = this.t();

    switch (this.state) {
      case State.Idle:
        this.setState(State.IpAddr);
        break;
      case State.IpAddr:
        this.setState(State.MemCpu);
        break;
      case State.MemCpu:
        this.setState(State.Disk);
        break;
      case State.Disk:
        this.setState(State.HowTurnOff);
        break;
      case State.HowTurnOff:
      case State.Shutdown0:
      case State.Shutdown1:
      case State.Shutdown2:
      case State.Shutdown3:
      case State.Shutdown4:
        this.setState(State.Idle);
        break;
    }
  }

  async onExit() {
    this.display.invert(false);
    await this.display.clear();
  }
}
