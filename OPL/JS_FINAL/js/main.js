// js/main.js
import { View } from "./ui/View.js";
import { GameSession } from "./model/GameSession.js";

const view = new View();
const session = new GameSession();

// purely UI-side pending options (for the move modal)
let uiPendingOptions = null;

window.addEventListener("DOMContentLoaded", () => {
  wireWelcome();
  wireSetup();
  wireGame();
  wireEnd();

  // initial roll button state
  updateRollButtonsFromSession();
  view.initManualDiceListeners();
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
  });
}

/* ---------- GAME SCREEN: ROLL / MODAL / QUIT ---------- */

function wireGame() {
  const btnRoll1 = document.getElementById("btn-roll-1");
  const btnRoll2 = document.getElementById("btn-roll-2");
  const btnRollManual = document.getElementById("btn-roll-manual");
  const btnQuitRound = document.getElementById("btn-quit-round");

  const modalBtnHelp = document.getElementById("modal-btn-help");
  const modalBtnCancel = document.getElementById("modal-btn-cancel");
  const modalBtnConfirm = document.getElementById("modal-btn-confirm");
  const modalMoveCover = document.getElementById("modal-move-cover");
  const modalMoveUncover = document.getElementById("modal-move-uncover");

  const manualDiceConfirm = document.getElementById("manual-dice-confirm");
  const manualDiceCancel = document.getElementById("manual-dice-cancel");
  const btnSaveSnapshot = document.getElementById("btn-save-snapshot");

  // Helper: open manual dice modal if rolling is allowed for the *current* player
  function openManualDice() {
    const diceState = session.getRollButtonState();
    if (!diceState.enableRollButtons) return;

    view.setManualDiceHelp("");
    view.openManualDiceModal();
  }

  // Helper: process roll outcome (manual or random)
  function processRollOutcome(res, playerLabel, sourceLabel) {
    if (res.error) {
      view.appendLog(res.error);
      return;
    }

    // Show dice
    if (res.roll) {
      view.setDiceText(res.roll);
      const r = res.roll;
      if (r.d2 == null) {
        view.appendLog(`${playerLabel} ${sourceLabel} ${r.d1} (sum = ${r.sum})`);
      } else {
        view.appendLog(
          `${playerLabel} ${sourceLabel} ${r.d1} + ${r.d2} (sum = ${r.sum})`
        );
      }
    }

    // No moves available and no auto move
    if (!res.canMove && !res.autoMoveDone) {
      view.appendLog("No moves available for this roll. Turn ends.");
      const endRes = session.endTurn();
      if (endRes.roundOver) {
        handleRoundFinished(endRes.summary);
        return;
      }
      refreshBoardsAndScores();
      updateTurnInfoStatus("New turn. Awaiting roll…");
      updateRollButtonsFromSession();
      return;
    }

    // Human needs to pick a move
    if (res.coverOptions && res.uncoverOptions && res.canMove) {
      uiPendingOptions = {
        coverOptions: res.coverOptions,
        uncoverOptions: res.uncoverOptions,
      };

      view.setTurnStatus("Choose your move.");
      view.setRollButtonsVisibility({
        canRoll1: false,
        enableRollButtons: false,
      });
      view.openMoveModal(res.roll.sum, res.coverOptions, res.uncoverOptions);
      return;
    }

    // AI already moved
    refreshBoardsAndScores();

    if (res.roundOver) {
      handleRoundFinished(res.summary);
      return;
    }

    updateTurnInfoStatus("Move completed. Roll again.");
    updateRollButtonsFromSession();
  }

  // Roll buttons: open manual dice (user rolls for both players)
  if (btnRoll1) {
    btnRoll1.addEventListener("click", () => {
      view.setManualDiceCount(1);
      openManualDice();
    });
  }
  if (btnRoll2) {
    btnRoll2.addEventListener("click", () => {
      view.setManualDiceCount(2);
      openManualDice();
    });
  }
  if (btnRollManual) {
    btnRollManual.addEventListener("click", openManualDice);
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

  // Modal: Confirm move (human-selected move)
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

    // If options exist, player must pick one (cannot skip)
    if (
      (uiPendingOptions.coverOptions && uiPendingOptions.coverOptions.length) ||
      (uiPendingOptions.uncoverOptions && uiPendingOptions.uncoverOptions.length)
    ) {
      view.setMoveHelpText("You must choose a valid move; skipping is not allowed when moves exist.");
      return;
    }

    uiPendingOptions = null;
    view.closeMoveModal();
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

  // Manual dice modal: Confirm
  if (manualDiceConfirm) {
    manualDiceConfirm.addEventListener("click", () => {
      const selection = view.getManualDiceSelection();
      if (!selection) {
        view.setManualDiceHelp("Please select the dice values first.");
        return;
      }

      // This now handles the CURRENT player (human or computer)
      const res = session.handleManualRoll(selection.numDice, selection.values);
      if (res.error) {
        view.setManualDiceHelp(res.error);
        return;
      }

      // Close manual modal, then process result
      view.closeManualDiceModal();
      const playerLabel = session.getCurrentPlayerLabel();
      processRollOutcome(res, playerLabel, "(manual) chose");
    });
  }

  // Manual dice modal: Cancel
  if (manualDiceCancel) {
    manualDiceCancel.addEventListener("click", () => {
      view.closeManualDiceModal();
    });
  }

  // Save snapshot to .txt
  if (btnSaveSnapshot) {
    btnSaveSnapshot.addEventListener("click", () => {
      try {
        const text = session.getSnapshotText();
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const round = session.getCurrentRound();
        const roundNum = round ? round.boardSize : "state";
        a.href = url;
        a.download = `canoga_snapshot_${roundNum}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        view.appendLog("Game snapshot saved.");
      } catch (err) {
        alert("Could not save snapshot: " + (err.message || err));
      }
    });
  }
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
