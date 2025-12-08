// js/model/Dice.js
export class Dice {
  constructor() {
    this.manual = false;
    this.manualQueue = [];
  }

  setManual(mode) {
    this.manual = mode;
  }

  pushManualRoll(d1, d2) {
    this.manualQueue.push({ d1, d2 });
  }

  roll(numDice = 2) {
    if (this.manual && this.manualQueue.length > 0) {
      // let you test with predetermined rolls
      const { d1, d2 } = this.manualQueue.shift();
      return { d1, d2: numDice === 2 ? d2 : 0 };
    }
    const d1 = this.#rollOne();
    const d2 = numDice === 2 ? this.#rollOne() : 0;
    return { d1, d2 };
  }

  #rollOne() {
    return Math.floor(Math.random() * 6) + 1;
  }
}
