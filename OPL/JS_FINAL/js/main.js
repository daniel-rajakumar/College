// js/main.js
import { View } from "./ui/View.js";
import { Tournament } from "./model/Tournament.js";
import { Dice } from "./model/Dice.js";

const view = new View();
let tournament = null;
let dice = null;
let currentRound = null;

// mode: "HvsC" | "HvsH" | "CvsC"
let gameMode = "HvsC";

// For current turn
let currentDice = { d1: null, d2: null, sum: null };
let currentPlayerId = "HUMAN";
let currentMoveType = null; // "cover" | "uncover"
let selectedSquares = [];
let selectionOwner = null; // playerId whose squares are being selected
let phase = "awaitingRoll"; // "awaitingRoll" | "awaitingMove" | "roundOver"

window.addEventListener("DOMContentLoaded", () => {
  wireWelcome();
  wireSetup();
  wireGame();
  wireEnd();
});

/* ---------- HELPERS ---------- */

function resetTournament() {
  tournament = new Tournament("Human", "Computer");
  dice = new Dice();
  currentRound = null;
}

function isPlayerHumanControlled(playerId) {
  if (gameMode === "HvsC") {
    return playerId === "HUMAN";
  }
  if (gameMode === "HvsH") {
    return true;
  }
  if (gameMode === "CvsC") {
    return false;
  }
  return true;
}

function getModeLabel() {
  if (gameMode === "HvsC") return "Human vs Computer";
  if (gameMode === "HvsH") return "Human vs Human";
  if (gameMode === "CvsC") return "Computer vs Computer";
  return gameMode;
}

function setPhase(newPhase) {
  phase = newPhase;
}

/* ---------- WELCOME SCREEN ---------- */

function wireWelcome() {
  const btnStartSetup = document.getElementById("btn-start-setup");
  btnStartSetup.addEventListener("click", () => {
    resetTournament();
    view.showScreen("setup");
  });
}

/* ---------- SETUP SCREEN ---------- */

function wireSetup() {
  const selectBoardSize = document.getElementById("select-board-size");
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const btnRolloff = document.getElementById("btn-rolloff");
  const btnSetupBack = document.getElementById("btn-setup-back");
  const btnStartRound = document.getElementById("btn-start-round");

  // Update mode when user changes radio
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      gameMode = document.querySelector('input[name="mode"]:checked').value;
    });
  });

  btnRolloff.addEventListener("click", () => {
    if (!tournament) {
      resetTournament();
    }
    const boardSize = Number(selectBoardSize.value) || 9;

    // Do roll-off: each side rolls two dice, higher sum goes first.
    const humanRoll = dice.rollRandom(2);
    const compRoll = dice.rollRandom(2);

    const hr = humanRoll.sum;
    const cr = compRoll.sum;

    let text = `Human rolled ${humanRoll.d1} + ${humanRoll.d2} = ${hr}. `;
    text += `Computer rolled ${compRoll.d1} + ${compRoll.d2} = ${cr}. `;

    if (hr > cr) {
      text += "Human goes first.";
      btnStartRound.dataset.firstPlayerId = "HUMAN";
      view.setRolloffText(text, true);
    } else if (cr > hr) {
      text += "Computer goes first.";
      btnStartRound.dataset.firstPlayerId = "COMPUTER";
      view.setRolloffText(text, true);
    } else {
      text += "It's a tie. Roll again.";
      btnStartRound.dataset.firstPlayerId = "";
      view.setRolloffText(text, false);
    }
  });

  btnSetupBack.addEventListener("click", () => {
    view.showScreen("welcome");
  });

  btnStartRound.addEventListener("click", () => {
    const firstPlayerId = btnStartRound.dataset.firstPlayerId;
    if (!firstPlayerId) return;

    const boardSize = Number(selectBoardSize.value) || 9;
    startNewRound(boardSize, firstPlayerId);
  });
}

/* ---------- START ROUND ---------- */

