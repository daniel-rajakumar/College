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
    this.moveHistory = []; 
    this.currentHistoryIndex = -1; 
    this.BOARD_SIZE = 0;
  }

  setFirstPlayer(player) {
    this.advantage.firstPlayer = player;
  }

  loadGame(tournament, state) {
    let n = state.player1.squares.length;
    this.game = new Game(tournament, n);

    this.game.players.player1 = state.player1Type === "human" 
    ? new Human(new Board(n), this.game)
    : new Computer(new Board(n), this.game);
  
  this.game.players.player2 = state.player2Type === "human" 
    ? new Human(new Board(n), this.game)
    : new Computer(new Board(n), this.game);


    if (n != 0)
      this.game.players.player1.board.setSquareValues(state.player1.squares);

    if (n != 0)
      this.game.players.player2.board.setSquareValues(state.player2.squares);

    this.game.players.player1.score = state.player1.score;
    this.game.players.player2.score = state.player2.score;

    this.game.players.player1.hasFirstTurnBeenPlayed = true;
    this.game.players.player2.hasFirstTurnBeenPlayed = true;

    this.game.currentPlayer = state.currentPlayer;

    this.game.setScreen(state.screen);

    this.isANewGame = false;
    this.advantage.firstPlayer = state.firstTurn;
    this.advantage.player = state.currentPlayer;

    this.history = [];
    this.currentHistoryIndex = -1;
    this.saveMoveSnapshot(); 

    this.BOARD_SIZE = n;


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
    score = Math.abs(score);
    if (score === 0) return 1;
    return score % 9 || 9; // Returns 1-9
  }

  applyAdvantage(winner, winnerScore) {
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;
    
    if (winner === this.advantage.firstPlayer) {
      this.advantage.player = winner === 'player1' ? 'player2' : 'player1';
    } else {
      this.advantage.player = winner;
    }

    // Cover the advantage square on opponent's board
    const opponent = this.advantage.player === 'player1' ? 'player2' : 'player1';
    this.game.players[opponent].board.coverSquare(this.advantage.square);
    

    console.log(`Advantage applied! Square ${this.advantage.square} covered for ${opponent}`);
  }

  canUncoverAdvantage(currentPlayer) {
    if (!this.advantage.applied) return true;
    
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

  rewindToMove(index) {
    if (index >= 0 && index < this.moveHistory.length) {
      const state = this.moveHistory[index];
      this.loadGame(this, state);
      this.currentMoveIndex = index;
      return true;
    }
    return false;
  }

  saveMoveSnapshot() {
    const state = this.game.getState();
    this.moveHistory.push(JSON.parse(JSON.stringify(state)));
    this.currentMoveIndex = this.moveHistory.length - 1;
  }

}

module.exports = Tournament;