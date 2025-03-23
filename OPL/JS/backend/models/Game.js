const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");

class Game {

  constructor(boardSize = 11, player1Type = "human", player2Type = "computer") {
    this.humanBoard = new Board(boardSize);
    this.computerBoard = new Board(boardSize);
    this.players = {
      player1: { type: player1Type, board: this.humanBoard, score: 0 },
      player2: { type: player2Type, board: this.computerBoard, score: 0 },
    };
    this.currentPlayer = "player1"; // Start with Player 1
    this.screen = "START";
  }

  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return { dice1, dice2, total: dice1 + dice2 };
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === "player1" ? "player1" : "player2";
  }

  setScreen(screen) {
    this.screen = screen;
  }

  getState() {
    return {
      player1: {
        type: this.players.player1.type,
        squares: this.players.player1.board.getSquares(),
        score: this.players.player1.score,
      },
      player2: {
        type: this.players.player2.type,
        squares: this.players.player2.board.getSquares(),
        score: this.players.player2.score,
      },
      currentPlayer: this.currentPlayer,
      screen: this.screen,
    };
  }
}

module.exports = Game;