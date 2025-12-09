// js/model/Dice.js

/**
 * Dice = purely logic, no UI.
 * Responsible for generating random or manual dice values.
 */
export class Dice {
  constructor(rng = Math.random) {
    this.rng = rng;
  }

  /**
   * Roll 1 or 2 dice randomly.
   * @param {number} numDice 1 or 2
   * @returns {{ d1: number, d2: number|null, sum: number }}
   */
  rollRandom(numDice) {
    if (numDice !== 1 && numDice !== 2) {
      throw new Error("numDice must be 1 or 2");
    }
    const d1 = this._rollOne();
    let d2 = null;
    if (numDice === 2) {
      d2 = this._rollOne();
    }
    const sum = d1 + (d2 ?? 0);
    return { d1, d2, sum };
  }

  /**
   * Use manually specified dice (for testing / instructor demo).
   * @param {number[]} values length 1 or 2, each 1..6
   */
  useManual(values) {
    if (!Array.isArray(values) || values.length < 1 || values.length > 2) {
      throw new Error("Manual dice must be array of length 1 or 2");
    }
    const [d1, d2] = values;
    if (!this._isValidDie(d1) || (d2 != null && !this._isValidDie(d2))) {
      throw new Error("Manual dice values must be between 1 and 6");
    }
    return {
      d1,
      d2: d2 ?? null,
      sum: d1 + (d2 ?? 0)
    };
  }

  _rollOne() {
    return 1 + Math.floor(this.rng() * 6);
  }

  _isValidDie(v) {
    return Number.isInteger(v) && v >= 1 && v <= 6;
  }
}