function startNewRound(boardSize, firstPlayerId) {
  if (!tournament) {
    resetTournament();
  }
  currentRound = tournament.startNewRound(boardSize, firstPlayerId);
  currentPlayerId = currentRound.currentPlayerId;
  currentDice = { d1: null, d2: null, sum: null };
  currentMoveType = null;
  selectedSquares = [];
  selectionOwner = null;
  setPhase("awaitingRoll");

  view.showScreen("game");
  view.clearLog();

  const advantageText = tournament.nextRoundAdvantage
    ? `Advantage: ${
        tournament.nextRoundAdvantage.playerId === "HUMAN" ? "Human" : "Computer"
      } has square ${tournament.nextRoundAdvantage.digitSum} pre-covered.`
    : "";

  view.setRoundHeader({
    roundNumber: tournament.roundNumber,
    modeLabel: getModeLabel(),
    firstPlayerLabel: firstPlayerId === "HUMAN" ? "Human" : "Computer",
    advantageText,
  });

  view.setScores(tournament.human.totalScore, tournament.computer.totalScore);
  view.setCurrentPlayerLabel(
    currentPlayerId === "HUMAN" ? "Human" : "Computer"
  );
  view.setDiceText({ d1: null, d2: null, sum: null });
  view.setSelectedSquares([]);
  view.setTurnStatus("Awaiting roll…");

  view.renderBoards(currentRound, {
    selectedSquares,
    selectionOwner,
    enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
      ? currentPlayerId
      : null,
  });

  view.appendLog(
    `Round ${tournament.roundNumber} started. First player: ${
      currentPlayerId === "HUMAN" ? "Human" : "Computer"
    }`
  );

  // If current player is computer-controlled, auto-play their turn
  maybePlayComputerTurn();
}

/* ---------- GAME SCREEN ---------- */

function wireGame() {
  const btnRoll1 = document.getElementById("btn-roll-1");
  const btnRoll2 = document.getElementById("btn-roll-2");
  const btnMoveCover = document.getElementById("btn-move-cover");
  const btnMoveUncover = document.getElementById("btn-move-uncover");
  const btnClearSelection = document.getElementById("btn-clear-selection");
  const btnConfirmMove = document.getElementById("btn-confirm-move");
  const btnHelp = document.getElementById("btn-help");
  const btnQuitRound = document.getElementById("btn-quit-round");

  // Board click – selection
  const boardsContainer = document.getElementById("boards");
  boardsContainer.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.classList.contains("square")) return;
    if (phase !== "awaitingMove") return;
    if (!currentMoveType || !selectionOwner) return;

    // Only allow selecting from the relevant board
    const playerId = target.dataset.player;
    const num = Number(target.dataset.number);

    if (playerId !== selectionOwner) {
      // selecting from wrong board; ignore
      return;
    }

    // Toggle selection
    const idx = selectedSquares.indexOf(num);
    if (idx === -1) {
      selectedSquares.push(num);
    } else {
      selectedSquares.splice(idx, 1);
    }
    view.setSelectedSquares(selectedSquares);
    view.renderBoards(currentRound, {
      selectedSquares,
      selectionOwner,
      enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
        ? currentPlayerId
        : null,
    });
  });

  btnRoll1.addEventListener("click", () => handleRollClick(1));
  btnRoll2.addEventListener("click", () => handleRollClick(2));

  btnMoveCover.addEventListener("click", () => handleMoveTypeClick("cover"));
  btnMoveUncover.addEventListener("click", () => handleMoveTypeClick("uncover"));

  btnClearSelection.addEventListener("click", () => {
    if (phase !== "awaitingMove") return;
    selectedSquares = [];
    view.setSelectedSquares(selectedSquares);
    view.renderBoards(currentRound, {
      selectedSquares,
      selectionOwner,
      enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
        ? currentPlayerId
        : null,
    });
  });

  btnConfirmMove.addEventListener("click", () => {
    if (phase !== "awaitingMove") return;
    confirmMove();
  });

  btnHelp.addEventListener("click", () => {
    if (phase !== "awaitingMove" || !currentDice.sum) return;
    const ai = tournament.computer;
    const suggestion = ai.getHelpSuggestion(currentRound, currentPlayerId, currentDice.sum);
    view.appendLog(
      `HELP: Recommended action = ${suggestion.action}, squares = [${suggestion.squares.join(
        ", "
      )}]. Reason: ${suggestion.reason}`
    );
  });

  btnQuitRound.addEventListener("click", () => {
    // Just show end screen with tournament result so far
    const result = tournament.getTournamentResult();
    tournament.nextRoundAdvantage = null;
    view.setEndScreen({
      roundWinnerId: result.winnerId,
      winType: "tournament",
      roundScore: 0,
      humanScore: result.humanScore,
      computerScore: result.computerScore,
      advantageForNext: null,
    });
    view.showScreen("end");
  });
}

