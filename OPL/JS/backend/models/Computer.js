const Player = require("../models/Player");
const Tournament = require("../models/Tournament");
const Board = require("../models/Board");

/**
 * Represents a computer-controlled player.
 * Extends the Player class with AI logic for deciding dice throws and moves.
 */
class Computer extends Player {
  /**
   * Initializes a new instance of the Computer class.
   * @param {Board} board - The board assigned to this computer player.
   */
  constructor(board) {
    super(board);
    this.type = "computer";
  }

  /**
   * Decides whether to throw one die or two dice.
   * Examines squares 7 to N on the board; if all are covered, returns 1, otherwise 2.
   * @returns {number} 1 if using one die, 2 otherwise.
   */
  decideDiceThrow() {
    const squares7toN = this.board.squares.slice(6);
    const allCovered = squares7toN.every((_, index) => this.board.isSquareCovered(index + 7));
    return allCovered ? 1 : 2;
  }

  /**
   * Chooses a move based on the dice sum and the current state of the opponent's board.
   * Prioritizes winning by uncovering, then covering own squares, then uncovering opponent's squares.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board object.
   * @returns {Object} An object describing the chosen move.
   *                   { action: string, combination: number[], reason: string }.
   */
  chooseMove(diceSum, opponentBoard) {
    // Attempt to find combinations that can win by uncovering the opponent's board.
    const uncoverWinOptions = this.findBestCombination(opponentBoard, diceSum, false);
    const canWinByUncovering = uncoverWinOptions.some(combo => {
      const tempBoard = new Board(opponentBoard.size);
      tempBoard.setSquareValues([...opponentBoard.squares]);
      combo.forEach(sq => tempBoard.uncoverSquare(sq));
      return tempBoard.allUncovered();
    });

    if (canWinByUncovering) {
      return {
        action: 'uncover',
        combination: this.selectWinningCombination(uncoverWinOptions, opponentBoard),
        reason: "Winning by uncovering all opponent's squares"
      };
    }

    // Try covering own squares.
    const coverOptions = this.findBestCombination(this.board, diceSum, true);
    if (coverOptions.length > 0) {
      return {
        action: 'cover',
        combination: this.selectBestCombination(coverOptions),
        reason: "Covering my squares to maximize my advantage"
      };
    }

    // Try uncovering opponent's squares.
    const uncoverOptions = this.findBestCombination(opponentBoard, diceSum, false);
    if (uncoverOptions.length > 0) {
      return {
        action: 'uncover',
        combination: this.selectBestCombination(uncoverOptions),
        reason: "Uncovering opponent's squares to minimize their advantage"
      };
    }

    // If no valid moves are available.
    return {
      action: 'none',
      combination: [],
      reason: "No valid moves available"
    };
  }

  /**
   * Suggests a move for help by delegating to chooseMove.
   * This is useful for a hint feature.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board.
   * @returns {Object} A suggested move object.
   */
  suggestMove(diceSum, opponentBoard) {
    return this.chooseMove(diceSum, opponentBoard);
  }

  /**
   * Finds all valid combinations of squares on the given board that sum to the given value.
   * Uses a backtracking approach and considers advantage constraints if applicable.
   *
   * @param {Board} board - The board on which to find combinations.
   * @param {number} sum - The target sum for the combination.
   * @param {boolean} forCovering - True if finding combinations for covering squares, false for uncovering.
   * @returns {number[][]} An array of square combinations.
   */
  findBestCombination(board, sum, forCovering) {
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(currentPlayer);

    /**
     * Backtracking helper to generate combinations.
     * @param {number} start - Starting square number.
     * @param {number[]} path - Current combination being built.
     * @param {number} remaining - Remaining sum needed.
     */
    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.board.isValidCombination(path, forCovering)) {
          if (!(advantageApplied && isOpponentBoard && path.includes(advantageSquare) && !canUncover)) {
            combinations.push([...path]);
          }
        }
        return;
      }

      for (let i = start; i <= board.size; i++) {
        if (advantageApplied && isOpponentBoard && i === advantageSquare && !canUncover) {
          continue;
        }
        if ((forCovering && !board.isSquareCovered(i)) || (!forCovering && board.isSquareCovered(i))) {
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
   * Selects the best combination from an array of valid combinations.
   * Criteria: the combination with the highest length,
   * and if equal, the one with the highest total sum.
   *
   * @param {number[][]} combinations - An array of valid square combinations.
   * @returns {number[]} The selected best combination.
   */
  selectBestCombination(combinations) {
    return combinations.reduce((best, current) => {
      if (current.length > best.length) return current;
      if (current.length === best.length) {
        return current.reduce((a, b) => a + b, 0) > best.reduce((a, b) => a + b, 0) ? current : best;
      }
      return best;
    }, []);
  }

  /**
   * Executes this computer player's turn.
   * Decides on a move and applies it to the board accordingly.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board.
   * @returns {Object} The move object that was executed.
   */
  takeTurn(diceSum, opponentBoard) {
    const move = this.chooseMove(diceSum, opponentBoard);
    
    if (move.action === 'cover') {
      move.combination.forEach(square => this.board.coverSquare(square));
    } else if (move.action === 'uncover') {
      move.combination.forEach(square => opponentBoard.uncoverSquare(square));
    }
    
    return move;
  }

  /**
   * From a list of combinations, selects a winning combination if it exists.
   * A winning combination is one which, when applied, results in the opponent's board being fully uncovered.
   *
   * @param {number[][]} combinations - The array of possible combinations.
   * @param {Board} opponentBoard - The opponent's board object.
   * @returns {number[]} The winning combination if available, otherwise the best combination.
   */
  selectWinningCombination(combinations, opponentBoard) {
    const winningCombos = combinations.filter(combo => {
      const tempBoard = new Board(opponentBoard.size);
      tempBoard.setSquareValues([...opponentBoard.squares]);
      combo.forEach(sq => tempBoard.uncoverSquare(sq));
      return tempBoard.allUncovered();
    });

    if (winningCombos.length > 0) {
      return this.selectBestCombination(winningCombos);
    }
    
    return this.selectBestCombination(combinations);
  }
}

module.exports = Computer;