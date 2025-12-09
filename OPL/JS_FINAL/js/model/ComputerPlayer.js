
// js/model/ComputerPlayer.js

import { Player } from "./Player.js";
import { BoardView, section, c, DIM, GREEN, YELLOW } from "../ui/View.js";
import { Tournament } from "./Tournament.js";
import { Board } from "./Board.js";

export class ComputerPlayer extends Player {
  constructor(board, humanBoard) {
    super(board, false);
    this.boardView = new BoardView(board, "Computer");
    this.humanBoardView = new BoardView(humanBoard, "Human");
    this.humanBoard = humanBoard;
  }

  takeTurn() {
    const board = this.board;
    const humanBoard = this.humanBoard;

    const readYN = () => {
      while (true) {
        let cInp = prompt("Please enter y or n: ");
        if (!cInp) continue;
        cInp = cInp.trim().toLowerCase();
        if (cInp === "y" || cInp === "n") return cInp;
      }
    };

    const readDie = (promptMsg) => {
      while (true) {
        let v = prompt(promptMsg);
        if (!v) continue;
        v = parseInt(v, 10);
        if (!Number.isNaN(v) && v >= 1 && v <= 6) return v;
        console.log("Please enter a number 1..6.");
      }
    };

    const chooseIndex = (maxIdx) => {
      while (true) {
        let idxStr = prompt(
          `Enter the number of the combination you want to use (1-${maxIdx}): `
        );
        if (!idxStr) continue;
        const idx = parseInt(idxStr, 10);
        if (!Number.isNaN(idx) && idx >= 1 && idx <= maxIdx) return idx;
        console.log("Invalid choice. Try again.");
      }
    };

    const printCombos = (combos) => {
      combos.forEach((comb, i) => {
        console.log(`  [${i + 1}] ${comb.join(" ")}`);
      });
    };

    while (true) {
      section("Computer Turn");

      console.log(
        "Do you want to enter the die manually for the computer? (y/n): "
      );
      const manual = readYN();

      let sum = 0;

      if (manual === "y") {
        const oneDieAllowed = board.canThrowOneDie();
        let diceCount = 2;

        if (oneDieAllowed) {
          console.log(
            `1-die is allowed (${Board.ONE_DIE_RULE_START}..${board.getSize()} are covered). Use 1 die? (y/n): `
          );
          diceCount = readYN() === "y" ? 1 : 2;
        } else {
          console.log("1-die is NOT allowed (must use 2 dice).");
          diceCount = 2;
        }

        const d1 = readDie("Enter die 1 (1-6): ");
        const d2 = diceCount === 2 ? readDie("Enter die 2 (1-6): ") : 0;
        sum = d1 + d2;

        console.log(
          "Computer (manual) rolled: " +
            d1 +
            (diceCount === 2 ? " + " + d2 + " = " + sum : " = " + sum)
        );

        let coverCombos = board.findValidCombinations(sum, true);
        let uncoverCombos = humanBoard.findValidCombinations(sum, false);

        if (
          Tournament.getAdvantageApplied() &&
          Tournament.isHumanAdvantageProtected()
        ) {
          const advSq = Tournament.getAdvantageSquare();
          uncoverCombos = uncoverCombos.filter(cmb => !cmb.includes(advSq));
        }

        if (coverCombos.length === 0 && uncoverCombos.length === 0) {
          console.log(
            "Computer has no legal moves for this roll. Its turn ends."
          );
          return true;
        }

        let cu;
        while (true) {
          cu = prompt(
            "Do you want the computer to (c)over its squares or (u)ncover yours? (c/u): "
          );
          if (!cu) continue;
          cu = cu.trim().toLowerCase();
          if (cu === "c" && coverCombos.length > 0) break;
          if (cu === "u" && uncoverCombos.length > 0) break;
          console.log("That action isn't available with this roll.");
        }

        if (cu === "c") {
          section("Valid combinations to cover");
          printCombos(coverCombos);
          const idx = chooseIndex(coverCombos.length);
          const comb = coverCombos[idx - 1];
          comb.forEach(v => board.coverSquare(v));
          console.log(
            c(GREEN) + "Computer covers: " + c(RESET) + comb.join(" ")
          );
        } else {
          section("Valid combinations to uncover");
          printCombos(uncoverCombos);
          const idx = chooseIndex(uncoverCombos.length);
          const comb = uncoverCombos[idx - 1];
          comb.forEach(v => humanBoard.uncoverSquare(v));
          console.log(
            c(GREEN) + "Computer uncovers: " + c(RESET) + comb.join(" ")
          );
        }
      } else {
        const oneDieAllowed = board.canThrowOneDie();

        const highestUncovered = (b) => {
          for (let v = b.getSize(); v >= 1; --v) {
            if (!b.isSquareCovered(v)) return v;
          }
          return 0;
        };

        const remainingCount = (b) => {
          let cCnt = 0;
          for (let v = 1; v <= b.getSize(); ++v) {
            if (!b.isSquareCovered(v)) ++cCnt;
          }
          return cCnt;
        };

        let diceCount = 2;
        if (
          oneDieAllowed &&
          (highestUncovered(board) <= 6 || remainingCount(board) <= 3)
        ) {
          diceCount = 1;
        }

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = diceCount === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
        sum = d1 + d2;

        let diceWhy = "";
        if (!oneDieAllowed) {
          diceWhy = `must use 2 dice (1-die not allowed until 7..${board.getSize()} are covered)`;
        } else if (diceCount === 1) {
          const hi = highestUncovered(board);
          const rem = remainingCount(board);
          if (hi <= 6)
            diceWhy =
              "1 die because highest remaining square <= 6 (aiming small)";
          else if (rem <= 3)
            diceWhy = `1 die because only ${rem} squares remain (lower bust risk)`;
          else diceWhy = "1 die (heuristic)";
        } else {
          diceWhy = "2 dice to reach sums > 6 (need higher targets)";
        }

        console.log(
          "Chooses to roll " +
            (diceCount === 1 ? "1 die " : "2 dice ") +
            c(DIM) +
            "(" +
            diceWhy +
            ")" +
            c(RESET)
        );
        if (diceCount === 2) {
          console.log(`Rolled: ${d1} + ${d2} = ${sum}`);
        } else {
          console.log(
            `Rolled: ${d1} = ${sum} ` +
              c(DIM) +
              "(1-die allowed)" +
              c(RESET)
          );
        }

        const canCover = board.findValidCombinations(sum, true).length > 0;
        const canUncover =
          humanBoard.findValidCombinations(sum, false).length > 0;

        if (!canCover && !canUncover) {
          console.log(
            "Computer has no legal moves for this roll. Its turn ends."
          );
          return true;
        }

        console.log(
          c(GREEN) +
            "Decision: " +
            c(RESET) +
            (this.shouldCover(sum)
              ? "Cover own squares"
              : "Uncover opponent squares")
        );

        if (this.shouldCover(sum)) this.coverSquares(sum);
        else this.uncoverSquares(sum);
      }

      // display boards
      this.boardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Computer,
        Tournament.getAdvantageSquare()
      );

      this.humanBoardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Human,
        Tournament.getAdvantageSquare()
      );

