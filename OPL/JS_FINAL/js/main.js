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
let phase = "awaitingRoll"; // "awaitingRoll" | "awaitingMove" | "roundOver"

// For human move modal
let pendingOptions = null; // { sum, coverOptions, uncoverOptions }

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

/**
 * Show / hide roll buttons based on:
 *  - phase
 *  - whose turn
 *  - 7..n rule
 */
function updateRollButtonsVisibility() {
  if (!currentRound || phase !== "awaitingRoll" || !isPlayerHumanControlled(currentPlayerId)) {
    // Hide "Roll 1" and disable both when it's not human's turn or not time to roll
    view.setRollButtonsVisibility({
      canRoll1: false,
      enableRollButtons: false,
    });
    return;
  }

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

  view.setRollButtonsVisibility({
    canRoll1: allHighCovered,
    enableRollButtons: true,
  });
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
  pendingOptions = null;
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
  view.setTurnStatus("Awaiting roll…");

  view.renderBoards(currentRound);

  view.appendLog(
    `Round ${tournament.roundNumber} started. First player: ${
      currentPlayerId === "HUMAN" ? "Human" : "Computer"
    }`
  );

  updateRollButtonsVisibility();

  // If current player is computer-controlled, auto-play their turn
  maybePlayComputerTurn();
}

/* ---------- GAME SCREEN + MODAL ---------- */

