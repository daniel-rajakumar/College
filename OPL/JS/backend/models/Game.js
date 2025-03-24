const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");

class Game {

  constructor(boardSize = 11, player1Type = "human", player2Type = "computer") {
    // let player1board = Array.from({ length: boardSize }, (_, i) => i + 1);
    // let player2board = Array.from({ length: boardSize }, (_, i) => i + 1);

    let player1board = new Board(boardSize);
    let player2board = new Board(boardSize);

    this.players = {
      player1: { type: player1Type, squares: player1board, score: 0 },
      player2: { type: player2Type, squares: player2board, score: 0 },
    };
    this.currentPlayer = "player1"; // Start with Player 1
    this.screen = "START";
    this.dice = { dice1: 0, dice2: 0, total: 0 };
  }

  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === "player1" ? "player1" : "player2";
  }

  setScreen(screen) {
    this.screen = screen;
  }

  getDice() {
    return this.dice;
  }

  setDice(dice1 = 0, dice2 = 0) {
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  getState() {
    return {
      player1: {
        type: this.players.player1.type,
        squares: this.players.player1.squares.getSquares(),
        score: this.players.player1.score,
      },
      player2: {
        type: this.players.player2.type,
        squares: this.players.player2.squares.getSquares(),
        score: this.players.player2.score,
      },
      currentPlayer: this.currentPlayer,
      dice: this.dice,
      screen: this.screen,
    };
  }
}

module.exports = Game;