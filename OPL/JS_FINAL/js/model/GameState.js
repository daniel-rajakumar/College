// js/model/GameState.js
//--------------------------------------------------
// Pure game logic (NO DOM)
//--------------------------------------------------

import { Board } from "./Board.js";
import { Dice } from "./Dice.js";

export class GameState {
  constructor(boardSize = 11) {
    this.boardSize = boardSize;

    this.humanBoard = new Board(boardSize);
    this.computerBoard = new Board(boardSize);

    this.dice = new Dice();

    this.isHumanTurn = true;
    this.gameActive = true;

    this.roundNumber = 1;

    this.humanScore = 0;
    this.computerScore = 0;

    this.currentDice = {
      d1: null,
      d2: null,
      sum: null,
      diceCount: 2,
    };
  }

  //--------------------------------------------------
  // READ STATE
  //--------------------------------------------------
  canHumanRoll() {
    return this.gameActive && this.isHumanTurn;
  }

  getValidHumanCombos(moveMode) {
    if (this.currentDice.sum === null) return [];

    const forCovering = moveMode === "cover";
    const target = forCovering ? this.humanBoard : this.computerBoard;

    return target.findValidCombinations(this.currentDice.sum, forCovering);
  }

  isGameOver() {
    if (this.humanBoard.allCovered()) return "human";
    if (this.computerBoard.allCovered()) return "computer";
    return null;
  }

  //--------------------------------------------------
  // HUMAN TURN
  //--------------------------------------------------
  rollHuman({ mode, diceCount, manualD1, manualD2 }) {
    if (!this.canHumanRoll()) return null;

    let d1, d2;

    if (mode === "manual") {
      d1 = manualD1;
      d2 = diceCount === 2 ? manualD2 : 0;
    } else {
      d1 = this.dice.rollDie();
      d2 = diceCount === 2 ? this.dice.rollDie() : 0;
    }

    const sum = d1 + d2;

    this.currentDice = { d1, d2, sum, diceCount };

    return { d1, d2, sum, diceCount };
  }

  applyHumanMove(combination, moveMode) {
    const forCovering = moveMode === "cover";
    const board = forCovering ? this.humanBoard : this.computerBoard;

    if (!board.isValidCombination(combination, forCovering)) {
      return { ok: false, reason: "Invalid combination" };
    }

    if (forCovering) {
      combination.forEach((sq) => this.humanBoard.coverSquare(sq));
    } else {
      combination.forEach((sq) => this.computerBoard.uncoverSquare(sq));
    }

    // After move
    this.currentDice = { d1: null, d2: null, sum: null, diceCount: 2 };

    const winner = this.isGameOver();
    if (winner) {
      this.gameActive = false;
      return { ok: true, winner };
    }

    // Switch turn
    this.isHumanTurn = false;

    return { ok: true, winner: null };
  }

  endHumanTurnNoMove() {
    if (!this.isHumanTurn || !this.gameActive) return;

    // Clear dice
    this.currentDice = { d1: null, d2: null, sum: null, diceCount: 2 };

    // Pass to computer
    this.isHumanTurn = false;
  }

  //--------------------------------------------------
  // COMPUTER TURN
  //--------------------------------------------------
  runComputerTurn() {
    if (!this.gameActive || this.isHumanTurn) return null;

    // 1-die rule logic
    const canUseOneDie = this.computerBoard.canThrowOneDie();

    const highestUncovered = (b) => {
      for (let v = b.getSize(); v >= 1; v--) {
        if (!b.isSquareCovered(v)) return v;
      }
      return 0;
    };

    const remainingCount = (b) => {
      let c = 0;
      for (let i = 1; i <= b.getSize(); i++) {
        if (!b.isSquareCovered(i)) c++;
      }
      return c;
    };

    let diceCount = 2;
    if (canUseOneDie) {
      if (highestUncovered(this.computerBoard) <= 6) diceCount = 1;
      if (remainingCount(this.computerBoard) <= 3) diceCount = 1;
    }

    const d1 = this.dice.rollDie();
    const d2 = diceCount === 2 ? this.dice.rollDie() : 0;
    const sum = d1 + d2;

    this.currentDice = { d1, d2, sum, diceCount };

    // Determine valid computer moves
    const coverCombos = this.computerBoard.findValidCombinations(sum, true);
    const uncoverCombos = this.humanBoard.findValidCombinations(sum, false);

    if (coverCombos.length === 0 && uncoverCombos.length === 0) {
      // No moves → turn ends
      this.currentDice = { d1: null, d2: null, sum: null, diceCount: 2 };
      this.isHumanTurn = true;
      return {
        action: "pass",
        dice: { d1, d2, sum, diceCount },
        winner: null,
      };
    }

    const chooseBest = (list) => {
      let best = [];
      let bestCount = -1;
      let bestSum = -1;

      for (const comb of list) {
        const count = comb.length;
        const total = comb.reduce((a, b) => a + b, 0);

        if (count > bestCount || (count === bestCount && total > bestSum)) {
          best = comb;
          bestCount = count;
          bestSum = total;
        }
      }
      return best;
    };

    let action = "";
    let usedCombo = null;

    if (coverCombos.length > 0) {
      action = "cover";
      usedCombo = chooseBest(coverCombos);
      usedCombo.forEach((sq) => this.computerBoard.coverSquare(sq));
    } else {
      action = "uncover";
      usedCombo = chooseBest(uncoverCombos);
      usedCombo.forEach((sq) => this.humanBoard.uncoverSquare(sq));
    }

    // Check for win
    const winner = this.isGameOver();
    if (winner) {
      this.gameActive = false;
      return {
        action,
        combo: usedCombo,
        dice: { d1, d2, sum, diceCount },
        winner,
      };
    }

    // Switch back to human
    this.isHumanTurn = true;
    this.currentDice = { d1: null, d2: null, sum: null, diceCount: 2 };

    return {
      action,
      combo: usedCombo,
      dice: { d1, d2, sum, diceCount },
      winner: null,
    };
  }

  //--------------------------------------------------
  // Saving & Loading
  //--------------------------------------------------
  toJSON() {
    return {
      boardSize: this.boardSize,
      humanSquares: [...this.humanBoard.squares],
      computerSquares: [...this.computerBoard.squares],
      isHumanTurn: this.isHumanTurn,
      gameActive: this.gameActive,
      currentDice: this.currentDice,
      roundNumber: this.roundNumber,
      humanScore: this.humanScore,
      computerScore: this.computerScore,
    };
  }

  static fromJSON(data) {
    const g = new GameState(data.boardSize);

    g.humanBoard.squares = [...data.humanSquares];
    g.computerBoard.squares = [...data.computerSquares];

    g.isHumanTurn = data.isHumanTurn;
    g.gameActive = data.gameActive;
    g.currentDice = data.currentDice || { d1: null, d2: null, sum: null, diceCount: 2 };
    g.roundNumber = data.roundNumber;
    g.humanScore = data.humanScore;
    g.computerScore = data.computerScore;

    return g;
  }
}
