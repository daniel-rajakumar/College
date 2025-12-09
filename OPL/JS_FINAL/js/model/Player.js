
// js/model/Player.js

export class Player {
  constructor(board, human) {
    this.board = board;
    this.isHuman = human;
    this.input = 0;
  }

  getBoard() {
    return this.board;
  }

  canThrowOneDie() {
    // same rule as Board.canThrowOneDie, but from player's perspective
    for (let i = 7; i <= this.board.getSize(); ++i) {
      if (!this.board.isSquareCovered(i)) {
        return false;
      }
    }
    return true;
  }

  getIsHuman() {
    return this.isHuman;
  }

  // abstract
  takeTurn() {
    throw new Error("takeTurn() must be implemented by subclasses");
  }
}




