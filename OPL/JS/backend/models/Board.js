class Board {
  constructor(size) {
    this.size = size;
    this.squares = Array.from({ length: size }, (_, i) => i + 1);
  }

  coverSquare(index) {
    index = parseInt(index, 10);
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

  allCovered() {
    return this.squares.every((square) => square === 0);
  }

  allUncovered() {
    return this.squares.every((square) => square !== 0);
  }
    

  getCoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square === 0 ? sum + (index + 1) : sum; 
    }, 0);
  }

  getUncoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square !== 0 ? sum + (index + 1) : sum; 
    }, 0);
  }


  findValidCombinations(sum, forCovering) {
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(currentPlayer);
  
    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.isValidCombination(path, forCovering)) {
          if (!(advantageApplied && isOpponentBoard && path.includes(advantageSquare) && !canUncover)) {
            combinations.push([...path]);
          }
        }
        return;
      }
  
      for (let i = start; i <= this.size; i++) {
        if (advantageApplied && isOpponentBoard && i === advantageSquare && !canUncover) {
          continue;
        }
  
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
    return combinations;
  }

  isValidCombination(combination, forCovering) {
    const advantageSquare = this.tournament?.getAdvantageSquare();
    const advantageApplied = this.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(this.game.currentPlayer);


    // Prevent uncovering advantage square if not allowed
    if (advantageApplied && isOpponentBoard && combination.includes(advantageSquare) && !canUncover) {
      return false;
    }
    

    for (const square of combination) {
      if ((forCovering && this.isSquareCovered(square)) || (!forCovering && !this.isSquareCovered(square))) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Board;