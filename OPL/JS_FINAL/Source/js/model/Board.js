/**
 * Represents a single player's board of numbered squares (covered/uncovered).
 */
export class Board {
  /**
   * @param {number} size number of squares on the board
   */
  constructor(size) {
    if (!Number.isInteger(size) || size < 1) {
      throw new Error("Board size must be a positive integer");
    }
    this.size = size;

    this._covered = new Array(size + 1).fill(false);
  }


  /**
   * @param {number} num square number (1..size)
   * @returns {boolean} true if the square is covered
   */
  isCovered(num) {
    this._validateSquareNumber(num);
    return this._covered[num];
  }

  /**
   * Cover a single square; throws if already covered or invalid.
   */
  cover(num) {
    this._validateSquareNumber(num);
    if (this._covered[num]) {
      throw new Error(`Square ${num} is already covered`);
    }
    this._covered[num] = true;
  }

  /**
   * @param {number} num square number to uncover
   */
  uncover(num) {
    this._validateSquareNumber(num);
    if (!this._covered[num]) {
      throw new Error(`Square ${num} is already uncovered`);
    }
    this._covered[num] = false;
  }

  /**
   * @param {number[]} nums list of squares to cover
   */
  coverSquares(nums) {
    nums.forEach((n) => this.cover(n));
  }

  /**
   * @param {number[]} nums list of squares to uncover
   */
  uncoverSquares(nums) {
    nums.forEach((n) => this.uncover(n));
  }

  /**
   * @returns {number[]} covered square numbers
   */
  getCoveredNumbers() {
    const result = [];
    for (let i = 1; i <= this.size; i++) {
      if (this._covered[i]) result.push(i);
    }
    return result;
  }

  /**
   * @returns {number[]} uncovered square numbers
   */
  getUncoveredNumbers() {
    const result = [];
    for (let i = 1; i <= this.size; i++) {
      if (!this._covered[i]) result.push(i);
    }
    return result;
  }

  /**
   * @returns {boolean} true if all squares are covered
   */
  areAllCovered() {
    return this.getUncoveredNumbers().length === 0;
  }

  /**
   * @returns {boolean} true if all squares are uncovered
   */
  areAllUncovered() {
    return this.getCoveredNumbers().length === 0;
  }

  /**
   * @param {number} targetSum dice sum
   * @returns {number[][]} combinations of uncovered squares that total the sum
   */
  getCoverCombos(targetSum) {
    const candidates = this.getUncoveredNumbers();
    return this._getCombosForSum(candidates, targetSum);
  }

  /**
   * Return all valid uncover combos for a target sum using covered squares.
   */
  getUncoverCombos(targetSum) {
    const candidates = this.getCoveredNumbers();
    return this._getCombosForSum(candidates, targetSum);
  }

  /**
   * @param {number[]} candidates sorted numbers to choose from
   * @param {number} targetSum target total
   * @returns {number[][]} combos of up to 4 entries matching the sum
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
        if (n > remaining) break;
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
   * @returns {number[]} board as array where 0 means covered, number means uncovered
   */
  toNumberArrayFormat() {
    const arr = [];
    for (let i = 1; i <= this.size; i++) {
      arr.push(this._covered[i] ? 0 : i);
    }
    return arr;
  }

  /**
   * @returns {boolean} true if squares 7..size are covered (or size < 7)
   */
  canUseOneDie() {
    if (this.size < 7) return true;
    for (let i = 7; i <= this.size; i++) {
      if (!this._covered[i]) return false;
    }
    return true;
  }



  /**
   * @param {number[]} arr number-array format where 0 means covered
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
