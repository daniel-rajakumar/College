const Player = require("../models/Player");

class Computer extends Player {
  constructor(board) {
    super(board);
  }
}

module.exports = Computer;