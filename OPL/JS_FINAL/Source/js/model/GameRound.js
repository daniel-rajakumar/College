
import { Board } from "./Board.js";

/**
 * Represents a single round of Canoga, tracking boards, turn flow, and scoring.
 */
export class GameRound {

  /**
   * @param {Object} params
   * @param {number} params.boardSize
   * @param {*} params.humanPlayer
   * @param {*} params.computerPlayer
   * @param {"HUMAN"|"COMPUTER"} params.firstPlayerId
   * @param {{playerId:string,digitSum:number}|null} params.advantageInfo
   */
  constructor({ boardSize, humanPlayer, computerPlayer, firstPlayerId, advantageInfo = null }) {
    if (!Number.isInteger(boardSize) || boardSize < 1) {
      throw new Error("boardSize must be positive integer");
    }
    if (firstPlayerId !== "HUMAN" && firstPlayerId !== "COMPUTER") {
      throw new Error('firstPlayerId must be "HUMAN" or "COMPUTER"');
    }

    this.boardSize = boardSize;
    this.human = humanPlayer;
    this.computer = computerPlayer;

    this.human.board = new Board(boardSize);
    this.computer.board = new Board(boardSize);

    this.firstPlayerId = firstPlayerId;
    this.currentPlayerId = firstPlayerId;


    this.advantageInfo = advantageInfo;
    this.advantageLock = null;
    this._applyAdvantageIfAny();

    this.roundOver = false;
    this.roundWinnerId = null;
    this.winType = null;
    this.roundScore = 0;

    this.humanEverCovered = this.human.board.getCoveredNumbers().length > 0;
    this.computerEverCovered = this.computer.board.getCoveredNumbers().length > 0;
  }

  /**
   * @param {"HUMAN"|"COMPUTER"} id
   * @returns {*} player instance
   */
  getPlayerById(id) {
    if (id === "HUMAN") return this.human;
    if (id === "COMPUTER") return this.computer;
    throw new Error(`Unknown player id: ${id}`);
  }

  /**
   * @param {"HUMAN"|"COMPUTER"} playerId
   * @returns {"HUMAN"|"COMPUTER"} opponent id
   */
  getOpponentId(playerId) {
    return playerId === "HUMAN" ? "COMPUTER" : "HUMAN";
  }

  /**
   * @param {"HUMAN"|"COMPUTER"} playerId
   * @returns {*} opponent player instance
   */
  getOpponent(playerId) {
    return this.getPlayerById(this.getOpponentId(playerId));
  }

  /**
   * @param {"HUMAN"|"COMPUTER"} playerId
   * @returns {number|null} locked advantage square if not yet unlocked
   */
  getLockedAdvantageSquare(playerId) {
    if (
      this.advantageLock &&
      this.advantageLock.playerId === playerId &&
      Number.isInteger(this.advantageLock.squareNumber) &&
      !this.advantageLock.unlocked
    ) {
      return this.advantageLock.squareNumber;
    }
    return null;
  }


  /**
   * Apply starting advantage by pre-covering and locking a square if valid.
   */
  _applyAdvantageIfAny() {
    if (!this.advantageInfo) return;

    const { playerId, digitSum } = this.advantageInfo;

    if (!Number.isInteger(digitSum)) return;
    const squareNumber = digitSum;
    if (squareNumber < 1 || squareNumber > this.boardSize) {

      return;
    }

    const player = this.getPlayerById(playerId);
    player.board.coverSquares([squareNumber]);


    this.advantageLock = {
      playerId,
      squareNumber,
      unlocked: false
    };
  }


  /**
   * Unlock advantage square after the advantage-holder completes a turn.
   */
  notifyTurnEnded(playerId) {
    if (!this.advantageLock) return;
    if (this.advantageLock.playerId === playerId && !this.advantageLock.unlocked) {
      this.advantageLock.unlocked = true;
    }
  }

  /**
   * Return all cover combos for the acting player and dice sum.
   */
  getCoverOptions(playerId, sum) {
    const player = this.getPlayerById(playerId);
    return player.board.getCoverCombos(sum);
  }

  /**
   * Return uncover combos against the opponent, honoring advantage locks.
   */
  getUncoverOptions(playerId, sum) {
    const opponent = this.getOpponent(playerId);
    let combos = opponent.board.getUncoverCombos(sum);



    if (
      this.advantageLock &&
      !this.advantageLock.unlocked &&

      playerId !== this.advantageLock.playerId
    ) {
      combos = combos.filter(
        combo => !combo.includes(this.advantageLock.squareNumber)
      );
    }

    return combos;
  }


