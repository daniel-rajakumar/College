// js/main.js
import { View } from "./ui/View.js";
import { GameSession } from "./model/GameSession.js";

const view = new View();
const session = new GameSession();

// purely UI-side pending options (for the modal)
let uiPendingOptions = null;

window.addEventListener("DOMContentLoaded", () => {
  wireWelcome();
  wireSetup();
  wireGame();
  wireEnd();

  // initial roll button state
  updateRollButtonsFromSession();
});

/* ---------- HELPERS (controller-only) ---------- */

function updateRollButtonsFromSession() {
  const state = session.getRollButtonState();
  view.setRollButtonsVisibility(state);
}

function refreshBoardsAndScores() {
  const round = session.getCurrentRound();
  if (round) {
    view.renderBoards(round);
  }
  const scores = session.getScores();
  view.setScores(scores.humanScore, scores.computerScore);
}

function updateTurnInfoStatus(textIfAny) {
  view.setCurrentPlayerLabel(session.getCurrentPlayerLabel());
  view.setDiceText(session.getCurrentDice());
  if (textIfAny) {
    view.setTurnStatus(textIfAny);
  }
}

function handleRoundFinished(summary) {
  // summary comes from GameSession
  view.setScores(summary.humanScore, summary.computerScore);
  view.setEndScreen(summary);
  view.showScreen("end");
}

/**
 * Ask the session to let the computer play until:
 *  - it's a human-controlled player's turn, or
 *  - round ends.
 */
function maybeRunComputerFromSession() {
  const result = session.runComputerUntilHumanOrRoundEnd();
  if (!result || !result.autoPlayed) return;

  // Show logs from the session
  result.logs.forEach((line) => view.appendLog(line));

  // Update boards & scores
  refreshBoardsAndScores();

  if (result.roundOver) {
    handleRoundFinished(result.summary);
    return;
  }

  // Round still active, now some player is up (probably human)
  updateTurnInfoStatus(result.turnStatus);
  updateRollButtonsFromSession();
}

/* ---------- WELCOME SCREEN ---------- */

function wireWelcome() {
  const btnStartSetup = document.getElementById("btn-start-setup");
  const btnUpload = document.getElementById("btn-upload-snapshot");
  const fileInput = document.getElementById("file-snapshot");

  btnStartSetup.addEventListener("click", () => {
    session.resetTournament();
    view.showScreen("setup");
  });

  // Trigger hidden file input
  btnUpload.addEventListener("click", () => {
    if (fileInput) {
      fileInput.value = "";
      fileInput.click();
    }
  });

  // Handle file selection for loading a saved game
  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith(".txt")) {
        alert("Please select a .txt saved game file.");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || "");
          const state = session.loadSnapshotFromText(text);

          // Switch to game screen & render from session state
          view.showScreen("game");
          view.clearLog();
          state.logLines.forEach((line) => view.appendLog(line));

          view.setRoundHeader(state.header);
          view.setScores(state.scores.humanScore, state.scores.computerScore);
          view.renderBoards(session.getCurrentRound());
          updateTurnInfoStatus(state.turnStatus);
          updateRollButtonsFromSession();

          // If loaded state says it is computer's turn, let session drive it
          maybeRunComputerFromSession();
        } catch (err) {
          console.error(err);
          alert("Could not load saved game: " + (err.message || err));
        } finally {
          event.target.value = "";
        }
      };
      reader.readAsText(file);
    });
  }
}

/* ---------- SETUP SCREEN ---------- */

function wireSetup() {
  const selectBoardSize = document.getElementById("select-board-size");
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const btnRolloff = document.getElementById("btn-rolloff");
  const btnSetupBack = document.getElementById("btn-setup-back");
  const btnStartRound = document.getElementById("btn-start-round");

  // Update mode (no logic here, we just forward)
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const mode = document.querySelector('input[name="mode"]:checked').value;
      session.setMode(mode);
    });
  });

  btnRolloff.addEventListener("click", () => {
    const boardSize = Number(selectBoardSize.value) || 9;
    const result = session.rollOff(boardSize);

    view.setRolloffText(result.text, result.canStart);

    if (result.canStart && result.firstPlayerId) {
      btnStartRound.dataset.firstPlayerId = result.firstPlayerId;
    } else {
      btnStartRound.dataset.firstPlayerId = "";
    }
  });

  btnSetupBack.addEventListener("click", () => {
    view.showScreen("welcome");
  });

  btnStartRound.addEventListener("click", () => {
    const firstPlayerId = btnStartRound.dataset.firstPlayerId;
    if (!firstPlayerId) return;

    const boardSize = Number(selectBoardSize.value) || 9;
    const state = session.startNewRound(boardSize, firstPlayerId);

    view.showScreen("game");
    view.clearLog();
    view.setRoundHeader(state.header);
    view.setScores(state.scores.humanScore, state.scores.computerScore);
    view.renderBoards(session.getCurrentRound());
    updateTurnInfoStatus("Awaiting roll…");
    view.appendLog(
      `Round ${state.header.roundNumber} started. First player: ${state.header.firstPlayerLabel}`
    );

    updateRollButtonsFromSession();
    maybeRunComputerFromSession();
  });
}

/* ---------- GAME SCREEN: ROLL / MODAL / QUIT ---------- */

