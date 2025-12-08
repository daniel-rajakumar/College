// js/model/GameRound.js
export class GameRound {
  constructor(human, computer, dice) {
    this.human = human;
    this.computer = computer;
    this.dice = dice;

    this.firstPlayer = null;    // 'Human' or 'Computer'
    this.nextPlayer = null;
    this.winner = null;         // Player instance
    this.winnerReason = null;   // 'cover' or 'uncover'
  }

  determineFirstPlayer() {
    let hSum, cSum;
    do {
      const hr = this.dice.roll(2);
      const cr = this.dice.roll(2);
      hSum = hr.d1 + hr.d2;
      cSum = cr.d1 + cr.d2;
    } while (hSum === cSum);

    this.firstPlayer = hSum > cSum ? 'Human' : 'Computer';
    this.nextPlayer = this.firstPlayer;
  }

  // check if round is over (covers all own OR uncovers all opponent) :contentReference[oaicite:5]{index=5}
  checkWin() {
    const hBoard = this.human.board;
    const cBoard = this.computer.board;

    if (hBoard.allCovered() || cBoard.allUncovered()) {
      this.winner = this.human;
      this.winnerReason = hBoard.allCovered() ? 'cover' : 'uncover';
      return true;
    }
    if (cBoard.allCovered() || hBoard.allUncovered()) {
      this.winner = this.computer;
      this.winnerReason = cBoard.allCovered() ? 'cover' : 'uncover';
      return true;
    }
    return false;
  }

  computeRoundScore() {
    if (!this.winner) return 0;
    if (this.winner === this.human) {
      if (this.winnerReason === 'cover') {
        // human covered all → score = sum of computer’s uncovered squares
        return this.computer.board.squares
          .filter(v => v !== 0)
          .reduce((a, b) => a + b, 0);
      } else {
        // human uncovered all → score = sum of human’s covered squares
        return this.human.board.squares
          .filter(v => v === 0)
          .reduce((acc, _, idx) => acc + (idx + 1), 0);
      }
    } else {
      // symmetric for computer
      if (this.winnerReason === 'cover') {
        return this.human.board.squares
          .filter(v => v !== 0)
          .reduce((a, b) => a + b, 0);
      } else {
        return this.computer.board.squares
          .filter(v => v === 0)
          .reduce((acc, _, idx) => acc + (idx + 1), 0);
      }
    }
  }
}