function handleRollClick(numDice) {
  if (!currentRound) return;
  if (phase !== "awaitingRoll") return;
  if (!isPlayerHumanControlled(currentPlayerId)) return;

  // Check 7..n rule
  const player = currentRound.getPlayerById(currentPlayerId);
  const board = player.board;
  const n = board.size;
  let allHighCovered = true;
  for (let i = 7; i <= n; i++) {
    if (i >= 1 && i <= n && !board.isCovered(i)) {
      allHighCovered = false;
      break;
    }
  }

  if (numDice === 1 && !allHighCovered) {
    view.appendLog("You may roll ONE die only if squares 7..n are ALL covered.");
    return;
  }

  if (numDice !== 1 && numDice !== 2) return;

  // Actually roll
  const roll = dice.rollRandom(numDice);
  currentDice = roll;
  view.setDiceText(roll);

  view.appendLog(
    `${currentPlayerId === "HUMAN" ? "Human" : "Computer"} rolled ${
      roll.d2 == null ? roll.d1 : `${roll.d1} + ${roll.d2}`
    } (sum = ${roll.sum})`
  );

  // Check if there are any options at all
  const coverOptions = currentRound.getCoverOptions(currentPlayerId, roll.sum);
  const uncoverOptions = currentRound.getUncoverOptions(currentPlayerId, roll.sum);

  if (coverOptions.length === 0 && uncoverOptions.length === 0) {
    view.appendLog("No moves available for this roll. Turn ends.");
    endTurn();
    return;
  }

  // Move phase now
  currentMoveType = null;
  selectedSquares = [];
  selectionOwner = null;
  setPhase("awaitingMove");
  view.setSelectedSquares(selectedSquares);
  view.setTurnStatus("Choose Cover or Uncover, then select squares.");
}

function handleMoveTypeClick(type) {
  if (phase !== "awaitingMove") return;
  if (!currentDice.sum) return;
  if (!["cover", "uncover"].includes(type)) return;

  currentMoveType = type;
  selectedSquares = [];
  selectionOwner = type === "cover" ? currentPlayerId : currentRound.getOpponentId(currentPlayerId);

  view.setSelectedSquares(selectedSquares);
  view.renderBoards(currentRound, {
    selectedSquares,
    selectionOwner,
    enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
      ? currentPlayerId
      : null,
  });

  view.setTurnStatus(
    `Selected move: ${type.toUpperCase()}. Click squares on the ${
      selectionOwner === "HUMAN" ? "Human" : "Computer"
    } board that add up to ${currentDice.sum}.`
  );
}

