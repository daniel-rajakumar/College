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
      firstPlayer: null,
      winner: null,
      winnerScore: null,
      hasTakenTurn: false  
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
    if (score <= 0) return 1; // Minimum square is 1
  
    // Sum all digits (0-9 result)
    const sum = String(score).split('')
                      .map(Number)
                      .reduce((a, b) => a + b, 0);
    
    // Special case: sum=0 → use square 1
    return sum === 0 ? 1 : sum;
  }

  applyAdvantage(winner, winnerScore) {
    if (!winner) return;
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;

    // Determine who gets the advantage
    if (winner === this.advantage.firstPlayer) {
      // Winner took first turn → opponent gets advantage
      this.advantage.player = winner === 'player1' ? 'player2' : 'player1';
    } else {
      // Winner didn't take first turn → winner gets advantage
      this.advantage.player = winner;
    }
  
    // Cover the advantage square on the appropriate board
    const advantagedPlayer = this.advantage.player;
    const opponent = advantagedPlayer === 'player1' ? 'player2' : 'player1';
    
    // Cover the square on opponent's board if advantaged player is current player
    // this.game.players[opponent].board.coverSquare(this.advantage.square);
    this.game.players[advantagedPlayer].board.coverSquare(this.advantage.square);
    this.advantage.hasTakenTurn = false;  // Reset for new round
    
    console.log(`Advantage applied! Square ${this.advantage.square} covered for ${opponent}`);
  }

  canUncoverAdvantage(currentPlayer) {
    if (!this.advantage.applied) return true;
    
    // If current player is not the one with advantage, check if advantaged player has had a turn
    if (currentPlayer !== this.advantage.player) {
      return this.advantage.hasTakenTurn;
    }
    
    return true;
  }

  // Add this method to update turn tracking
  recordTurn(player) {
    if (this.advantage.applied && player === this.advantage.player) {
      this.advantage.hasTakenTurn = true;
    }
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