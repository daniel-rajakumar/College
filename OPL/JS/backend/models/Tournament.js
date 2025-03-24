const Game = require("../models/Game");
const Board = require("./Board");


class Tournament {
  constructor() {
    this.game = new Game(this);
    this.isANewGame = true;
    this.advantage = {
      square: null,
      applied: false,
      player: null
    };
  }

  loadGame(state) {
    this.game = new Game(state.player1Squares.length);

    this.game.players.player1.hasFirstTurnBeenPlayed = true;
    this.game.players.player2.hasFirstTurnBeenPlayed = true;

    // Set the squares for both players
    this.game.players.player1 = state.player1Type === "human" 
    ? new Human(new Board(state.player1Squares.length), this.game.tournament)
    : new Computer(new Board(state.player1Squares.length), this.game.tournament);
  
  this.game.players.player2 = state.player2Type === "human" 
    ? new Human(new Board(state.player2Squares.length), this.game.tournament)
    : new Computer(new Board(state.player2Squares.length), this.game.tournament);


    this.game.players.player1.squares.setSquareValues(state.player1Squares);
    this.game.players.player2.squares.setSquareValues(state.player2Squares);

    // Set the scores for both players
    this.game.players.player1.score = state.player1Score;
    this.game.players.player2.score = state.player2Score;

    // Set the current player
    this.game.currentPlayer = state.currentPlayer;

    // Set the screen from the loaded state
    this.game.setScreen(state.screen);

    // Mark the game as not new
    this.isANewGame = false;

    console.log("Game loaded successfully!", this.game.getState());
  }

  getAdvantageSquare() {
    return this.advantage.square;
  }

  getAdvantageApplied() {
    return this.advantage.applied;
  }

  getAdvantagePlayer() {
    return this.advantage.player;
  }

  calculateAdvantageSquare(score) {
    return String(score).split('').reduce((sum, digit) => sum + parseInt(digit), 0) % 9 + 1;
  }

  applyAdvantage(winner, winnerScore) {
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;
    this.advantage.player = winner;

    const opponent = winner === 'player1' ? 'player2' : 'player1';
    this.game.players[opponent].board.coverSquare(this.advantage.square);
  }

  clearAdvantage() {
    this.advantage.square = null;
    this.advantage.applied = false;
    this.advantage.player = null;
  }

  getState() {
    const gameState = this.game.getState();
    return {
      ...gameState,
      advantage: { ...this.advantage }
    };
  }
}

module.exports = Tournament;