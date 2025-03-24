const Player = require("../models/Player");

class Computer extends Player {
  constructor(board) {
    super(board);
  }

  decideDiceThrow() {
    const squares7toN = this.board.squares.slice(6);
    const allCovered = squares7toN.every((_, index) => this.board.isSquareCovered(index + 7));
    return allCovered ? 1 : 2;
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

  suggestMove(diceSum, opponentBoard) {
    return this.chooseMove(diceSum, opponentBoard);
  }

  findBestCombination(board, sum, forCovering) {
    const validCombinations = board.findValidCombinations(sum, forCovering);
    
    if (Tournament.getAdvantageApplied()) {
      const advantageSquare = Tournament.getAdvantageSquare();
      return validCombinations.filter(combo => !combo.includes(advantageSquare));
    }
    
    return validCombinations;
  }

  selectBestCombination(combinations) {
    return combinations.reduce((best, current) => {
      if (current.length > best.length) return current;
      if (current.length === best.length) {
        return current.reduce((a, b) => a + b, 0) > best.reduce((a, b) => a + b, 0) ? current : best;
      }
      return best;
    }, []);
  }

  takeTurn(diceSum, opponentBoard) {
    const move = this.chooseMove(diceSum, opponentBoard);
    
    if (move.action === 'cover') {
      move.combination.forEach(square => this.board.coverSquare(square));
    } 
    else if (move.action === 'uncover') {
      move.combination.forEach(square => opponentBoard.uncoverSquare(square));
    }
    
    return move;
  }
}

module.exports = Computer;