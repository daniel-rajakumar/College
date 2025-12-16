import { HumanPlayer } from "./HumanPlayer.js";
import { ComputerPlayer } from "./ComputerPlayer.js";
import { GameRound } from "./GameRound.js";

/**
 * Manages players, cumulative scores, round progression, and advantage rules.
 */
export class Tournament {
  constructor(humanName = "Human", computerName = "Computer") {
    this.human = new HumanPlayer(humanName);
    this.computer = new ComputerPlayer(computerName);

    this.currentRound = null;

    this.nextRoundAdvantage = null;
    this.roundNumber = 0;
  }


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

      recipientId = round.getOpponentId(winnerId);
    } else {

      recipientId = winnerId;
    }

    const digitSum = this._digitSum(rawScore);
    this.nextRoundAdvantage = {
      playerId: recipientId,
      digitSum
    };
  }


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

    if (sum >= 10) {
      return this._digitSum(sum);
    }
    return sum;
  }
}
