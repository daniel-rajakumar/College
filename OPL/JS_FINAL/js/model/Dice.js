
// js/model/Dice.js

// Simple dice helper. Not strictly required since
// Human/Computer do their own rolling, but available if needed.

export class Dice {
  rollDie() {
    return Math.floor(Math.random() * 6) + 1;
  }

  rollTwoDice() {
    return {
      d1: this.rollDie(),
      d2: this.rollDie()
    };
  }

  rollSum(count) {
    if (count === 1) return this.rollDie();
    const { d1, d2 } = this.rollTwoDice();
    return d1 + d2;
  }
}


