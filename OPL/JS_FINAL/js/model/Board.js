// js/model/Board.js
export class Board {
  constructor(size) {
    this.size = size;            // 9,10,11
    this.squares = [];
    for (let i = 1; i <= size; i++) {
      this.squares.push(i);      // i if uncovered, 0 if covered (matches spec) :contentReference[oaicite:2]{index=2}
    }
  }

  isCovered(square) {
    return this.squares[square - 1] === 0;
  }

  cover(square) {
    this.squares[square - 1] = 0;
  }

  uncover(square) {
    this.squares[square - 1] = square;
  }

  allCovered() {
    return this.squares.every(v => v === 0);
  }

  allUncovered() {
    return this.squares.every((v, i) => v === i + 1);
  }

  clone() {
    const b = new Board(this.size);
    b.squares = [...this.squares];
    return b;
  }
}
