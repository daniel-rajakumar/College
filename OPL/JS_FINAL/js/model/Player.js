// js/model/Player.js
export class Player {
  constructor(name, board) {
    this.name = name;       // 'Human' or 'Computer'
    this.board = board;     // Board instance
    this.totalScore = 0;    // tournament score
  }

  addScore(points) {
    this.totalScore += points;
  }
}
