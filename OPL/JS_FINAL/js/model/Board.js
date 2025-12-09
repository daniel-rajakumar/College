
// js/model/Board.js

export class Board {
  static ONE_DIE_RULE_START = 7; // 1-die allowed when this..size are covered

  constructor(n = 0) {
    this.size = n;
    this.squares = Array(n).fill(false); // false = uncovered, true = covered
  }

  coverSquare(square) {
    if (square >= 1 && square <= this.size && !this.squares[square - 1]) {
      this.squares[square - 1] = true;
      return true;
    }
    return false;
  }

  uncoverSquare(square) {
    if (square >= 1 && square <= this.size && this.squares[square - 1]) {
      this.squares[square - 1] = false;
      return true;
    }
    return false;
  }

  isSquareCovered(square) {
    if (square >= 1 && square <= this.size) {
      return this.squares[square - 1];
    }
    return false;
  }

  getSize() {
    return this.size;
  }

  allCovered() {
    return this.squares.every(sq => sq === true);
  }

  allUncovered() {
    return this.squares.every(sq => sq === false);
  }

  getUncoveredSum() {
    let sum = 0;
    for (let i = 1; i <= this.size; ++i) {
      if (!this.isSquareCovered(i)) sum += i;
    }
    return sum;
  }

  getCoveredSum() {
    let sum = 0;
    for (let i = 1; i <= this.size; ++i) {
      if (this.isSquareCovered(i)) sum += i;
    }
    return sum;
  }

  /**
   * Return array of combinations, each combination is an array<int>.
   * forCovering = true  -> choose uncovered squares
   * forCovering = false -> choose covered squares (for uncovering)
   */
  findValidCombinations(sum, forCovering) {
    const results = [];

    const helper = (remaining, start, current) => {
      if (remaining === 0) {
        results.push([...current]);
        return;
      }
      for (let i = start; i <= this.size; ++i) {
        const covered = this.isSquareCovered(i);
        if (forCovering && covered) continue;
        if (!forCovering && !covered) continue;

        if (i > remaining) break;

        current.push(i);
        helper(remaining - i, i + 1, current);
        current.pop();
      }
    };

    helper(sum, 1, []);
    return results;
  }

  isValidCombination(combination, forCovering) {
    for (const square of combination) {
      const covered = this.isSquareCovered(square);
      if ((forCovering && covered) || (!forCovering && !covered)) {
        return false;
      }
    }
    return true;
  }

  canThrowOneDie() {
    for (let i = Board.ONE_DIE_RULE_START; i <= this.size; ++i) {
      if (!this.isSquareCovered(i)) return false;
    }
    return true;
  }
}





