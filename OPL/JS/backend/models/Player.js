/**
 * Represents a single player within the game.
 * Maintains the player's board, score, and methods to determine the best move.
 */
class Player {
  /**
   * Initializes a new Player instance.
   * @param {Board} board - The board belonging to this player.
   * @param {Tournament} tournament - The tournament context or controller.
   */
  constructor(board, tournament) {
    /**
     * Reference to the tournament controlling this game.
     * @type {Tournament}
     */
    this.tournament = tournament;

    /**
     * The board owned by this player.
     * @type {Board}
     */
    this.board = board;

    /**
     * The player's current score.
     * @type {number}
     */
    this.score = 0;

    /**
     * Flag indicating whether the player has taken at least one turn.
     * @type {boolean}
     */
    this.hasFirstTurnBeenPlayed = false;
  }

  /**
   * Retrieves the current score of this player.
   * @returns {number} The player's current score.
   */
  getScore() {
    return this.score;
  }

  /**
   * Increment the player's score by a specified number of points.
   * @param {number} points - Number of points to add to the current score.
   */
  updateScore(points) {
    this.score += points;
  }

  /**
   * Chooses the best move based on the dice sum and the opponent's board state.
   * Attempts to cover the player's own squares first if beneficial; otherwise,
   * tries to uncover the opponent's squares. If no moves are available, returns "none."
   *
   * @param {number} diceSum - The sum of the dice rolled.
   * @param {Board} opponentBoard - The board object belonging to the opponent.
   * @returns {{ action: string, combination: number[], reason: string }} 
   * An object describing the chosen action, the squares combination, and the reason.
   */
  chooseMove(diceSum, opponentBoard) {
    // Attempt to cover the player's own squares
    const coverOptions = this.findBestCombination(this.board, diceSum, true);
    if (coverOptions.length > 0) {
      return {
        action: 'cover',
        combination: this.selectBestCombination(coverOptions),
        reason: 'Covering my squares to maximize my advantage'
      };
    }

    // If no cover options, attempt to uncover the opponent's squares
    const uncoverOptions = this.findBestCombination(opponentBoard, diceSum, false);
    if (uncoverOptions.length > 0) {
      return {
        action: 'uncover',
        combination: this.selectBestCombination(uncoverOptions),
        reason: 'Uncovering opponent\'s squares to minimize their advantage'
      };
    }

    // If neither covering nor uncovering is viable, do nothing
    return {
      action: 'none',
      combination: [],
      reason: 'No valid moves available'
    };
  }
}

module.exports = Player;