const Player = require("../models/Player");
const Computer = require("../models/Computer");

/**
 * The Human class represents a human-controlled player.
 * Extends the base Player class by providing the ability to request help from a temporary Computer instance.
 */
class Human extends Player {
  /**
   * Initializes a new instance of the Human class.
   * @param {Board} board - The board assigned to this human player.
   */
  constructor(board) {
    super(board);
    /**
     * Identifies the type of this player as "human".
     * @type {string}
     */
    this.type = "human";
  }

  /**
   * Requests a suggested move from a Computer instance.
   * Useful as a "hint" or "help" feature for the human player.
   * @param {number} diceSum - The sum of dice values rolled.
   * @param {Board} opponentBoard - The opponent’s board object.
   * @returns {Object} A suggested action object (cover/uncover, squares, and reason).
   */
  requestHelp(diceSum, opponentBoard) {
    const computer = new Computer(this.board);
    return computer.suggestMove(diceSum, opponentBoard);
  }
}

module.exports = Human;