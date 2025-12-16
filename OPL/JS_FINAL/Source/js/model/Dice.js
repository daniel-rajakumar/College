/**
 * Dice utility supporting random rolls, manual values, and queued sequences.
 */
export class Dice {
  constructor(rng = Math.random) {
    this.rng = rng;
    this.queue = [];
  }

  /**
   * Replace the queued rolls used before random generation.
   */
  setQueue(entries) {
    this.queue = Array.isArray(entries) ? [...entries] : [];
  }

  _dequeue(numDice) {
    if (!this.queue || this.queue.length === 0) return null;
    for (let i = 0; i < this.queue.length; i++) {
      const q = this.queue[i];
      const hasTwo = q.d2 != null;
      if ((numDice === 1 && !hasTwo) || (numDice === 2 && hasTwo)) {
        this.queue.splice(i, 1);
        return q;
      }
    }
    return null;
  }


  /**
   * Roll one or two dice; consume queued entries when provided.
   */
  rollRandom(numDice) {

    const queued = this._dequeue(numDice);
    if (queued) {
      const sumQ = queued.d1 + (queued.d2 ?? 0);
      return { d1: queued.d1, d2: queued.d2 ?? null, sum: sumQ };
    }
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
   * Validate and return a manual dice tuple for testing/demo.
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