function wireGame() {
  const btnRoll1 = document.getElementById("btn-roll-1");
  const btnRoll2 = document.getElementById("btn-roll-2");
  const btnQuitRound = document.getElementById("btn-quit-round");

  // Modal elements
  const modalBtnHelp = document.getElementById("modal-btn-help");
  const modalBtnCancel = document.getElementById("modal-btn-cancel");
  const modalBtnConfirm = document.getElementById("modal-btn-confirm");
  const modalMoveCover = document.getElementById("modal-move-cover");
  const modalMoveUncover = document.getElementById("modal-move-uncover");

  btnRoll1.addEventListener("click", () => handleRollClick(1));
  btnRoll2.addEventListener("click", () => handleRollClick(2));

  // Modal: switch between Cover / Uncover
  modalMoveCover.addEventListener("change", () => {
    if (!pendingOptions || !modalMoveCover.checked) return;
    view.updateMoveModalOptions("cover", pendingOptions.coverOptions || []);
  });
  modalMoveUncover.addEventListener("change", () => {
    if (!pendingOptions || !modalMoveUncover.checked) return;
    view.updateMoveModalOptions("uncover", pendingOptions.uncoverOptions || []);
  });

  // Modal: Help button
  modalBtnHelp.addEventListener("click", () => {
    if (!currentRound || !pendingOptions || !currentDice.sum) return;
    const ai = tournament.computer;
    const suggestion = ai.getHelpSuggestion(
      currentRound,
      currentPlayerId,
      currentDice.sum
    );
    view.setMoveHelpText(
      `Recommended: ${suggestion.action.toUpperCase()} [${suggestion.squares.join(
        ", "
      )}] – ${suggestion.reason}`
    );
  });

  // Modal: Confirm move
  modalBtnConfirm.addEventListener("click", () => {
    if (!currentRound || !pendingOptions || phase !== "awaitingMove") return;

    const selection = view.getMoveModalSelection(
      pendingOptions.coverOptions,
      pendingOptions.uncoverOptions
    );
    if (!selection) {
      view.setMoveHelpText("Please choose a combination.");
      return;
    }

    applyHumanMove(selection.moveType, selection.squares);
    view.closeMoveModal();
  });

  // Modal: Cancel (treat as "skip turn" – not ideal by rules, but avoids lock)
  modalBtnCancel.addEventListener("click", () => {
    if (!currentRound || !pendingOptions) {
      view.closeMoveModal();
      return;
    }
    view.appendLog("You skipped your move. Turn ends.");
    view.closeMoveModal();
    pendingOptions = null;
    endTurn();
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

  // Check 7..n rule (safety; UI already hides 1-die when illegal)
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

  const coverOptions = currentRound.getCoverOptions(currentPlayerId, roll.sum);
  const uncoverOptions = currentRound.getUncoverOptions(currentPlayerId, roll.sum);

  if (coverOptions.length === 0 && uncoverOptions.length === 0) {
    view.appendLog("No moves available for this roll. Turn ends.");
    endTurn();
    return;
  }

  // Enter move-selection phase via modal
  pendingOptions = {
    sum: roll.sum,
    coverOptions,
    uncoverOptions,
  };
  setPhase("awaitingMove");
  view.setTurnStatus("Choose your move.");
  view.setRollButtonsVisibility({ canRoll1: false, enableRollButtons: false });
  view.openMoveModal(roll.sum, coverOptions, uncoverOptions);
}

/**
 * Apply a human move selected from the modal.
 * @param {"cover"|"uncover"} moveType
 * @param {number[]} squares
 */
function applyHumanMove(moveType, squares) {
  if (!currentRound) return;
  if (!currentDice.sum) return;

  // For safety, ensure combo is legal according to model
  const options =
    moveType === "cover"
      ? currentRound.getCoverOptions(currentPlayerId, currentDice.sum)
      : currentRound.getUncoverOptions(currentPlayerId, currentDice.sum);

  const sortedSel = [...squares].sort((a, b) => a - b);
  const exists = options.some((combo) => {
    const s = [...combo].sort((a, b) => a - b);
    if (s.length !== sortedSel.length) return false;
    return s.every((v, i) => v === sortedSel[i]);
  });

  if (!exists) {
    view.appendLog(
      "Selected combination is no longer valid based on current board. Try again."
    );
    return;
  }

  if (moveType === "cover") {
    currentRound.applyCoverMove(currentPlayerId, squares);
    view.appendLog(
      `${currentPlayerId === "HUMAN" ? "Human" : "Computer"} covers squares [${squares.join(
        ", "
      )}]`
    );
  } else {
    currentRound.applyUncoverMove(currentPlayerId, squares);
    view.appendLog(
      `${currentPlayerId === "HUMAN" ? "Human" : "Computer"} uncovers opponent squares [${squares.join(
        ", "
      )}]`
    );
  }

  view.renderBoards(currentRound);
  pendingOptions = null;

  if (currentRound.roundOver) {
    handleRoundFinished();
    return;
  }

  // Human must roll again
  setPhase("awaitingRoll");
  currentDice = { d1: null, d2: null, sum: null };
  view.setDiceText(currentDice);
  view.setTurnStatus("Move completed. Roll again.");
  updateRollButtonsVisibility();
}

function endTurn() {
  if (!currentRound) return;

  currentRound.notifyTurnEnded(currentPlayerId);

  if (currentRound.roundOver) {
    handleRoundFinished();
    return;
  }

  // Switch to next player
  currentRound.switchTurn();
  currentPlayerId = currentRound.currentPlayerId;

  currentDice = { d1: null, d2: null, sum: null };
  pendingOptions = null;
  setPhase("awaitingRoll");

  view.setDiceText(currentDice);
  view.setCurrentPlayerLabel(
    currentPlayerId === "HUMAN" ? "Human" : "Computer"
  );
  view.setTurnStatus("New turn. Awaiting roll…");

  view.renderBoards(currentRound);
  updateRollButtonsVisibility();

  maybePlayComputerTurn();
}

function maybePlayComputerTurn() {
  if (!currentRound) return;
  if (!isPlayerHumanControlled(currentPlayerId)) {
    // Disable roll buttons while AI is thinking
    view.setRollButtonsVisibility({ canRoll1: false, enableRollButtons: false });
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

    view.renderBoards(currentRound);

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
    pendingOptions = null;
    setPhase("awaitingRoll");

    view.setDiceText(currentDice);
    view.setCurrentPlayerLabel(
      currentPlayerId === "HUMAN" ? "Human" : "Computer"
    );
    view.setTurnStatus("New turn. Awaiting roll…");

    view.renderBoards(currentRound);
    updateRollButtonsVisibility();

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