      console.log("");

      if (board.allCovered()) return true;
    }
  }

  shouldCover(sum) {
    const coverCombos = this.board.findValidCombinations(sum, true);
    return coverCombos.length > 0;
  }

  coverSquares(sum) {
    const combos = this.board.findValidCombinations(sum, true);

    if (combos.length === 0) {
      console.log("Computer has no valid moves to cover squares. Turn ends.");
      return;
    }

    let selected = [];
    let maxSquares = 0;

    for (const comb of combos) {
      if (comb.length > maxSquares) {
        selected = comb;
        maxSquares = comb.length;
      }
    }

    console.log(
      "Computer chooses to cover the following squares: " +
        selected.join(" ") +
        " because covering more squares gives it a better chance of winning."
    );

    selected.forEach(sq => this.board.coverSquare(sq));
  }

  uncoverSquares(sum) {
    let combos = this.humanBoard.findValidCombinations(sum, false);

    if (combos.length === 0) {
      console.log("Computer has no valid moves to uncover squares. Turn ends.");
      return;
    }

    if (
      Tournament.getAdvantageApplied() &&
      Tournament.isHumanAdvantageProtected()
    ) {
      const advSq = Tournament.getAdvantageSquare();
      combos = combos.filter(cmb => !cmb.includes(advSq));
    }

    if (combos.length === 0) {
      console.log(
        c(YELLOW) +
          "No valid uncover options; advantage-protected square blocks them." +
          c(RESET)
      );
      return;
    }

    let selected = [];
    let maxSquares = 0;

    for (const comb of combos) {
      if (comb.length > maxSquares) {
        selected = comb;
        maxSquares = comb.length;
      }
    }

    console.log(
      "Computer chooses to uncover the following squares: " +
        selected.join(" ") +
        " because uncovering more squares reduces your chances of winning."
    );

    selected.forEach(sq => this.humanBoard.uncoverSquare(sq));
  }

  provideHelp(diceSum, humanBoard, computerBoard) {
    import("../ui/View.js").then(({ banner, section, c, GREEN, YELLOW, DIM }) => {
      banner("Help");
      console.log("Dice sum: " + diceSum);

      const printCombos = (combos) => {
        combos.forEach((comb, idx) => {
          console.log("  [" + (idx + 1) + "] " + comb.join(" "));
        });
      };

      const best = (combos) => {
        let bestC = [];
        let bestCount = -1;
        let bestSum = -1;
        for (const cmb of combos) {
          const cnt = cmb.length;
          const s = cmb.reduce((a, b) => a + b, 0);
          if (cnt > bestCount || (cnt === bestCount && s > bestSum)) {
            bestC = cmb;
            bestCount = cnt;
            bestSum = s;
          }
        }
        return bestC;
      };

      const coverCombos = humanBoard.findValidCombinations(diceSum, true);
      const uncoverCombos = computerBoard.findValidCombinations(diceSum, false);

      section("Cover options (your board)");
      if (coverCombos.length === 0) console.log("  none");
      else printCombos(coverCombos);

      section("Uncover options (opponent board)");
      if (uncoverCombos.length === 0) console.log("  none");
      else printCombos(uncoverCombos);

      if (coverCombos.length > 0) {
        const rec = best(coverCombos);
        console.log("\n" + c(GREEN) + "Recommended: COVER  " + c(RESET) + rec.join(" "));
        console.log(
          c(DIM) +
            "Reason: maximize number of squares; tie-break by higher values.\n" +
            c(RESET)
        );
      } else if (uncoverCombos.length > 0) {
        const rec = best(uncoverCombos);
        console.log("\n" + c(GREEN) + "Recommended: UNCOVER  " + c(RESET) + rec.join(" "));
        console.log(
          c(DIM) +
            "Reason: remove as many as possible; tie-break by higher values.\n" +
            c(RESET)
        );
      } else {
        console.log("\nNo legal moves. You must pass.");
      }

      if (Tournament.getAdvantageApplied()) {
        console.log(
          "\n" +
            c(YELLOW) +
            "Note:" +
            c(RESET) +
            " advantage square " +
            Tournament.getAdvantageSquare() +
            " is protected for one turn."
        );
      }

      hr();
    });
  }
}



