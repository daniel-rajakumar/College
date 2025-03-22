const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");

class Game {
  constructor(boardSize = 11) {
    this.humanBoard = new Board(boardSize);
    this.computerBoard = new Board(boardSize);
    this.humanPlayer = new Human(this.humanBoard);
    this.computerPlayer = new Computer(this.computerBoard);
    this.currentPlayer = "human"; // human or computer
    this.screen = "START"; // Initialize the screen variable
  }

  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return { dice1, dice2, total: dice1 + dice2 };
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === "human" ? "computer" : "human";
  }

  setScreen(screen) {
    this.screen = screen;
  }

  getState() {
    return {
      humanSquares: this.humanBoard.getSquares(),
      computerSquares: this.computerBoard.getSquares(),
      humanScore: this.humanPlayer.getScore(),
      computerScore: this.computerPlayer.getScore(),
      currentPlayer: this.currentPlayer,
      screen: this.screen, // Include the screen variable in the state
    };
  }
}

module.exports = Game;