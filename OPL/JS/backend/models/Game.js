const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");
const Tournament = require("../models/Tournament");

class Game {

  constructor(tournament, boardSize = 11, player1Type = "human", player2Type = "computer") {
    this.tournament = tournament;

    let player1Board = new Board(boardSize);
    let player2Board = new Board(boardSize);

    this.players = {
      player1: player1Type === "human" 
        ? new Human(player1Board, this) 
        : new Computer(player1Board, this),
      player2: player2Type === "human" 
        ? new Human(player2Board, this) 
        : new Computer(player2Board, this)
    };
    this.currentPlayer = "player1"; 
    this.screen = "START";
    this.dice = { dice1: 0, dice2: 0, total: 0 };
    this.message = "";
    this.hasFirstTurnBeenPlayed = false;
    this.gameOver = false;  
    this.BOARD_SIZE = boardSize;
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
    if (this.tournament) {
      this.tournament.recordTurn(this.currentPlayer);
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

    if (player1Board.allCovered()) {
      this.gameOver = true;
      return "player1"; 
    }

    if (player2Board.allUncovered()) {
      this.gameOver = true;
      return "player1"; 
    }

    if (player2Board.allCovered()) {
      this.gameOver = true;
      return "player2";
    }

    if (player1Board.allUncovered()) {
      this.gameOver = true;
      return "player2"; 
    }

    return null;
  }
  
  declareTournamentWinner() {
    const player1 = this.players.player1;
    const player2 = this.players.player2;

    if (player1.score > player2.score) {
      console.log(`Tournament over! Player 1 wins with ${player1.score} points!`);
      return "player1";
    } else if (player2.score > player1.score) {
      console.log(`Tournament over! Player 2 wins with ${player2.score} points!`);
      return "player2";
    } else {
      console.log("Tournament ended in a draw!");
      return "draw";
    }
  }

  declareWinner() {
    const winner = this.isGameOver();

    if (winner) {
      const player1Board = this.players.player1.board;
      const player2Board = this.players.player2.board;

      let winnerPoints = 0;

      if (winner === "player1") {
        if (player1Board.allCovered()) {
          winnerPoints = player2Board.getUncoveredSum(); // Sum of uncovered squares on player2's board
        } else if (player2Board.allUncovered()) {
          winnerPoints = player1Board.getCoveredSum(); // Sum of covered squares on player1's board
        }

        this.players.player1.score += winnerPoints;
      } else if (winner === "player2") {
        if (player2Board.allCovered()) {
          winnerPoints = player1Board.getUncoveredSum(); // Sum of uncovered squares on player1's board
        } else if (player1Board.allUncovered()) {
          winnerPoints = player2Board.getCoveredSum(); // Sum of covered squares on player2's board
        }

        this.players.player2.score += winnerPoints;
      }

      if (this.tournament) {
        this.tournament.advantage.winner = winner;
        this.tournament.advantage.winnerScore = winnerPoints;
      }

      console.log(`Game over! ${winner} wins with ${winnerPoints} points!`);
      this.resetGame(); 
      return winner;
    } else {
      console.log("The game continues...");
      return null;
    }
  }





  resetGame() {
    // this.players.player1.tournament.clearAdvantage();
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
      advantage: this.tournament.advantage,
      message: this.message,
      fullGame: this.players,
      BOARD_SIZE: this.BOARD_SIZE,
    };
  }
}

module.exports = Game;