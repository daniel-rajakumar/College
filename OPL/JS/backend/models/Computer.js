const Player = require("../models/Player");
const Tournament = require("../models/Tournament");

class Computer extends Player {
  constructor(board) {
    super(board);
    this.type = "computer";
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
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;

    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.board.isValidCombination(path, forCovering)) {
          if (!(advantageApplied && isOpponentBoard && path.includes(advantageSquare))) {
            combinations.push([...path]);
          }
        }
        return;
      }

      for (let i = start; i <= board.size; i++) {
        if (advantageApplied && isOpponentBoard && i === advantageSquare) {
          continue;
        }

        if ((forCovering && !board.isSquareCovered(i)) || (!forCovering && board.isSquareCovered(i))) {
          if (i <= remaining) {
            path.push(i);
            backtrack(i + 1, path, remaining - i);
            path.pop();
          }
        }
      }
    };

    backtrack(1, [], sum);
    return combinations;
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