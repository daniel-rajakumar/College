const Game = require("../models/Game");

class Tournament {
  constructor() {
    this.game = new Game();
    this.isANewGame = true;
  }

  loadGame(state) {
    this.game = new Game(state.player1Squares.length);

    // Set the squares for both players
    this.game.players.player1.squares = state.player1Squares;
    this.game.players.player2.squares = state.player2Squares;

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

  getState() {
    return this.game.getState();
  }
}

module.exports = Tournament;