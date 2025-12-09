

// js/model/HumanPlayer.js

import { Player } from "./Player.js";
import { BoardView, banner, section, c, YELLOW, GREEN } from "../ui/View.js";
import { ComputerPlayer } from "./ComputerPlayer.js";
import { Tournament } from "./Tournament.js";

export class HumanPlayer extends Player {
  constructor(board, computerBoard) {
    super(board, true);
    this.boardView = new BoardView(board, "Human");
    this.computerBoardView = new BoardView(computerBoard, "Computer");
    this.computerBoard = computerBoard;
  }

  takeTurn() {
    const board = this.board;
    const computerBoard = this.computerBoard;

    const readYN = () => {
      while (true) {
        let cInp = prompt("Please enter y or n: ");
        if (!cInp) continue;
        cInp = cInp.trim().toLowerCase();
        if (cInp === "y" || cInp === "n") return cInp;
      }
    };

    const readDie = (msg) => {
      while (true) {
        let v = prompt(msg);
        if (!v) continue;
        v = parseInt(v, 10);
        if (!Number.isNaN(v) && v >= 1 && v <= 6) return v;
        console.log("Please enter a number 1..6.");
      }
    };

    // ======= FULL HUMAN TURN =======
    while (true) {
      section("Human Turn");

      console.log("Do you want to enter the die manually? (y/n): ");
      const manual = readYN();

      const oneDieAllowed = board.canThrowOneDie();
      let diceCount = 2;

      if (oneDieAllowed) {
        console.log(
          `You may use 1 die (7..${board.getSize()} are covered). Use 1 die? (y/n): `
        );
        diceCount = readYN() === "y" ? 1 : 2;
      } else {
        console.log("1-die is NOT allowed (must use 2 dice).");
        diceCount = 2;
      }

      let d1 = 0,
        d2 = 0,
        sum = 0;
      if (manual === "y") {
        d1 = readDie("Enter die 1 (1-6): ");
        d2 = diceCount === 2 ? readDie("Enter die 2 (1-6): ") : 0;
      } else {
        d1 = Math.floor(Math.random() * 6) + 1;
        d2 = diceCount === 2 ? Math.floor(Math.random() * 6) + 1 : 0;
      }
      sum = d1 + d2;

      console.log(
        "You rolled: " +
          d1 +
          (diceCount === 2
            ? " + " + d2 + " = " + sum
            : " = " + sum + " " + c(YELLOW) + "(1-die)" + c(RESET))
      );

      const canCover = board.findValidCombinations(sum, true).length > 0;
      const canUncover =
        computerBoard.findValidCombinations(sum, false).length > 0;

      if (!canCover && !canUncover) {
        console.log("No legal moves for this roll. Your turn ends.");
        return true;
      }

      // show boards
      banner("Current Board State");
      this.computerBoardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Computer,
        Tournament.getAdvantageSquare()
      );
      this.boardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Human,
        Tournament.getAdvantageSquare()
      );

      // help?
      console.log("Do you want help from the computer? (y/n): ");
      if (readYN() === "y") {
        const helper = new ComputerPlayer(computerBoard, board);
        helper.provideHelp(sum, board, computerBoard);
        console.log("");
      }

      // choose cover/uncover
      let choice;
      while (true) {
        choice = prompt(
          "Cover your squares or uncover the opponent's squares? (c/u): "
        );
        if (!choice) continue;
        choice = choice.trim().toLowerCase();
        if ((choice === "c" && canCover) || (choice === "u" && canUncover))
          break;
        console.log("That action isn't available with this roll.");
      }

      if (choice === "c") this.coverSquares(sum);
      else this.uncoverSquares(sum);

      banner("Board After Your Move");
      this.computerBoardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Computer,
        Tournament.getAdvantageSquare()
      );
      this.boardView.display(
        Tournament.getAdvantageApplied() &&
          Tournament.getAdvantageOwner() === Tournament.Side.Human,
        Tournament.getAdvantageSquare()
      );
      console.log("");

      if (board.allCovered()) return true;
    }
  }

  coverSquares(sum) {
    section("Valid cover options");

    const combos = this.board.findValidCombinations(sum, true);

    if (combos.length === 0) {
      console.log("  none");
      console.log("No valid moves to cover squares. Turn ends.");
      return;
    }

    const printCombos = (cs) => {
      cs.forEach((comb, idx) => {
        console.log(`  [${idx + 1}] ` + comb.join(" "));
      });
    };

    printCombos(combos);

    let choice = 0;
    const maxIdx = combos.length;
    while (true) {
      const inp = prompt(
        `Enter the number of the combination you want to use (1-${maxIdx}): `
      );
      if (!inp) continue;
      choice = parseInt(inp, 10);
      if (!Number.isNaN(choice) && choice >= 1 && choice <= maxIdx) break;
      console.log("Invalid choice. Try again.");
    }

    const selected = combos[choice - 1];
    for (const v of selected) this.board.coverSquare(v);

    let line = c(GREEN) + "Covered: " + c(RESET);
    for (const v of selected) line += v + " ";
    console.log(line);
  }

  uncoverSquares(sum) {
    let combos = this.computerBoard.findValidCombinations(sum, false);

    if (combos.length === 0) {
      console.log("No valid moves to uncover squares. Turn ends.");
      return;
    }

    if (
      Tournament.getAdvantageApplied() &&
      Tournament.isComputerAdvantageProtected()
    ) {
      const advSq = Tournament.getAdvantageSquare();
      combos = combos.filter(cmb => !cmb.includes(advSq));
    }

    if (combos.length === 0) {
      console.log(
        c(YELLOW) +
          "No valid uncover options this roll. Advantage square " +
          Tournament.getAdvantageSquare() +
          " is protected for one turn." +
          c(RESET)
      );
      return;
    }

    console.log("Valid combinations to uncover:");
    combos.forEach((comb, idx) => {
      console.log(`${idx + 1}: ${comb.join(" ")}`);
    });

    const maxIdx = combos.length;
    let choice = 0;
    while (true) {
      const inp = prompt(
        `Enter the number of the combination you want to use (1-${maxIdx}): `
      );
      if (!inp) continue;
      choice = parseInt(inp, 10);
      if (!Number.isNaN(choice) && choice >= 1 && choice <= maxIdx) break;

      console.log("Invalid choice. Try again.");
    }

    const selected = combos[choice - 1];
    for (const sq of selected) this.computerBoard.uncoverSquare(sq);

    let line = "Uncovered squares: ";
    for (const sq of selected) line += sq + " ";
    console.log(line);
  }
}




