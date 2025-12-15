// js/main.js
import { View } from "./ui/View.js";
import { GameSession } from "./model/GameSession.js";

const view = new View();
const session = new GameSession();

const DEFAULT_FIRST_PLAYER_TEXT =
  'Choose who goes first or click "Roll Dice" to decide randomly.';

// purely UI-side pending options (for the move modal)
let uiPendingOptions = null;
let lastShownRoll = null;

function log(message) {
  const ts = new Date().toLocaleTimeString();
  view.appendLog(`[${ts}] ${message}`);
}

function setLastPlayFromAction(action) {
  if (!action) return;
  const playerName = session.getPlayerDisplayName(action.playerId || "HUMAN");
  let verb = "made no move";
  if (action.action === "cover") verb = "covered";
  else if (action.action === "uncover") verb = "uncovered";
  const squaresText =
    action.squares && action.squares.length
      ? `[${action.squares.join(", ")}]`
      : "no squares";
  view.setLastPlay(`${playerName} ${verb} ${squaresText}`);
}

function formatActionLog(action) {
  if (!action) return null;
  const playerName = session.getPlayerDisplayName(action.playerId || "HUMAN");
  const squaresText =
    action.squares && action.squares.length
      ? `[${action.squares.join(", ")}]`
      : "(none)";
  if (action.action === "cover") {
    return `${playerName} covered their squares ${squaresText}`;
  }
  if (action.action === "uncover") {
    return `${playerName} uncovered opponent squares ${squaresText}`;
  }
  if (action.action === "none") {
    return `${playerName} made no move`;
  }
  return `${playerName} performed ${action.action || "an action"} ${squaresText}`;
}

function logAction(action) {
  const msg = formatActionLog(action);
  if (msg) {
    log(msg);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  wireWelcome();
  wireSetup();
  wireGame();
  wireEnd();
  session.setMode("HvsC");

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
    view.renderBoards(round, {
      humanAdvantage: round.getLockedAdvantageSquare("HUMAN"),
      computerAdvantage: round.getLockedAdvantageSquare("COMPUTER"),
    });
  }
  const scores = session.getScores();
  view.setScores(scores.humanScore, scores.computerScore);
}

function updateTurnInfoStatus(textIfAny, diceOverride = null) {
  view.setCurrentPlayerLabel(session.getCurrentPlayerLabel());
  const diceToShow = diceOverride || lastShownRoll || session.getCurrentDice();
  view.setDiceText(diceToShow);
  if (textIfAny) {
    view.setTurnStatus(textIfAny);
  }
}

function handleRoundFinished(summary) {
  // summary comes from GameSession
  view.setScores(summary.humanScore, summary.computerScore);
  view.setEndScreen(summary);
  view.showScreen("end");
  log(
    `Round over. Winner: ${summary.roundWinnerId} | Type: ${summary.winType} | Round score: ${summary.roundScore}`
  );
}

/* ---------- WELCOME SCREEN ---------- */

