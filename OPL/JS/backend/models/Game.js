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
    if (this.currentPlayer === "player1") {
      this.players.player1.hasFirstTurnBeenPlayed = true;
      this.currentPlayer = "player2";
    } else {
      this.players.player2.hasFirstTurnBeenPlayed = true;
      this.currentPlayer = "player1";
    }
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

  isGameOver() {
    const player1 = this.players.player1;
    const player2 = this.players.player2;
    const player1Board = player1.squares;
    const player2Board = player2.squares;

    if (!player1.hasFirstTurnBeenPlayed || !player2.hasFirstTurnBeenPlayed) 
      return false;

    // Check if player1 has won by covering all their squares
    if (player1Board.allCovered()) {
      this.gameOver = true;
      return "player1"; // Player 1 wins by covering all squares
    }

    // Check if player1 has won by uncovering all of player2's squares
    if (player2Board.allUncovered()) {
      this.gameOver = true;
      return "player1"; // Player 1 wins by uncovering all of player2's squares
    }

    // Check if player2 has won by covering all their squares
    if (player2Board.allCovered()) {
      this.gameOver = true;
      return "player2"; // Player 2 wins by covering all squares
    }

    // Check if player2 has won by uncovering all of player1's squares
    if (player1Board.allUncovered()) {
      this.gameOver = true;
      return "player2"; // Player 2 wins by uncovering all of player1's squares
    }

    // If none of the above conditions are met, the game is not over
    return null;
  }

  declareWinner() {
    const winner = this.checkGameOver();

    if (winner) {
      console.log(`Game over! ${winner} wins!`);
      this.resetGame(); // Reset the game for a new round
    } else {
      console.log("The game continues...");
    }

    return winner;
  }

  resetGame() {
    this.players.player1.board = new Board(this.boardSize);
    this.players.player2.board = new Board(this.boardSize);
    this.currentPlayer = "player1";
    this.screen = "START";
    this.gameOver = false;
    console.log("Game has been reset. Starting a new round...");
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