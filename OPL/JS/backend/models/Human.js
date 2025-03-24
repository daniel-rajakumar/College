const Player = require("../models/Player");
const Computer = require("../models/Computer");

class Human extends Player {
  constructor(board) {
    super(board);
    this.type = "human";
  }

  requestHelp(diceSum, opponentBoard) {
    const computer = new Computer(this.board); // Temporary computer for suggestions
    return computer.suggestMove(diceSum, opponentBoard);
  }
}

module.exports = Human;