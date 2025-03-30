const Board = require("../models/Board");
const Human = require("../models/Human");
const Computer = require("../models/Computer");
const Tournament = require("../models/Tournament");

/**
 * Represents a single game round within a tournament.
 */
class Game {
  /**
   * Initializes a new Game instance.
   * @param {Tournament} tournament - The tournament context.
   * @param {number} [boardSize=11] - The number of squares on the board.
   * @param {string} [player1Type="human"] - The type for player1 ("human" or "computer").
   * @param {string} [player2Type="computer"] - The type for player2 ("human" or "computer").
   */
  constructor(tournament, boardSize = 11, player1Type = "human", player2Type = "computer") {
    this.tournament = tournament;
    this.BOARD_SIZE = boardSize;
    this.dice = { dice1: 0, dice2: 0, total: 0 };
    this.message = "";
    this.hasFirstTurnBeenPlayed = false;
    this.gameOver = false;
    this.screen = "START";
    this.currentPlayer = "player1";

    // Initialize boards for both players
    let player1Board = new Board(boardSize);
    let player2Board = new Board(boardSize);

    // Create players based on given type
    this.players = {
      player1: player1Type === "human" 
        ? new Human(player1Board, this) 
        : new Computer(player1Board, this),
      player2: player2Type === "human" 
        ? new Human(player2Board, this) 
        : new Computer(player2Board, this)
    };
  }

  /**
   * Rolls two dice and updates the dice property.
   */
  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  /**
   * Switches the current player after a turn.
   * Also records that the player has taken their first turn.
   */
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

  /**
   * Sets the current screen of the game.
   * @param {string} screen - The screen value ("START", "PLAY", etc.).
   */
  setScreen(screen) {
    this.screen = screen;
  }

  /**
   * Retrieves the current dice object.
   * @returns {{dice1: number, dice2: number, total: number}} The dice values.
   */
  getDice() {
    return this.dice;
  }

  /**
   * Sets the dice values with given numbers.
   * @param {number} [dice1=0] - The value for dice1.
   * @param {number} [dice2=0] - The value for dice2.
   */
  setDice(dice1 = 0, dice2 = 0) {
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  /**
   * Checks if the game is over by examining both player's boards.
   * The game is not considered over if either player has not taken a turn.
   *
   * @returns {string|null} Returns "player1" or "player2" if that player wins; otherwise, returns null.
   */
  isGameOver() {
    const player1 = this.players.player1;
    const player2 = this.players.player2;
    const player1Board = player1.board;
    const player2Board = player2.board;

    // Do not check for a winner if either player hasn't played a turn.
    if (!player1.hasFirstTurnBeenPlayed || !player2.hasFirstTurnBeenPlayed) 
      return null;

    // Determine winner based on board state
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

  /**
   * Declares the tournament winner based on player scores.
   * @returns {string} Returns "player1", "player2", or "draw".
   */
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

  /**
   * Declares the winner of the current game round, updates scores, and resets the game.
   * Also records advantage data if part of a tournament.
   *
   * @returns {string|null} Returns the winner ("player1" or "player2") or null if the game continues.
   */
  declareWinner() {
    const winner = this.isGameOver();

    if (winner) {
      const player1Board = this.players.player1.board;
      const player2Board = this.players.player2.board;
      let winnerPoints = 0;

      if (winner === "player1") {
        if (player1Board.allCovered()) {
          winnerPoints = player2Board.getUncoveredSum(); 
        } else if (player2Board.allUncovered()) {
          winnerPoints = player1Board.getCoveredSum(); 
        }
        this.players.player1.score += winnerPoints;
      } else if (winner === "player2") {
        if (player2Board.allCovered()) {
          winnerPoints = player1Board.getUncoveredSum(); 
        } else if (player1Board.allUncovered()) {
          winnerPoints = player2Board.getCoveredSum(); 
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

  /**
   * Resets the game state for a new round.
   * Creates new boards for both players, resets turn and game over status.
   */
  resetGame() {
    this.players.player1.board = new Board(this.BOARD_SIZE);
    this.players.player2.board = new Board(this.BOARD_SIZE);
    this.currentPlayer = "player1";
    this.screen = "START";
    this.gameOver = false;
    console.log("Game has been reset. Starting a new round...");
  }

  /**
   * Retrieves the current state of the game.
   * @returns {Object} An object containing player details, current turn, dice, screen, advantage, and board size.
   */
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