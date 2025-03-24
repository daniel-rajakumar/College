class Board {
  constructor(size) {
    this.size = size;
    this.squares = Array.from({ length: size }, (_, i) => i + 1);
  }

  coverSquare(index) {
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = 0;
    }
  }

  uncoverSquare(index) {
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = index;
    }
  }

  getSquares() {
    return this.squares;
  }

  setSquareValues(values) {
    if (values.length === this.size) {
      this.squares = values;
    } else {
      throw new Error("Invalid input: The number of values must match the board size.");
    }
  }

  isSquareCovered(index) {
    if (index >= 1 && index <= this.size) {
      return this.squares[index - 1] === 0;
    }
    return false;
  }

  findValidCombinations(sum, forCovering) {
    const combinations = [];

    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.isValidCombination(path, forCovering)) {
          combinations.push([...path]);
        }
        return;
      }

      for (let i = start; i <= this.size; i++) {
        if ((forCovering && !this.isSquareCovered(i)) || (!forCovering && this.isSquareCovered(i))) {
          if (i <= remaining) {
            path.push(i);
            backtrack(i + 1, path, remaining - i);
            path.pop();
          }
        }
      }
    };

    backtrack(1, [], sum);

    // console.log(`Found ${combinations.length} valid combinations for ${forCovering ? "covering" : "uncovering"}`);
    return combinations;
  }

  isValidCombination(combination, forCovering) {
    for (const square of combination) {
      if ((forCovering && this.isSquareCovered(square)) || (!forCovering && !this.isSquareCovered(square))) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Board;