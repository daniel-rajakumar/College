class Player {
  constructor(board, tournament) {
    this.tournament = tournament;
    this.board = board;
    this.score = 0;
    this.hasFirstTurnBeenPlayed = false;
  }

  getScore() {
    return this.score;
  }

  updateScore(points) {
    this.score += points;
  }

  chooseMove(diceSum, opponentBoard) {
    const coverOptions = this.findBestCombination(this.board, diceSum, true);
    
    if (coverOptions.length > 0) {
      return {
        action: 'cover',
        combination: this.selectBestCombination(coverOptions),
        reason: "Covering my squares to maximize my advantage"
      };
    }

    const uncoverOptions = this.findBestCombination(opponentBoard, diceSum, false);
    
    if (uncoverOptions.length > 0) {
      return {
        action: 'uncover',
        combination: this.selectBestCombination(uncoverOptions),
        reason: "Uncovering opponent's squares to minimize their advantage"
      };
    }

    return {
      action: 'none',
      combination: [],
      reason: "No valid moves available"
    };
  }
}

module.exports = Player;