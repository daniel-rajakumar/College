const Player = require("../models/Player");

class Human extends Player {
  constructor(board) {
    super(board);
  }

  requestHelp(diceSum, opponentBoard) {
    const computer = new Computer(this.board); // Temporary computer for suggestions
    return computer.suggestMove(diceSum, opponentBoard);
  }
}

module.exports = Human;