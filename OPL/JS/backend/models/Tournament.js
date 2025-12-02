const Game = require("../models/Game");
const Board = require("./Board");
const Human = require("./Human");
const Computer = require("./Computer");

/**
 * Represents a multi-round tournament for the board game.
 * Manages applied advantages, move history, and transitions between game states.
 */
class Tournament {
  /**
   * Initializes the Tournament with a new Game instance
   * and default advantage properties.
   */
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

  /**
   * Sets which player started first in this tournament.
   * @param {string} player - "player1" or "player2" indicating the first player.
   */
  setFirstPlayer(player) {
    this.advantage.firstPlayer = player;
  }

  /**
   * Loads a previously saved or newly created game into the tournament.
   * @param {Tournament} tournament - The current tournament context.
   * @param {Object} state - The saved state for loading.
   */
  loadGame(tournament, state) {
    let n = state.player1.squares.length;
    this.game = new Game(tournament, n);

    this.game.players.player1 = state.player1Type === "human"
      ? new Human(new Board(n), this.game)
      : new Computer(new Board(n), this.game);
  
    this.game.players.player2 = state.player2Type === "human"
      ? new Human(new Board(n), this.game)
      : new Computer(new Board(n), this.game);
  
    if (n !== 0) {
      this.game.players.player1.board.setSquareValues(state.player1.squares);
      this.game.players.player2.board.setSquareValues(state.player2.squares);
    }

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

  /**
   * Retrieves the currently assigned advantage square number.
   * @returns {number|null} The advantage square number or null if not set.
   */
  getAdvantageSquare() {
    return this.advantage.square;
  }

  /**
   * Determines whether advantage is currently applied.
   * @returns {boolean} True if advantage is applied, false otherwise.
   */
  getAdvantageApplied() {
    return this.advantage.applied;
  }

  /**
   * Retrieves the player who has the advantage.
   * @returns {string|null} "player1" or "player2" if advantage is active, null otherwise.
   */
  getAdvantagePlayer() {
    return this.advantage.player;
  }

  /**
   * Calculates which square should be advantaged based on a score.
   * Sums the digits of the player's score; if 0, returns 1.
   * @param {number} score - The player's current score.
   * @returns {number} The calculated square number.
   */
  calculateAdvantageSquare(score) {
    if (score <= 0) return 1;
    const sum = String(score)
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
    return sum === 0 ? 1 : sum;
  }

  /**
   * Applies advantage to the opponent if the winner is the same as the first player,
   * otherwise applies advantage to the winner itself.
   * Covers the advantage square on the opponent's board.
   *
   * @param {string} winner - "player1" or "player2" who won the round.
   * @param {number} winnerScore - Score of the round winner.
   */
  applyAdvantage(winner, winnerScore) {
    if (!winner) return;
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;

    if (winner === this.advantage.firstPlayer) {
      this.advantage.player = winner === "player1" ? "player2" : "player1";
    } else {
      this.advantage.player = winner;
    }

    const advantagedPlayer = this.advantage.player;
    const opponent = advantagedPlayer === "player1" ? "player2" : "player1";

    // Cover the advantage square on the opponent's board
    this.game.players[opponent].board.coverSquare(this.advantage.square);
    this.advantage.hasTakenTurn = false;

    console.log(`Advantage applied! Square ${this.advantage.square} covered for ${opponent}`);
  }

  /**
   * Determines if the advantage square can be uncovered based on the current player
   * and whether they have already taken a turn since advantage was applied.
   * @param {string} currentPlayer - The active player ("player1" or "player2").
   * @returns {boolean} True if uncovered is allowed, false otherwise.
   */
  canUncoverAdvantage(currentPlayer) {
    if (!this.advantage.applied) return true;
    if (currentPlayer !== this.advantage.player) {
      return this.advantage.hasTakenTurn;
    }
    return true;
  }

  /**
   * Records that the advantage-holding player has taken a turn.
   * @param {string} player - "player1" or "player2" who took the turn.
   */
  recordTurn(player) {
    if (this.advantage.applied && player === this.advantage.player) {
      this.advantage.hasTakenTurn = true;
    }
  }

  /**
   * Completely clears the advantage state.
   */
  clearAdvantage() {
    this.advantage.square = null;
    this.advantage.applied = false;
    this.advantage.player = null;
  }

  /**
   * Returns the full state of the current game along with advantage info.
   * @returns {Object} Combined state of game and advantage.
   */
  getState() {
    const gameState = this.game.getState();
    return {
      ...gameState,
      advantage: { ...this.advantage }
    };
  }

  /**
   * Rewinds the game to a specific move index in the history, if valid.
   * @param {number} index - Index of the move to rewind to.
   * @returns {boolean} True if successfully rewound, else false.
   */
  rewindToMove(index) {
    if (index >= 0 && index < this.moveHistory.length) {
      const state = this.moveHistory[index];
      this.loadGame(this, state);
      this.currentMoveIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Records the current game state into the move history stack.
   */
  saveMoveSnapshot() {
    const state = this.game.getState();
    this.moveHistory.push(JSON.parse(JSON.stringify(state)));
    this.currentMoveIndex = this.moveHistory.length - 1;
  }
}

module.exports = Tournament;