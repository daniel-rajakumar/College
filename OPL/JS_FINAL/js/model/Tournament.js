// js/model/Tournament.js
import { Board } from './Board.js';
import { HumanPlayer } from './HumanPlayer.js';
import { ComputerPlayer } from './ComputerPlayer.js';
import { GameRound } from './GameRound.js';

export class Tournament {
  constructor(boardSize, dice) {
    this.boardSize = boardSize;
    this.dice = dice;

    this.human = new HumanPlayer(new Board(boardSize));
    this.computer = new ComputerPlayer(new Board(boardSize));

    this.currentRound = null;

    // handicap
    this.advantageOwner = null;   // 'Human' or 'Computer'
    this.advantageSquare = null;  // 1..9
    this.lastWinnerWasFirst = false;
  }

  startNewRound() {
    // new boards each round
    this.human.board = new Board(this.boardSize);
    this.computer.board = new Board(this.boardSize);

    // apply advantage if any
    if (this.advantageOwner && this.advantageSquare != null) {
      const target =
        this.advantageOwner === 'Human' ? this.human.board : this.computer.board;
      target.cover(this.advantageSquare);
    }

    this.currentRound = new GameRound(this.human, this.computer, this.dice);
    this.currentRound.determineFirstPlayer();
  }

  finishRound() {
    const roundScore = this.currentRound.computeRoundScore();
    const winner = this.currentRound.winner;
    winner.addScore(roundScore);

    // compute new advantage
    const digitSum = String(roundScore)
      .split('')
      .map(Number)
      .reduce((a, b) => a + b, 0);

    const winnerWasFirst =
      this.currentRound.firstPlayer === this.currentRound.winner.name;
    this.lastWinnerWasFirst = winnerWasFirst;

    if (winnerWasFirst) {
      // advantage goes to opponent
      this.advantageOwner = winner === this.human ? 'Computer' : 'Human';
    } else {
      // winner keeps advantage
      this.advantageOwner = winner.name;
    }
    this.advantageSquare = digitSum; // 0..9, fits rubric example with 27->9 :contentReference[oaicite:8]{index=8}
  }

  getWinnerOfTournament() {
    if (this.human.totalScore > this.computer.totalScore) return this.human;
    if (this.computer.totalScore > this.human.totalScore) return this.computer;
    return null; // draw
  }
}
