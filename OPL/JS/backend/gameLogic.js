class CanogaGame {
  constructor() {
    this.humanSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.computerSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.humanScore = 0;
    this.computerScore = 0;
    this.currentPlayer = "human"; // human or computer
  }

  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    return { dice1, dice2, total: dice1 + dice2 };
  }

  newRound() {
    this.humanSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.computerSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return { humanSquares: this.humanSquares, computerSquares: this.computerSquares };
  }

  // Add more game logic here (e.g., covering/uncovering squares, scoring)
}

module.exports = CanogaGame;