  /**
   * Apply a cover move to the acting player's board and re-check win state.
   */
  applyCoverMove(playerId, squares) {
    const player = this.getPlayerById(playerId);
    player.board.coverSquares(squares);
    if (playerId === "HUMAN") this.humanEverCovered = true;
    if (playerId === "COMPUTER") this.computerEverCovered = true;
    this._checkForRoundEnd();
  }


  /**
   * Apply an uncover move to the opponent board and re-check win state.
   */
  applyUncoverMove(playerId, squares) {
    const opponent = this.getOpponent(playerId);
    opponent.board.uncoverSquares(squares);
    this._checkForRoundEnd();
  }


  /**
   * Swap current player turn.
   */
  switchTurn() {
    this.currentPlayerId = this.getOpponentId(this.currentPlayerId);
  }


  /**
   * Determine win conditions after a move and update scores if over.
   */
  _checkForRoundEnd() {
    const humanCoveredAll = this.human.board.areAllCovered();
    const compCoveredAll = this.computer.board.areAllCovered();
    const humanCoveredCount = this.human.board.getCoveredNumbers().length;
    const compCoveredCount = this.computer.board.getCoveredNumbers().length;

    let winnerId = null;
    let winType = null;

    if (humanCoveredAll) {
      winnerId = "HUMAN";
      winType = "cover";
    } else if (compCoveredAll) {
      winnerId = "COMPUTER";
      winType = "cover";
    } else if (compCoveredCount === 0 && this._hadAnyCovered(this.computer)) {

      winnerId = "HUMAN";
      winType = "uncover";
    } else if (humanCoveredCount === 0 && this._hadAnyCovered(this.human)) {

      winnerId = "COMPUTER";
      winType = "uncover";
    }

    if (!winnerId) return;

    this.roundOver = true;
    this.roundWinnerId = winnerId;
    this.winType = winType;
    this.roundScore = this._computeRoundScore(winnerId, winType);

    const winner = this.getPlayerById(winnerId);
    winner.addToScore(this.roundScore);
  }


  /**
   * Calculate round score based on win type and remaining opponent squares.
   * @param {"HUMAN"|"COMPUTER"} winnerId
   * @param {"cover"|"uncover"} winType
   * @returns {number}
   */
  _computeRoundScore(winnerId, winType) {
    const winner = this.getPlayerById(winnerId);
    const loser = this.getOpponent(winnerId);

    if (winType === "cover") {
      const oppUncovered = loser.board.getUncoveredNumbers();
      return oppUncovered.reduce((acc, n) => acc + n, 0);
    } else if (winType === "uncover") {
      const ownCovered = winner.board.getCoveredNumbers();
      return ownCovered.reduce((acc, n) => acc + n, 0);
    }

    return 0;
  }


  /**
   * Snapshot of core round state, boards, and scores.
   * @returns {object}
   */
  toStateObject() {
    return {
      boardSize: this.boardSize,
      firstPlayerId: this.firstPlayerId,
      currentPlayerId: this.currentPlayerId,
      advantageInfo: this.advantageInfo
        ? { ...this.advantageInfo }
        : null,
      advantageLock: this.advantageLock
        ? { ...this.advantageLock }
        : null,
      roundOver: this.roundOver,
      roundWinnerId: this.roundWinnerId,
      winType: this.winType,
      roundScore: this.roundScore,
      human: {
        id: this.human.id,
        totalScore: this.human.totalScore,
        board: {
          covered: this.human.board.getCoveredNumbers(),
          uncovered: this.human.board.getUncoveredNumbers()
        }
      },
      computer: {
        id: this.computer.id,
        totalScore: this.computer.totalScore,
        board: {
          covered: this.computer.board.getCoveredNumbers(),
          uncovered: this.computer.board.getUncoveredNumbers()
        }
      }
    };
  }

  /**
   * @param {*} player
   * @returns {boolean} true if player covered any square this round
   */
  _hadAnyCovered(player) {
    if (player.id === "HUMAN") return this.humanEverCovered;
    if (player.id === "COMPUTER") return this.computerEverCovered;
    return false;
  }
}
