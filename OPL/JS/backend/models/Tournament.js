const Game = require("../models/Game");
const Board = require("./Board");
const Human = require("./Human");
const Computer = require("./Computer");


class Tournament {
  constructor() {
    this.game = new Game(this);
    this.isANewGame = true;
    this.advantage = {
      square: null,
      applied: false,
      player: null,
      firstPlayer: null
      
    };
  }

  setFirstPlayer(player) {
    this.advantage.firstPlayer = player;
  }

  loadGame(tournament, state) {
    this.game = new Game(tournament, state.player1Squares.length);

    // Set the squares for both players
    this.game.players.player1 = state.player1Type === "human" 
    ? new Human(new Board(state.player1Squares.length), this.game)
    : new Computer(new Board(state.player1Squares.length), this.game);
  
  this.game.players.player2 = state.player2Type === "human" 
    ? new Human(new Board(state.player2Squares.length), this.game)
    : new Computer(new Board(state.player2Squares.length), this.game);


    if (state.player1Squares.length != 0)
      this.game.players.player1.board.setSquareValues(state.player1Squares);

    if (state.player2Squares.length != 0)
      this.game.players.player2.board.setSquareValues(state.player2Squares);

    // Set the scores for both players
    this.game.players.player1.score = state.player1Score;
    this.game.players.player2.score = state.player2Score;

    this.game.players.player1.hasFirstTurnBeenPlayed = true;
    this.game.players.player2.hasFirstTurnBeenPlayed = true;

    // Set the current player
    this.game.currentPlayer = state.currentPlayer;

    // Set the screen from the loaded state
    this.game.setScreen(state.screen);

    // Mark the game as not new
    this.isANewGame = false;
    this.advantage.firstPlayer = state.currentPlayer;

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
    // Calculate advantage square
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;
    
    // Determine who gets advantage
    if (winner === this.advantage.firstPlayer) {
      // Winner was first player - advantage goes to opponent
      this.advantage.player = winner === 'player1' ? 'player2' : 'player1';
    } else {
      // Winner was second player - keeps advantage
      this.advantage.player = winner;
    }

    // Cover the advantage square on opponent's board
    const opponent = this.advantage.player === 'player1' ? 'player2' : 'player1';
    this.game.players[opponent].board.coverSquare(this.advantage.square);
    
    console.log(`Advantage applied! Square ${this.advantage.square} covered for ${opponent}`);
  }

  canUncoverAdvantage(currentPlayer) {
    // Can't uncover advantage square until advantage player has had a turn
    if (!this.advantage.applied) return true;
    
    // If current player is NOT the advantage player, can't uncover advantage square
    return currentPlayer === this.advantage.player;
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