function wireWelcome() {
  const btnStartSetup = document.getElementById("btn-start-setup");
  const btnUpload = document.getElementById("btn-upload-snapshot");
  const fileInput = document.getElementById("file-snapshot");

  btnStartSetup.addEventListener("click", () => {
    session.resetTournament();
    session.setMode("HvsC");
    const defaultModeRadio = document.querySelector('input[name="mode"][value="HvsC"]');
    if (defaultModeRadio) defaultModeRadio.checked = true;
    view.showScreen("setup");
    view.setLastPlay("–");
    view.setRolloffText(DEFAULT_FIRST_PLAYER_TEXT, false);
    const btnStartRound = document.getElementById("btn-start-round");
    const firstPlayerRadios = document.querySelectorAll('input[name="first-player"]');
    if (btnStartRound) {
      btnStartRound.style.display = "none";
      btnStartRound.dataset.firstPlayerId = "";
    }
    firstPlayerRadios.forEach((r) => (r.checked = false));
    view.setPlayerNames(
      session.getPlayerDisplayName("HUMAN"),
      session.getPlayerDisplayName("COMPUTER")
    );
    log("Tournament reset.");
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
          state.logLines.forEach((line) => log(line));

          view.setRoundHeader(state.header);
          view.setScores(state.scores.humanScore, state.scores.computerScore);
          view.setPlayerNames(
            session.getPlayerDisplayName("HUMAN"),
            session.getPlayerDisplayName("COMPUTER")
          );
          lastShownRoll = null;
          view.setLastPlay("–");
          const round = session.getCurrentRound();
          view.renderBoards(round, {
            humanAdvantage: round.getLockedAdvantageSquare("HUMAN"),
            computerAdvantage: round.getLockedAdvantageSquare("COMPUTER"),
          });
          updateTurnInfoStatus(state.turnStatus);
          updateRollButtonsFromSession();
        } catch (err) {
          console.error(err);
          alert("Could not load saved game: " + (err.message || err));
          log("Failed to load saved game.");
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
  const firstPlayerRadios = document.querySelectorAll('input[name="first-player"]');
  btnStartRound.style.display = "none";

  const clearFirstPlayerSelection = () => {
    firstPlayerRadios.forEach((r) => {
      r.checked = false;
    });
    btnStartRound.style.display = "none";
    btnStartRound.dataset.firstPlayerId = "";
    view.setRolloffText(DEFAULT_FIRST_PLAYER_TEXT, false);
  };

  const applyFirstPlayerSelection = (playerId, reasonText) => {
    btnStartRound.style.display = "inline-block";
    btnStartRound.dataset.firstPlayerId = playerId;
    view.setRolloffText(reasonText, true);
  };

  // Update mode (no logic here, we just forward)
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const mode = document.querySelector('input[name="mode"]:checked').value;
      session.setMode(mode);
      view.setPlayerNames(
        session.getPlayerDisplayName("HUMAN"),
        session.getPlayerDisplayName("COMPUTER")
      );
      clearFirstPlayerSelection();
    });
  });
  // ensure default selection is Human vs Computer
  const defaultMode = document.querySelector('input[name="mode"][value="HvsC"]');
  if (defaultMode) defaultMode.checked = true;
  // sync player labels for first-player chooser
  view.setPlayerNames(
    session.getPlayerDisplayName("HUMAN"),
    session.getPlayerDisplayName("COMPUTER")
  );
  view.setRolloffText(DEFAULT_FIRST_PLAYER_TEXT, false);
  firstPlayerRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const playerId = radio.value;
      const playerName = session.getPlayerDisplayName(playerId);
      applyFirstPlayerSelection(playerId, `Manual choice: ${playerName} will go first.`);
    });
  });

  btnRolloff.addEventListener("click", () => {
    firstPlayerRadios.forEach((r) => (r.checked = false));
    const boardSize = Number(selectBoardSize.value) || 9;
    const result = session.rollOff(boardSize);

    view.setRolloffText(result.text, result.canStart);

    btnStartRound.style.display = result.canStart ? "inline-block" : "none";
    btnStartRound.dataset.firstPlayerId = result.canStart
      ? result.firstPlayerId
      : "";
  });

  btnSetupBack.addEventListener("click", () => {
    view.showScreen("welcome");
  });

  btnStartRound.addEventListener("click", () => {
    if (btnStartRound.style.display === "none") return;
    const firstPlayerId = btnStartRound.dataset.firstPlayerId;
    if (!firstPlayerId) return;

    const boardSize = Number(selectBoardSize.value) || 9;
    const state = session.startNewRound(boardSize, firstPlayerId);

    view.showScreen("game");
    view.clearLog();
    view.setRoundHeader(state.header);
    view.setScores(state.scores.humanScore, state.scores.computerScore);
    view.setPlayerNames(
      session.getPlayerDisplayName("HUMAN"),
      session.getPlayerDisplayName("COMPUTER")
    );
    lastShownRoll = null;
    view.setLastPlay("–");
    const round = session.getCurrentRound();
    view.renderBoards(round, {
      humanAdvantage: round.getLockedAdvantageSquare("HUMAN"),
      computerAdvantage: round.getLockedAdvantageSquare("COMPUTER"),
    });
    updateTurnInfoStatus("Awaiting roll…");
    view.appendLog(
      `Round ${state.header.roundNumber} started. First player: ${state.header.firstPlayerLabel}`
    );
    log(`Mode: ${state.header.modeLabel}`);

    updateRollButtonsFromSession();
  });
}