function confirmMove() {
  if (!currentMoveType || !currentDice.sum) return;
  if (selectedSquares.length === 0) {
    view.appendLog("No squares selected.");
    return;
  }

  const sum = selectedSquares.reduce((a, b) => a + b, 0);
  if (sum !== currentDice.sum) {
    view.appendLog(
      `Invalid move: sum of selected squares = ${sum}, but dice sum = ${currentDice.sum}.`
    );
    return;
  }

  // Validate using getCoverOptions / getUncoverOptions
  const options =
    currentMoveType === "cover"
      ? currentRound.getCoverOptions(currentPlayerId, currentDice.sum)
      : currentRound.getUncoverOptions(currentPlayerId, currentDice.sum);

  const sortedSelected = [...selectedSquares].sort((a, b) => a - b);
  const exists = options.some((combo) => {
    const s = [...combo].sort((a, b) => a - b);
    if (s.length !== sortedSelected.length) return false;
    return s.every((v, i) => v === sortedSelected[i]);
  });

  if (!exists) {
    view.appendLog(
      "Invalid combination: this set of squares is not allowed based on the rules and current board."
    );
    return;
  }

  // Apply move
  if (currentMoveType === "cover") {
    currentRound.applyCoverMove(currentPlayerId, selectedSquares);
    view.appendLog(
      `${currentPlayerId === "HUMAN" ? "Human" : "Computer"} covers squares [${selectedSquares.join(
        ", "
      )}]`
    );
  } else {
    currentRound.applyUncoverMove(currentPlayerId, selectedSquares);
    view.appendLog(
      `${currentPlayerId === "HUMAN" ? "Human" : "Computer"} uncovers opponent squares [${selectedSquares.join(
        ", "
      )}]`
    );
  }

  // Update boards
  view.renderBoards(currentRound, {
    selectedSquares: [],
    selectionOwner: null,
    enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
      ? currentPlayerId
      : null,
  });
  view.setSelectedSquares([]);
  selectedSquares = [];
  currentMoveType = null;
  selectionOwner = null;

  // Check for round end
  if (currentRound.roundOver) {
    handleRoundFinished();
    return;
  }

  // Move completed; user must roll again
  setPhase("awaitingRoll");
  currentDice = { d1: null, d2: null, sum: null };
  view.setDiceText(currentDice);
  view.setTurnStatus("Move completed. Roll again.");
}

function endTurn() {
  currentRound.notifyTurnEnded(currentPlayerId);

  if (currentRound.roundOver) {
    handleRoundFinished();
    return;
  }

  // Switch to next player
  currentRound.switchTurn();
  currentPlayerId = currentRound.currentPlayerId;

  currentDice = { d1: null, d2: null, sum: null };
  currentMoveType = null;
  selectedSquares = [];
  selectionOwner = null;
  setPhase("awaitingRoll");

  view.setDiceText(currentDice);
  view.setSelectedSquares(selectedSquares);
  view.setCurrentPlayerLabel(
    currentPlayerId === "HUMAN" ? "Human" : "Computer"
  );
  view.setTurnStatus("New turn. Awaiting roll…");

  view.renderBoards(currentRound, {
    selectedSquares,
    selectionOwner,
    enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
      ? currentPlayerId
      : null,
  });

  maybePlayComputerTurn();
}

function maybePlayComputerTurn() {
  if (!currentRound) return;
  if (!isPlayerHumanControlled(currentPlayerId)) {
    // Auto-play full turn for this player using AI
    playComputerFullTurn();
  }
}

