// js/model/Tournament.js
import { HumanPlayer } from "./HumanPlayer.js";
import { ComputerPlayer } from "./ComputerPlayer.js";
import { GameRound } from "./GameRound.js";

/**
 * Tournament = sequence of rounds between the same human + computer.
 * Keeps track of:
 *  - players
 *  - cumulative scores
 *  - current round
 *  - advantage (handicap) to apply to NEXT round
 */
export class Tournament {
  constructor(humanName = "Human", computerName = "Computer") {
    this.human = new HumanPlayer(humanName);
    this.computer = new ComputerPlayer(computerName);

    this.currentRound = null;
    // { playerId: "HUMAN" | "COMPUTER", digitSum: 0..9 } | null
    this.nextRoundAdvantage = null;
    this.roundNumber = 0;
  }

  /**
   * Start a new round with given board size and first-player id.
   * Applies any stored advantage from previous round.
   */
  startNewRound(boardSize, firstPlayerId) {
    this.roundNumber += 1;
    this.currentRound = new GameRound({
      boardSize,
      humanPlayer: this.human,
      computerPlayer: this.computer,
      firstPlayerId,
      advantageInfo: this.nextRoundAdvantage
    });
    return this.currentRound;
  }

  /**
   * Must be called AFTER a round is over (GameRound.roundOver === true).
   * Computes who gets advantage in next round (if any).
   *
   * Rule:
   *  - If winner WAS the first player in this round => advantage goes to opponent.
   *  - If winner was NOT first player => winner keeps advantage.
   *  - Advantage square number = digit sum of winning score (0–9).
   */
  updateAdvantageForNextRound() {
    const round = this.currentRound;
    if (!round || !round.roundOver || !round.roundWinnerId) {
      this.nextRoundAdvantage = null;
      return;
    }

    const winnerId = round.roundWinnerId;
    const firstPlayerId = round.firstPlayerId;
    const rawScore = round.roundScore;

    if (rawScore <= 0) {
      this.nextRoundAdvantage = null;
      return;
    }

    let recipientId;
    if (winnerId === firstPlayerId) {
      // winner started first -> advantage goes to opponent
      recipientId = round.getOpponentId(winnerId);
    } else {
      // winner was second -> winner keeps advantage
      recipientId = winnerId;
    }

    const digitSum = this._digitSum(rawScore);
    this.nextRoundAdvantage = {
      playerId: recipientId,
      digitSum
    };
  }

  /**
   * Determine tournament result: who has more cumulative points.
   * @returns {{
   *  winnerId: "HUMAN" | "COMPUTER" | "DRAW",
   *  humanScore: number,
   *  computerScore: number
   * }}
   */
  getTournamentResult() {
    const humanScore = this.human.totalScore;
    const computerScore = this.computer.totalScore;

    let winnerId = "DRAW";
    if (humanScore > computerScore) winnerId = "HUMAN";
    else if (computerScore > humanScore) winnerId = "COMPUTER";

    return {
      winnerId,
      humanScore,
      computerScore
    };
  }

  _digitSum(n) {
    let sum = 0;
    let x = Math.abs(Math.trunc(n));
    if (x === 0) return 0;
    while (x > 0) {
      sum += x % 10;
      x = Math.floor(x / 10);
    }
    // spec says sum is put in range 0..9; if >9, sum digits again
    if (sum >= 10) {
      return this._digitSum(sum);
    }
    return sum;
  }
}
