const Game = require("../models/Game");

class Tournament {
  constructor() {
    this.game = new Game();
    this.isANewGame = true;
  }

  loadGame(state) {
    this.game = new Game(state.humanSquares.length);
    this.game.humanBoard.squares = state.humanSquares;
    this.game.computerBoard.squares = state.computerSquares;
    this.game.humanPlayer.score = state.humanScore;
    this.game.computerPlayer.score = state.computerScore;
    this.game.currentPlayer = state.GAME_TURN;
    this.game.setScreen(state.screen); // Set the screen from the loaded state
    this.isANewGame = false;
  }

  getState() {
    return this.game.getState();
  }
}

module.exports = Tournament;