function playComputerFullTurn() {
  const ai = tournament.computer;
  const activeName = currentPlayerId === "HUMAN" ? "Human" : "Computer";

  while (true) {
    if (currentRound.roundOver) break;

    // Determine number of dice using AI’s rule
    const player = currentRound.getPlayerById(currentPlayerId);
    const numDice = ai.chooseNumDice(player.board);
    const roll = dice.rollRandom(numDice);
    currentDice = roll;
    view.setDiceText(roll);

    view.appendLog(
      `${activeName} (AUTO) rolled ${
        roll.d2 == null ? roll.d1 : `${roll.d1} + ${roll.d2}`
      } (sum = ${roll.sum})`
    );

    const decision = ai.decideMove(currentRound, currentPlayerId, roll.sum);

    view.appendLog(
      `${activeName} decision: action=${decision.action}, squares=[${decision.squares.join(
        ", "
      )}]. Reason: ${decision.reason}`
    );

    if (decision.action === "none") {
      view.appendLog("No moves available. Turn ends.");
      break;
    }

    if (decision.action === "cover") {
      currentRound.applyCoverMove(currentPlayerId, decision.squares);
      view.appendLog(
        `${activeName} covers squares [${decision.squares.join(", ")}]`
      );
    } else if (decision.action === "uncover") {
      currentRound.applyUncoverMove(currentPlayerId, decision.squares);
      view.appendLog(
        `${activeName} uncovers opponent squares [${decision.squares.join(", ")}]`
      );
    }

    view.renderBoards(currentRound, {
      selectedSquares: [],
      selectionOwner: null,
      enabledPlayerId: null,
    });

    if (currentRound.roundOver) {
      break;
    }

    // AI must continue rolling until no moves available
  }

  currentRound.notifyTurnEnded(currentPlayerId);
  if (currentRound.roundOver) {
    handleRoundFinished();
  } else {
    // Switch to next player
    currentRound.switchTurn();
    currentPlayerId = currentRound.currentPlayerId;
    currentDice = { d1: null, d2: null, sum: null };
    currentMoveType = null;
    selectedSquares = [];
    selectionOwner = null;
    setPhase("awaitingRoll");

    view.setDiceText(currentDice);
    view.setCurrentPlayerLabel(
      currentPlayerId === "HUMAN" ? "Human" : "Computer"
    );
    view.setTurnStatus("New turn. Awaiting roll…");

    view.renderBoards(currentRound, {
      selectedSquares,
      selectionOwner,
      enabledPlayerId: isPlayerHumanControlled(currentPlayerId)
        ? currentPlayerId
        : null,
    });

    // If next player is also computer-controlled (CvsC mode), recurse
    if (!isPlayerHumanControlled(currentPlayerId)) {
      playComputerFullTurn();
    }
  }
}

/* ---------- ROUND END / END SCREEN ---------- */

function handleRoundFinished() {
  setPhase("roundOver");
  view.appendLog("=== ROUND OVER ===");
  view.appendLog(
    `Winner: ${currentRound.roundWinnerId}, type=${currentRound.winType}, roundScore=${currentRound.roundScore}`
  );

  // Update tournament's advantage for next round
  tournament.updateAdvantageForNextRound();

  // Update cumulative scores already handled in GameRound; just show them.
  view.setScores(tournament.human.totalScore, tournament.computer.totalScore);

  view.setEndScreen({
    roundWinnerId: currentRound.roundWinnerId,
    winType: currentRound.winType,
    roundScore: currentRound.roundScore,
    humanScore: tournament.human.totalScore,
    computerScore: tournament.computer.totalScore,
    advantageForNext: tournament.nextRoundAdvantage,
  });

  view.showScreen("end");
}

/* ---------- END SCREEN BUTTONS ---------- */

function wireEnd() {
  const btnPlayAgain = document.getElementById("btn-end-play-again");
  const btnEndQuit = document.getElementById("btn-end-quit");

  btnPlayAgain.addEventListener("click", () => {
    // Go back to setup to pick board size / roll-off again,
    // carrying forward tournament scores and advantage.
    view.showScreen("setup");
    // Reset rolloff text so user rolls again
    const defaultText = "Click 'Roll Dice' to determine the first player.";
    view.setRolloffText(defaultText, false);
  });

  btnEndQuit.addEventListener("click", () => {
    // Show final tournament result and go to welcome
    const result = tournament.getTournamentResult();
    alert(
      `Tournament over!\n` +
        `Winner: ${
          result.winnerId === "DRAW"
            ? "Draw"
            : result.winnerId === "HUMAN"
            ? "Human"
            : "Computer"
        }\n` +
        `Human total: ${result.humanScore}\n` +
        `Computer total: ${result.computerScore}`
    );
    view.showScreen("welcome");
  });
}