/* ---------- GAME SCREEN: ROLL / MODAL / QUIT ---------- */

function wireGame() {
  const btnRoll1 = document.getElementById("btn-roll-1");
  const btnRoll2 = document.getElementById("btn-roll-2");
  const btnRollManual = document.getElementById("btn-roll-manual");
  const btnRewind = document.getElementById("btn-rewind");
  const btnQueueDice = document.getElementById("btn-queue-dice");
  const btnQuitRound = document.getElementById("btn-quit-round");

  const modalBtnHelp = document.getElementById("modal-btn-help");
  const modalBtnCancel = document.getElementById("modal-btn-cancel");
  const modalBtnConfirm = document.getElementById("modal-btn-confirm");
  const modalMoveCover = document.getElementById("modal-move-cover");
  const modalMoveUncover = document.getElementById("modal-move-uncover");

  const manualDiceConfirm = document.getElementById("manual-dice-confirm");
  const manualDiceCancel = document.getElementById("manual-dice-cancel");
  const btnSaveSnapshot = document.getElementById("btn-save-snapshot");
  const rewindConfirm = document.getElementById("rewind-confirm");
  const rewindCancel = document.getElementById("rewind-cancel");
  const rewindListEl = document.getElementById("rewind-list");
  const queueDiceConfirm = document.getElementById("queue-dice-confirm");
  const queueDiceCancel = document.getElementById("queue-dice-cancel");

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
      log(res.error);
      return;
    }

    // Always sync current player label on any roll handling
    view.setCurrentPlayerLabel(session.getCurrentPlayerLabel());

    // Show dice
    if (res.roll) {
      view.setDiceText(res.roll);
      lastShownRoll = res.roll;
      const r = res.roll;
      if (r.d2 == null) {
        log(`${playerLabel} ${sourceLabel} ${r.d1} (sum = ${r.sum})`);
      } else {
        log(`${playerLabel} ${sourceLabel} ${r.d1} + ${r.d2} (sum = ${r.sum})`);
      }
    }

    if (res.lastAction) {
      if (res.lastAction.roll) {
        lastShownRoll = res.lastAction.roll;
        view.setDiceText(lastShownRoll);
      }
      setLastPlayFromAction(res.lastAction);
      logAction(res.lastAction);
    }

    // No moves available and no auto move
    if (!res.canMove && !res.autoMoveDone) {
      log(`${playerLabel}: no moves available for this roll. Turn ends.`);
      const endRes = session.endTurn();
      if (endRes.roundOver) {
        handleRoundFinished(endRes.summary);
        return;
      }
      refreshBoardsAndScores();
      updateTurnInfoStatus("New turn. Awaiting roll…", res.roll);
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

    updateTurnInfoStatus("Move completed. Roll again.", res.roll || lastShownRoll);
    updateRollButtonsFromSession();
  }

  // Roll buttons: random roll for current player
  if (btnRoll1) {
    btnRoll1.addEventListener("click", () => {
      const res = session.handleRandomRoll(1);
      const playerLabel = session.getCurrentPlayerLabel();
      processRollOutcome(res, playerLabel, "rolled");
    });
  }
  if (btnRoll2) {
    btnRoll2.addEventListener("click", () => {
      const res = session.handleRandomRoll(2);
      const playerLabel = session.getCurrentPlayerLabel();
      processRollOutcome(res, playerLabel, "rolled");
    });
  }
  if (btnRollManual) {
    btnRollManual.addEventListener("click", openManualDice);
  }

  // Queue dice sequence
  if (btnQueueDice) {
    btnQueueDice.addEventListener("click", () => view.openQueueDiceModal());
  }

  // Rewind (UI only, placeholder)
  if (btnRewind) {
    btnRewind.addEventListener("click", () => {
      const entries = session.getHistoryEntries();
      if (!entries.length) {
        view.appendLog("No moves to rewind.");
        return;
      }
      // show newest first
      view.openRewindModal(entries.slice().reverse());

      // attach hover/select listeners
      const items = rewindListEl ? rewindListEl.querySelectorAll(".rewind-item") : [];
      items.forEach((item) => {
        item.addEventListener("mouseenter", () => {
          const idx = Number(item.dataset.index);
          const snap = session.getHistorySnapshot(idx);
          if (!snap) return;
          view.setRewindPreview(buildPreviewText(snap));
        });
        item.addEventListener("click", () => {
          items.forEach((el) => el.classList.remove("selected"));
          item.classList.add("selected");
        });
      });
    });
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

    // Auto-select suggested move type and combo in the modal
    if (!uiPendingOptions) return;
    const moveType = suggestion.action === "uncover" ? "uncover" : "cover";
    const options =
      moveType === "cover" ? uiPendingOptions.coverOptions : uiPendingOptions.uncoverOptions;
    if (options && options.length > 0) {
      view.setMoveSelection(moveType, options, suggestion.squares);
    }
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
      log(res.error);
      return;
    }

    const playerLabel = session.getCurrentPlayerLabel();
    logAction({
      playerId: session.getCurrentPlayerId(),
      action: selection.moveType,
      squares: [...selection.squares],
    });
    setLastPlayFromAction({
      playerId: session.getCurrentPlayerId(),
      action: selection.moveType,
      squares: [...selection.squares],
      roll: lastShownRoll,
    });

    uiPendingOptions = null;
    view.closeMoveModal();
    refreshBoardsAndScores();

    if (res.roundOver) {
      handleRoundFinished(res.summary);
      return;
    }

    // Same player rolls again
    updateTurnInfoStatus("Move completed. Roll again.", lastShownRoll);
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
        log("Game snapshot saved. Quitting game.");
        // Reset/quit after saving
        session.resetTournament();
        uiPendingOptions = null;
        lastShownRoll = null;
        view.clearLog();
        view.setLastPlay("–");
        view.setDiceText({ d1: null, d2: null, sum: null });
        view.setTurnStatus("Awaiting roll…");
        view.showScreen("welcome");
      } catch (err) {
        alert("Could not save snapshot: " + (err.message || err));
      }
    });
  }

  // Rewind modal buttons
  if (rewindCancel) {
    rewindCancel.addEventListener("click", () => view.closeRewindModal());
  }
  if (rewindConfirm) {
    rewindConfirm.addEventListener("click", () => {
      const sel = view.getRewindSelection();
      if (sel == null) {
        view.appendLog("No rewind selection made.");
        return;
      }
      const res = session.rewindTo(sel);
      if (res.error) {
        view.appendLog(res.error);
        view.closeRewindModal();
        return;
      }

      // Update UI based on restored state
      uiPendingOptions = null;
      lastShownRoll = null;
      const round = session.getCurrentRound();
      view.setRoundHeader(res.header);
      view.setScores(res.scores.humanScore, res.scores.computerScore);
      view.setPlayerNames(
        session.getPlayerDisplayName("HUMAN"),
        session.getPlayerDisplayName("COMPUTER")
      );
      view.renderBoards(round, {
        humanAdvantage: round.getLockedAdvantageSquare("HUMAN"),
        computerAdvantage: round.getLockedAdvantageSquare("COMPUTER"),
      });
      setLastPlayFromAction(res.lastAction);
      view.setCurrentPlayerLabel(session.getCurrentPlayerLabel());
      // If rewound into awaitingMove and human-controlled, reopen modal
      if (
        res.phase === "awaitingMove" &&
        session.isPlayerHumanControlled(session.getCurrentPlayerId())
      ) {
        const sum = (lastShownRoll || session.getCurrentDice()).sum;
        const coverOptions = round.getCoverOptions(session.getCurrentPlayerId(), sum);
        const uncoverOptions = round.getUncoverOptions(session.getCurrentPlayerId(), sum);
        uiPendingOptions = { coverOptions, uncoverOptions };
        view.setRollButtonsVisibility({ canRoll1: false, enableRollButtons: false });
        view.openMoveModal(sum, coverOptions, uncoverOptions);
        view.setTurnStatus("Choose your move.");
      } else {
        view.setDiceText({ d1: null, d2: null, sum: null });
        view.setTurnStatus("Awaiting roll…");
      }
      updateRollButtonsFromSession();
      const entryLabel =
        session.getHistoryEntries().find((e) => e.index === sel)?.label ||
        `entry ${sel}`;
      view.appendLog(`Rewound to: ${entryLabel}`);
      view.closeRewindModal();
    });
  }

  // Queue dice modal buttons
  if (queueDiceCancel) {
    queueDiceCancel.addEventListener("click", () => view.closeQueueDiceModal());
  }
  if (queueDiceConfirm) {
    queueDiceConfirm.addEventListener("click", () => {
      const lines = view.getQueuedDiceLines();
      if (!lines.length) {
        view.appendLog("No dice sequence provided.");
        view.closeQueueDiceModal();
        return;
      }
      const entries = [];
      for (const line of lines) {
        const parts = line.split(/[\s,]+/).map((p) => p.trim()).filter(Boolean);
        if (parts.length === 1) {
          const d1 = Number(parts[0]);
          if (!Number.isInteger(d1) || d1 < 1 || d1 > 6) continue;
          entries.push({ d1, d2: null });
        } else if (parts.length >= 2) {
          const d1 = Number(parts[0]);
          const d2 = Number(parts[1]);
          if (
            !Number.isInteger(d1) ||
            !Number.isInteger(d2) ||
            d1 < 1 ||
            d1 > 6 ||
            d2 < 1 ||
            d2 > 6
          )
            continue;
          entries.push({ d1, d2 });
        }
      }
      session.queuedRolls = entries;
      if (session.dice) session.dice.setQueue(entries);
      view.appendLog(
        `Queued ${entries.length} manual roll${entries.length === 1 ? "" : "s"} for upcoming turns.`
      );
      view.closeQueueDiceModal();
    });
  }

  function buildPreviewText(snap) {
    const coveredFromArray = (arr) =>
      arr
        .map((v, idx) => (v === 0 ? idx + 1 : null))
        .filter((v) => v != null);
    const uncoveredFromArray = (arr) =>
      arr
        .map((v, idx) => (v !== 0 ? v : null))
        .filter((v) => v != null);

    const humanCovered = coveredFromArray(snap.round.humanBoard);
    const compCovered = coveredFromArray(snap.round.computerBoard);

    const lines = [];
    lines.push(`Current: ${session.getPlayerDisplayName(snap.currentPlayerId)}`);
    lines.push(`Phase: ${snap.phase}`);
    lines.push(
      `Scores H/C: ${snap.tournament.humanScore} / ${snap.tournament.computerScore}`
    );
    lines.push(
      `Human covered: ${humanCovered.length ? humanCovered.join(", ") : "(none)"}`
    );
    lines.push(
      `Computer covered: ${compCovered.length ? compCovered.join(", ") : "(none)"}`
    );
    // Render board previews
    view.renderRewindBoards(snap.round.humanBoard, snap.round.computerBoard);
    return lines.join(" | ");
  }
}

/* ---------- END SCREEN ---------- */

function wireEnd() {
  const btnPlayAgain = document.getElementById("btn-end-play-again");
  const btnEndQuit = document.getElementById("btn-end-quit");

  btnPlayAgain.addEventListener("click", () => {
    view.showScreen("setup");
    view.setRolloffText(DEFAULT_FIRST_PLAYER_TEXT, false);
    const btnStartRound = document.getElementById("btn-start-round");
    const firstPlayerRadios = document.querySelectorAll('input[name="first-player"]');
    if (btnStartRound) {
      btnStartRound.style.display = "none";
      btnStartRound.dataset.firstPlayerId = "";
    }
    firstPlayerRadios.forEach((r) => (r.checked = false));
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
