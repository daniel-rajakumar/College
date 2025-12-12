// js/model/GameRound.js
import { Board } from "./Board.js";

/**
 * GameRound = one round of Canoga between the same two players.
 *
 * Players are Player instances (HumanPlayer / ComputerPlayer) passed in.
 * This class:
 *  - creates new boards for this round
 *  - applies handicap/advantage
 *  - validates and applies moves (cover/uncover)
 *  - detects when the round is over and computes round score
 */
export class GameRound {
  /**
   * @param {Object} params
   *  - boardSize: number (9, 10, or 11)
   *  - humanPlayer
   *  - computerPlayer
   *  - firstPlayerId: "HUMAN" | "COMPUTER"
   *  - advantageInfo: { playerId, digitSum } | null
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

    // Fresh boards for this round:
    this.human.board = new Board(boardSize);
    this.computer.board = new Board(boardSize);

    this.firstPlayerId = firstPlayerId;
    this.currentPlayerId = firstPlayerId;

    // Advantage (handicap) info from *previous* round:
    // digitSum is in range 0..9; we convert to an actual square if in range.
    this.advantageInfo = advantageInfo; // { playerId, digitSum }
    this.advantageLock = null; // see below
    this._applyAdvantageIfAny();

    // Round end state:
    this.roundOver = false;
    this.roundWinnerId = null; // "HUMAN" | "COMPUTER"
    this.winType = null;       // "cover" | "uncover"
    this.roundScore = 0;

    // Track whether a side has ever covered at least one square this round
    this.humanEverCovered = false;
    this.computerEverCovered = false;
  }

  getPlayerById(id) {
    if (id === "HUMAN") return this.human;
    if (id === "COMPUTER") return this.computer;
    throw new Error(`Unknown player id: ${id}`);
  }

  getOpponentId(playerId) {
    return playerId === "HUMAN" ? "COMPUTER" : "HUMAN";
  }

  getOpponent(playerId) {
    return this.getPlayerById(this.getOpponentId(playerId));
  }

  /**
   * Return the currently locked advantage square for the given player (if any), else null.
   * Locked means the opponent cannot uncover it yet.
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
   * Internal: apply starting advantage (if any) by pre-covering one square
   * for the player who has the advantage.
   *
   * Rule: advantage square = digitSum of previous winning score.
   * That square must exist (1..boardSize).
   */
  _applyAdvantageIfAny() {
    if (!this.advantageInfo) return;

    const { playerId, digitSum } = this.advantageInfo;
    // digitSum is 0..9, but we only use it if in 1..boardSize
    if (!Number.isInteger(digitSum)) return;
    const squareNumber = digitSum;
    if (squareNumber < 1 || squareNumber > this.boardSize) {
      // no valid square for this board size => no advantage this round
      return;
    }

    const player = this.getPlayerById(playerId);
    player.board.coverSquares([squareNumber]);

    // Lock rule: this advantage square cannot be uncovered by the opponent
    // until the advantage player has completed at least one turn this round.
    this.advantageLock = {
      playerId,       // the player who has the advantage (the one whose board has this pre-covered square)
      squareNumber,
      unlocked: false // becomes true after that player finishes one full turn
    };
  }

  /**
   * Should be called by controller after a player's *turn* has fully ended
   * (i.e., after they roll dice until no moves possible).
   * This will unlock the advantage square for the opponent if needed.
   */
  notifyTurnEnded(playerId) {
    if (!this.advantageLock) return;
    if (this.advantageLock.playerId === playerId && !this.advantageLock.unlocked) {
      this.advantageLock.unlocked = true;
    }
  }

  /**
   * Returns all cover options for a given player and dice sum.
   * This uses the *player's own board*.
   * @returns {number[][]}
   */
  getCoverOptions(playerId, sum) {
    const player = this.getPlayerById(playerId);
    return player.board.getCoverCombos(sum);
  }

  /**
   * Returns all uncover options for a given player and dice sum.
   * This uses the *opponent's board*.
   * If there is a locked advantage square on opponent's board, it will be excluded.
   * @returns {number[][]}
   */
  getUncoverOptions(playerId, sum) {
    const opponent = this.getOpponent(playerId);
    let combos = opponent.board.getUncoverCombos(sum);

    // Apply advantage lock rule:
    // the advantage square (on advantage player's board) cannot be
    // uncovered by the opponent until the advantage player has completed one turn.
    if (
      this.advantageLock &&
      !this.advantageLock.unlocked &&
      // acting player is *not* the advantage holder (i.e., they are the opponent)
      playerId !== this.advantageLock.playerId
    ) {
      combos = combos.filter(
        combo => !combo.includes(this.advantageLock.squareNumber)
      );
    }

    return combos;
  }

  /**
   * Apply a move to cover the player's own squares.
   * Does NOT check that the squares correspond to the dice sum; that should be validated by caller using getCoverOptions().
   */
  applyCoverMove(playerId, squares) {
    const player = this.getPlayerById(playerId);
    player.board.coverSquares(squares);
    if (playerId === "HUMAN") this.humanEverCovered = true;
    if (playerId === "COMPUTER") this.computerEverCovered = true;
    this._checkForRoundEnd();
  }

  /**
   * Apply a move to uncover the opponent's squares.
   * Does NOT check that the squares correspond to the dice sum; that should be validated by caller using getUncoverOptions().
   */
  applyUncoverMove(playerId, squares) {
    const opponent = this.getOpponent(playerId);
    opponent.board.uncoverSquares(squares);
    this._checkForRoundEnd();
  }

  /**
   * Switch current player to opponent.
   */
  switchTurn() {
    this.currentPlayerId = this.getOpponentId(this.currentPlayerId);
  }

  /**
   * Internal: check if someone has just won the round.
   * A player wins by:
   *   - covering all own squares, OR
   *   - uncovering all opponent squares.
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
      // Human has uncovered all computer squares (and there were some to uncover)
      winnerId = "HUMAN";
      winType = "uncover";
    } else if (humanCoveredCount === 0 && this._hadAnyCovered(this.human)) {
      // Computer has uncovered all human squares (and there were some to uncover)
      winnerId = "COMPUTER";
      winType = "uncover";
    }

    if (!winnerId) return;

    this.roundOver = true;
    this.roundWinnerId = winnerId;
    this.winType = winType;
    this.roundScore = this._computeRoundScore(winnerId, winType);

    // Add to tournament total score for the winner
    const winner = this.getPlayerById(winnerId);
    winner.addToScore(this.roundScore);
  }

  /**
   * Compute round score for given winner + winType.
   * If winType === "cover": score = sum of opponent's *uncovered* squares.
   * If winType === "uncover": score = sum of winner's *covered* squares.
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
   * Convenience: returns a plain object representing snapshot of this round
   * (useful for debugging, testing, or serialization glue).
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

  _hadAnyCovered(player) {
    if (player.id === "HUMAN") return this.humanEverCovered;
    if (player.id === "COMPUTER") return this.computerEverCovered;
    return false;
  }
}