function wireGame() {
  const btnRoll1 = document.getElementById("btn-roll-1");
  const btnRoll2 = document.getElementById("btn-roll-2");
  const btnQuitRound = document.getElementById("btn-quit-round");

  const modalBtnHelp = document.getElementById("modal-btn-help");
  const modalBtnCancel = document.getElementById("modal-btn-cancel");
  const modalBtnConfirm = document.getElementById("modal-btn-confirm");
  const modalMoveCover = document.getElementById("modal-move-cover");
  const modalMoveUncover = document.getElementById("modal-move-uncover");

  btnRoll1.addEventListener("click", () => handleHumanRoll(1));
  btnRoll2.addEventListener("click", () => handleHumanRoll(2));

  function handleHumanRoll(numDice) {
    const res = session.handleHumanRoll(numDice);
    if (res.error) {
      view.appendLog(res.error);
      return;
    }

    // Show dice
    view.setDiceText(res.roll);

    // Log roll
    const playerLabel = session.getCurrentPlayerLabel();
    if (res.roll.d2 == null) {
      view.appendLog(`${playerLabel} rolled ${res.roll.d1} (sum = ${res.roll.sum})`);
    } else {
      view.appendLog(
        `${playerLabel} rolled ${res.roll.d1} + ${res.roll.d2} (sum = ${res.roll.sum})`
      );
    }

    if (!res.canMove) {
      view.appendLog("No moves available for this roll. Turn ends.");
      const endRes = session.endTurn();
      if (endRes.roundOver) {
        handleRoundFinished(endRes.summary);
        return;
      }
      refreshBoardsAndScores();
      updateTurnInfoStatus("New turn. Awaiting roll…");
      updateRollButtonsFromSession();
      maybeRunComputerFromSession();
      return;
    }

    // We have moves → open modal
    uiPendingOptions = {
      coverOptions: res.coverOptions,
      uncoverOptions: res.uncoverOptions,
    };

    view.setTurnStatus("Choose your move.");
    view.setRollButtonsVisibility({ canRoll1: false, enableRollButtons: false });
    view.openMoveModal(
      res.roll.sum,
      res.coverOptions,
      res.uncoverOptions
    );
  }

  // Modal: switch type (cover / uncover)
  modalMoveCover.addEventListener("change", () => {
    if (!uiPendingOptions || !modalMoveCover.checked) return;
    view.updateMoveModalOptions("cover", uiPendingOptions.coverOptions || []);
  });

  modalMoveUncover.addEventListener("change", () => {
    if (!uiPendingOptions || !modalMoveUncover.checked) return;
    view.updateMoveModalOptions("uncover", uiPendingOptions.uncoverOptions || []);
  });

  // Modal: Help (delegates to model)
  modalBtnHelp.addEventListener("click", () => {
    const suggestion = session.getHelpSuggestion();
    if (!suggestion) return;
    view.setMoveHelpText(
      `Recommended: ${suggestion.action.toUpperCase()} [${suggestion.squares.join(
        ", "
      )}] – ${suggestion.reason}`
    );
  });

  // Modal: Confirm move
  modalBtnConfirm.addEventListener("click", () => {
    if (!uiPendingOptions) {
      view.closeMoveModal();
      return;
    }

    const selection = view.getMoveModalSelection(
      uiPendingOptions.coverOptions,
      uiPendingOptions.uncoverOptions
    );
    if (!selection) {
      view.setMoveHelpText("Please choose a combination.");
      return;
    }

    const res = session.applyHumanMove(selection.moveType, selection.squares);
    if (res.error) {
      view.appendLog(res.error);
      return;
    }

    const playerLabel = session.getCurrentPlayerLabel();
    if (selection.moveType === "cover") {
      view.appendLog(
        `${playerLabel} covers squares [${selection.squares.join(", ")}]`
      );
    } else {
      view.appendLog(
        `${playerLabel} uncovers opponent squares [${selection.squares.join(", ")}]`
      );
    }

    uiPendingOptions = null;
    view.closeMoveModal();
    refreshBoardsAndScores();

    if (res.roundOver) {
      handleRoundFinished(res.summary);
      return;
    }

    // Same player rolls again
    updateTurnInfoStatus("Move completed. Roll again.");
    updateRollButtonsFromSession();
  });

  // Modal: Cancel = skip move, end turn
  modalBtnCancel.addEventListener("click", () => {
    if (!uiPendingOptions) {
      view.closeMoveModal();
      return;
    }

    view.appendLog("You skipped your move. Turn ends.");
    uiPendingOptions = null;
    view.closeMoveModal();

    const endRes = session.endTurn();
    if (endRes.roundOver) {
      handleRoundFinished(endRes.summary);
      return;
    }

    refreshBoardsAndScores();
    updateTurnInfoStatus("New turn. Awaiting roll…");
    updateRollButtonsFromSession();
    maybeRunComputerFromSession();
  });

  // Quit tournament mid-round
  btnQuitRound.addEventListener("click", () => {
    const result = session.getTournamentResult();
    const summary = {
      roundWinnerId: result.winnerId,
      winType: "tournament",
      roundScore: 0,
      humanScore: result.humanScore,
      computerScore: result.computerScore,
      advantageForNext: null,
      // also used by View.setEndScreen:
      roundResultText: "",
    };
    view.setEndScreen(summary);
    view.showScreen("end");
  });
}

/* ---------- END SCREEN ---------- */

function wireEnd() {
  const btnPlayAgain = document.getElementById("btn-end-play-again");
  const btnEndQuit = document.getElementById("btn-end-quit");

  btnPlayAgain.addEventListener("click", () => {
    view.showScreen("setup");
    const defaultText = 'Click "Roll Dice" to determine the first player.';
    view.setRolloffText(defaultText, false);
  });

  btnEndQuit.addEventListener("click", () => {
    const result = session.getTournamentResult();
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
