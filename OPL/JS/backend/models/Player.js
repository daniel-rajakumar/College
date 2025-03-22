class Player {
  constructor(board) {
    this.board = board;
    this.score = 0;
  }

  getScore() {
    return this.score;
  }

  updateScore(points) {
    this.score += points;
  }
}

module.exports = Player;