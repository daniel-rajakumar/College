const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");
const Tournament = require("../models/Tournament");

class Game {

  constructor(tournament, boardSize = 11, player1Type = "human", player2Type = "computer") {
    // let player1board = Array.from({ length: boardSize }, (_, i) => i + 1);
    // let player2board = Array.from({ length: boardSize }, (_, i) => i + 1);
    this.tournament = tournament;

    let player1Board = new Board(boardSize);
    let player2Board = new Board(boardSize);

    this.players = {
      player1: player1Type === "human" 
        ? new Human(player1Board, tournament) 
        : new Computer(player1Board, tournament),
      player2: player2Type === "human" 
        ? new Human(player2Board, tournament) 
        : new Computer(player2Board, tournament)
    };
    this.currentPlayer = "player1"; // Start with Player 1
    this.screen = "START";
    this.dice = { dice1: 0, dice2: 0, total: 0 };
    this.message = "";
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
    const player1Board = player1.board;
    const player2Board = player2.board;

    if (!player1.hasFirstTurnBeenPlayed || !player2.hasFirstTurnBeenPlayed) 
      return null;

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
    const winner = this.isGameOver();

    if (winner) {
      const player1Board = this.players.player1.board;
      const player2Board = this.players.player2.board;

      let winnerPoints = 0;

      if (winner === "player1") {
        if (player1Board.allCovered()) {
          // Player 1 wins by covering all their squares
          winnerPoints = player2Board.getUncoveredSum(); // Sum of uncovered squares on player2's board
        } else if (player2Board.allUncovered()) {
          // Player 1 wins by uncovering all of player2's squares
          winnerPoints = player1Board.getCoveredSum(); // Sum of covered squares on player1's board
        }

        this.players.player1.score += winnerPoints;
      } else if (winner === "player2") {
        if (player2Board.allCovered()) {
          // Player 2 wins by covering all their squares
          winnerPoints = player1Board.getUncoveredSum(); // Sum of uncovered squares on player1's board
        } else if (player1Board.allUncovered()) {
          // Player 2 wins by uncovering all of player1's squares
          winnerPoints = player2Board.getCoveredSum(); // Sum of covered squares on player2's board
        }

        this.players.player2.score += winnerPoints;
      }

      tournament.applyAdvantage(winner, winnerPoints);

      console.log(`Game over! ${winner} wins with ${winnerPoints} points!`);
      this.resetGame(); // Reset the game for a new round
      return winner;
    } else {
      console.log("The game continues...");
      return null;
    }
  }








  resetGame() {
    tournament.clearAdvantage();
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
        squares: this.players.player1.board.squares,
        score: this.players.player1.score,
      },
      player2: {
        type: this.players.player2.type,
        squares: this.players.player2.board.squares,
        score: this.players.player2.score,
      },
      currentPlayer: this.currentPlayer,
      dice: this.dice,
      screen: this.screen,
      advantage: {
        square: this.tournament.advantage.square,
        applied: this.tournament.advantage.applied,
        player: this.tournament.advantage.player
      },
      message: this.message,
    };
  }
}

module.exports = Game;