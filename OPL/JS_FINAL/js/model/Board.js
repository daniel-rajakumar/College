// js/model/Board.js

/**
 * Board = one row of squares for a single player.
 * Squares are numbered 1..size.
 * Internally we store a boolean covered flag for each square.
 */
export class Board {
  constructor(size) {
    if (!Number.isInteger(size) || size < 1) {
      throw new Error("Board size must be a positive integer");
    }
    this.size = size;
    // index 0 unused so that index === square number
    this._covered = new Array(size + 1).fill(false);
  }

  /**
   * Return true if square number is currently covered.
   */
  isCovered(num) {
    this._validateSquareNumber(num);
    return this._covered[num];
  }

  /**
   * Cover a single square.
   */
  cover(num) {
    this._validateSquareNumber(num);
    if (this._covered[num]) {
      throw new Error(`Square ${num} is already covered`);
    }
    this._covered[num] = true;
  }

  /**
   * Uncover a single square.
   */
  uncover(num) {
    this._validateSquareNumber(num);
    if (!this._covered[num]) {
      throw new Error(`Square ${num} is already uncovered`);
    }
    this._covered[num] = false;
  }

  /**
   * Cover all given squares (array of numbers).
   */
  coverSquares(nums) {
    nums.forEach((n) => this.cover(n));
  }

  /**
   * Uncover all given squares (array of numbers).
   */
  uncoverSquares(nums) {
    nums.forEach((n) => this.uncover(n));
  }

  /**
   * List of all covered numbers.
   */
  getCoveredNumbers() {
    const result = [];
    for (let i = 1; i <= this.size; i++) {
      if (this._covered[i]) result.push(i);
    }
    return result;
  }

  /**
   * List of all uncovered numbers.
   */
  getUncoveredNumbers() {
    const result = [];
    for (let i = 1; i <= this.size; i++) {
      if (!this._covered[i]) result.push(i);
    }
    return result;
  }

  /**
   * True if all squares are covered.
   */
  areAllCovered() {
    return this.getUncoveredNumbers().length === 0;
  }

  /**
   * True if all squares are uncovered.
   */
  areAllUncovered() {
    return this.getCoveredNumbers().length === 0;
  }

  /**
   * Combos to COVER: use currently *uncovered* squares.
   * Returns all combinations of 1–4 squares whose sum equals targetSum.
   */
  getCoverCombos(targetSum) {
    const candidates = this.getUncoveredNumbers();
    return this._getCombosForSum(candidates, targetSum);
  }

  /**
   * Combos to UNCOVER: use currently *covered* squares.
   * Returns all combinations of 1–4 squares whose sum equals targetSum.
   */
  getUncoverCombos(targetSum) {
    const candidates = this.getCoveredNumbers();
    return this._getCombosForSum(candidates, targetSum);
  }

  /**
   * Internal: all combinations of up to 4 numbers from candidates that sum to target.
   * candidates must be sorted ascending to avoid duplicates.
   */
  _getCombosForSum(candidates, targetSum) {
    const result = [];
    const sorted = [...candidates].sort((a, b) => a - b);

    const backtrack = (startIndex, remaining, path) => {
      if (remaining === 0 && path.length >= 1 && path.length <= 4) {
        result.push([...path]);
        return;
      }
      if (remaining < 0 || path.length === 4) return;

      for (let i = startIndex; i < sorted.length; i++) {
        const n = sorted[i];
        if (n > remaining) break; // sorted, no need to continue
        path.push(n);
        backtrack(i + 1, remaining - n, path);
        path.pop();
      }
    };

    backtrack(0, targetSum, []);
    return result;
  }

  _validateSquareNumber(num) {
    if (!Number.isInteger(num) || num < 1 || num > this.size) {
      throw new Error(`Square number must be between 1 and ${this.size}, got ${num}`);
    }
  }

  /**
   * Useful for serialization: return array like [1,2,3,0,5,...]
   * Where index i-1 is either i (if uncovered) or 0 (if covered).
   */
  toNumberArrayFormat() {
    const arr = [];
    for (let i = 1; i <= this.size; i++) {
      arr.push(this._covered[i] ? 0 : i);
    }
    return arr;
  }

  /**
   * Restore covered/uncovered from number-array format [1,2,3,0,...].
   */
  loadFromNumberArrayFormat(arr) {
    if (!Array.isArray(arr) || arr.length !== this.size) {
      throw new Error("Bad board array length in loadFromNumberArrayFormat");
    }
    for (let i = 0; i < arr.length; i++) {
      const expectedNum = i + 1;
      const val = arr[i];
      if (val === 0) {
        this._covered[expectedNum] = true;
      } else {
        if (val !== expectedNum) {
          throw new Error(`Invalid board entry at position ${i}: expected ${expectedNum} or 0, got ${val}`);
        }
        this._covered[expectedNum] = false;
      }
    }
  }
}
