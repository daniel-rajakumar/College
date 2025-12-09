

// js/main.js
// Entry point for the text-based browser version.
// Include this file with: <script type="module" src="js/main.js"></script>

import { Board } from "./model/Board.js";
import { Tournament } from "./model/Tournament.js";
import { HumanPlayer } from "./model/HumanPlayer.js";
import { ComputerPlayer } from "./model/ComputerPlayer.js";
import { GameRound } from "./model/GameRound.js";
import { banner } from "./ui/View.js";

function promptBoardSize() {
  while (true) {
    const input = prompt("Enter the size of the board (9, 10, or 11): ");
    if (!input) continue;
    const n = parseInt(input, 10);
    if (!Number.isNaN(n) && (n === 9 || n === 10 || n === 11)) {
      return n;
    }
    console.log("Invalid size. Please enter 9, 10, or 11.");
  }
}

/**
 * Play a full multi-round tournament.
 */
export function mainCanoga() {
  banner("Canoga (JS Console Version)");

  const tournament = new Tournament();
  let playAgain = "y";
  let isFirstRound = true;

  while (playAgain === "y") {
    // ---- setup boards for this round ----
    const size = promptBoardSize();
    const humanBoard = new Board(size);
    const computerBoard = new Board(size);

    // Apply any queued advantage from previous round
    tournament.applyAdvantageToNewRound(humanBoard, computerBoard);

    // players for this round
    const human = new HumanPlayer(humanBoard, computerBoard);
    const computer = new ComputerPlayer(computerBoard, humanBoard);

    // ---- play one round ----
    const round = new GameRound(human, computer, tournament, isFirstRound);
    round.play();
    isFirstRound = false; // subsequent rounds are "new" but don't matter for existing metadata

    // ---- show scores & ask to continue ----
    tournament.logScoreBoard();

    let ans;
    do {
      ans = prompt("Do you want to play another round? (y/n): ");
      if (!ans) continue;
      ans = ans.trim().toLowerCase();
    } while (ans !== "y" && ans !== "n");
    playAgain = ans;
  }

  tournament.declareTournamentWinner();
  console.log("Thanks for playing Canoga!");
}

// Make it easy to start from the console.
window.mainCanoga = mainCanoga;

// Optionally auto-start when the page loads:
// mainCanoga();
