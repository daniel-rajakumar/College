const Player = require("../models/Player");

class Human extends Player {
  constructor(board) {
    super(board);
  }
}

module.exports = Human;