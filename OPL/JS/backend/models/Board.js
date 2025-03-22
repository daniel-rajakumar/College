class Board {
  constructor(size) {
    this.squares = Array.from({ length: size }, (_, i) => i + 1);
    this.covered = new Array(size).fill(true); // true means covered, false means uncovered
  }

  coverSquare(index) {
    if (index >= 1 && index <= this.squares.length) {
      this.covered[index - 1] = true;
    }
  }

  uncoverSquare(index) {
    if (index >= 1 && index <= this.squares.length) {
      this.covered[index - 1] = false;
    }
  }

  getSquares() {
    return this.squares;
  }

  getCovered() {
    return this.covered;
  }
}

module.exports = Board;