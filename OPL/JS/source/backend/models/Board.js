/**
 * Represents a game board with a set of numbered squares.
 */
class Board {
  /**
   * Creates a new Board instance.
   * @param {number} size - The number of squares on the board.
   */
  constructor(size) {
    this.size = size;
    this.squares = Array.from({ length: size }, (_, i) => i + 1);
  }

  /**
   * Covers the specified square, marking it as 0.
   * @param {number} index - The square number to cover (1-indexed).
   */
  coverSquare(index) {
    index = parseInt(index, 10);
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = 0;
    }
  }

  /**
   * Uncovers the specified square, restoring its original number.
   * @param {number} index - The square number to uncover (1-indexed).
   */
  uncoverSquare(index) {
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = index;
    }
  }

  /**
   * Retrieves the current values of the board squares.
   * @returns {number[]} An array representing the board squares.
   */
  getSquares() {
    return this.squares;
  }

  /**
   * Sets the board squares to the provided values.
   * @param {number[]} values - An array of values; its length must equal the board size.
   * @throws {Error} If the length of values does not match the board size.
   */
  setSquareValues(values) {
    if (values.length === this.size) {
      this.squares = values;
    } else {
      throw new Error("Invalid input: The number of values must match the board size.");
    }
  }

  /**
   * Determines if a specific square is covered.
   * @param {number} index - The square number to check (1-indexed).
   * @returns {boolean} True if the square is covered (i.e. value is 0), false otherwise.
   */
  isSquareCovered(index) {
    if (index >= 1 && index <= this.size) {
      return this.squares[index - 1] === 0;
    }
    return false;
  }

  /**
   * Checks if all squares on the board are covered.
   * @returns {boolean} True if every square is 0, false otherwise.
   */
  allCovered() {
    return this.squares.every((square) => square === 0);
  }

  /**
   * Checks if all squares on the board are uncovered.
   * @returns {boolean} True if every square is not 0, false otherwise.
   */
  allUncovered() {
    return this.squares.every((square) => square !== 0);
  }

  /**
   * Calculates the sum of indices for all covered squares.
   * @returns {number} The total sum of the positions of covered squares.
   */
  getCoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square === 0 ? sum + (index + 1) : sum; 
    }, 0);
  }

  /**
   * Calculates the sum of indices for all uncovered squares.
   * @returns {number} The total sum of the positions of uncovered squares.
   */
  getUncoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square !== 0 ? sum + (index + 1) : sum; 
    }, 0);
  }

  /**
   * Finds all valid combinations of square numbers that sum to a given target.
   * Takes into account board state and advantage restrictions.
   *
   * @param {number} sum - The target sum for the combination.
   * @param {boolean} forCovering - True if finding combinations for covering squares,
   *                                false if for uncovering squares.
   * @returns {number[][]} An array of valid square combinations.
   */
  findValidCombinations(sum, forCovering) {
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(currentPlayer);

    /**
     * Backtracking helper to generate combinations.
     * @param {number} start - The starting square number.
     * @param {number[]} path - The current combination being built.
     * @param {number} remaining - The remaining sum required.
     */
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

  /**
   * Validates whether a given combination of squares is allowed.
   * Checks both covering logic and advantage rules.
   *
   * @param {number[]} combination - The combination of square numbers.
   * @param {boolean} forCovering - True if the combination is for covering squares,
   *                                false if for uncovering squares.
   * @returns {boolean} True if the combination is valid, false otherwise.
   */
  isValidCombination(combination, forCovering) {
    const advantageSquare = this.tournament?.getAdvantageSquare();
    const advantageApplied = this.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(this.game.currentPlayer);

    // Prevent uncovering the advantage square if not allowed
    if (advantageApplied && isOpponentBoard && combination.includes(advantageSquare) && !canUncover) {
      return false;
    }
    
    // For each square in the combination, ensure it is not already covered (for covering) or is covered (for uncovering)
    for (const square of combination) {
      if ((forCovering && this.isSquareCovered(square)) || (!forCovering && !this.isSquareCovered(square))) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Board;