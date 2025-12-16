/**
 * View handles all DOM reads/writes for the Canoga UI and modal helpers.
 */
export class View {
  constructor() {
    this.screens = {
      welcome: document.getElementById("screen-welcome"),
      setup: document.getElementById("screen-setup"),
      game: document.getElementById("screen-game"),
      end: document.getElementById("screen-end"),
    };

    this.rolloffResultEl = document.getElementById("rolloff-result");
    this.btnStartRound = document.getElementById("btn-start-round");
    this.firstPlayerHumanLabel = document.getElementById("label-first-human");
    this.firstPlayerComputerLabel = document.getElementById("label-first-computer");

    this.lblRoundNumber = document.getElementById("lbl-round-number");
    this.lblMode = document.getElementById("lbl-mode");
    this.lblFirstPlayer = document.getElementById("lbl-first-player");
    this.lblAdvantage = document.getElementById("lbl-advantage");

    this.scoreHuman = document.getElementById("score-human");
    this.scoreComputer = document.getElementById("score-computer");

    this.lblCurrentPlayer = document.getElementById("lbl-current-player");

    this.boardHuman = document.getElementById("board-human");
    this.boardComputer = document.getElementById("board-computer");

    this.lblDice = document.getElementById("lbl-dice");
    this.lblDiceSum = document.getElementById("lbl-dice-sum");
    this.lblTurnStatus = document.getElementById("lbl-turn-status");
    this.computerReasonBox = document.querySelector(".computer-reason");
    this.lblComputerReason = document.getElementById("lbl-computer-reason");

    this.logEl = document.getElementById("log");

    this.btnRollManual = document.getElementById("btn-roll-manual");
    this.btnRewind = document.getElementById("btn-rewind");

    this.manualDiceModal = document.getElementById("manual-dice-modal");
    this.manualDiceHelp = document.getElementById("manual-dice-help");
    this.manualDiceConfirm = document.getElementById("manual-dice-confirm");
    this.manualDiceCancel = document.getElementById("manual-dice-cancel");
    this.manualDiceCountRadios = document.querySelectorAll('input[name="manual-dice-count"]');
    this.manualDiceRows = document.querySelectorAll(".manual-dice-row");
    this.manualDieButtons = document.querySelectorAll(".manual-die");

    this.btnRoll1 = document.getElementById("btn-roll-1");
    this.btnRoll2 = document.getElementById("btn-roll-2");
    this.btnQueueDice = document.getElementById("btn-queue-dice");

    this.moveModal = document.getElementById("move-modal");
    this.modalDiceSum = document.getElementById("modal-dice-sum");
    this.modalMoveCover = document.getElementById("modal-move-cover");
    this.modalMoveUncover = document.getElementById("modal-move-uncover");
    this.modalMoveOptions = document.getElementById("modal-move-options");
    this.modalHelpText = document.getElementById("modal-help-text");

    this.lblRoundResult = document.getElementById("lbl-round-result");
    this.lblRoundWinner = document.getElementById("lbl-round-winner");
    this.lblRoundWinType = document.getElementById("lbl-round-win-type");
    this.lblRoundScore = document.getElementById("lbl-round-score");
    this.lblFinalHumanScore = document.getElementById("lbl-final-human-score");
    this.lblFinalComputerScore = document.getElementById("lbl-final-computer-score");
    this.lblFinalAdvantage = document.getElementById("lbl-final-advantage");
    this.lblLastPlay = document.getElementById("lbl-last-play");
    this.rewindModal = document.getElementById("rewind-modal");
    this.rewindList = document.getElementById("rewind-list");
    this.rewindPreview = document.getElementById("rewind-preview");
    this.rewindPreviewHuman = document.getElementById("rewind-preview-human");
    this.rewindPreviewComputer = document.getElementById("rewind-preview-computer");
    this.rewindPreviewText = document.getElementById("rewind-preview-text");
    this.rewindConfirm = document.getElementById("rewind-confirm");
    this.rewindCancel = document.getElementById("rewind-cancel");
    this.queueDiceModal = document.getElementById("queue-dice-modal");
    this.queueDiceInput = document.getElementById("queue-dice-input");
    this.queueDiceConfirm = document.getElementById("queue-dice-confirm");
    this.queueDiceCancel = document.getElementById("queue-dice-cancel");

    const scoreHeadings = document.querySelectorAll(".scores h3");
    this.scoreHumanHeading = scoreHeadings[0] || null;
    this.scoreComputerHeading = scoreHeadings[1] || null;

    const boardHeadings = document.querySelectorAll(".board-wrapper h4");
    this.boardHumanHeading = boardHeadings[0] || null;
    this.boardComputerHeading = boardHeadings[1] || null;
  }

  /**
   * Toggle which top-level screen is visible.
   */
  showScreen(name) {
    Object.entries(this.screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
  }

  /**
   * Update roll-off result text and enable/disable start button.
   */
  setRolloffText(text, canStart) {
    this.rolloffResultEl.textContent = text;
    this.btnStartRound.disabled = !canStart;
  }

  /**
   * Render round metadata header.
   */
  setRoundHeader({ roundNumber, modeLabel, firstPlayerLabel, advantageText }) {
    this.lblRoundNumber.textContent = roundNumber;
    this.lblMode.textContent = modeLabel;
    this.lblFirstPlayer.textContent = firstPlayerLabel;
    this.lblAdvantage.textContent = advantageText || "";
  }

  /**
   * Display tournament cumulative scores.
   */
  setScores(humanScore, computerScore) {
    this.scoreHuman.textContent = humanScore;
    this.scoreComputer.textContent = computerScore;
  }

  /**
   * Show the last move summary in the dice panel.
   */
  setLastPlay(text) {
    if (this.lblLastPlay) {
      this.lblLastPlay.textContent = text || "–";
    }
  }

  /**
   * Show/hide and set the computer-move explanation block.
   */
  setComputerReason(text) {
    if (!this.computerReasonBox || !this.lblComputerReason) return;
    const hasText = Boolean(text);
    this.computerReasonBox.classList.toggle("hidden", !hasText);
    this.lblComputerReason.textContent = hasText ? text : "";
  }

  /**
   * Keep all on-screen player labels in sync with the session names.
   */
  setPlayerNames(humanLabel, computerLabel) {
    if (this.scoreHumanHeading) this.scoreHumanHeading.textContent = humanLabel;
    if (this.scoreComputerHeading) this.scoreComputerHeading.textContent = computerLabel;
    if (this.boardHumanHeading) this.boardHumanHeading.textContent = humanLabel;
    if (this.boardComputerHeading) this.boardComputerHeading.textContent = computerLabel;
    if (this.firstPlayerHumanLabel) this.firstPlayerHumanLabel.textContent = humanLabel;
    if (this.firstPlayerComputerLabel) this.firstPlayerComputerLabel.textContent = computerLabel;
  }

  /**
   * Populate and display the rewind modal list.
   */
  openRewindModal(entries) {
    if (!this.rewindModal || !this.rewindList) return;
    this.rewindList.innerHTML = "";
    entries.forEach(({ index, label }) => {
      const item = document.createElement("div");
      item.classList.add("rewind-item");
      item.dataset.index = index;
      item.textContent = label;
      this.rewindList.appendChild(item);
    });
    this.rewindModal.classList.remove("hidden");
  }

  /**
   * Hide the rewind modal.
   */
  closeRewindModal() {
    if (this.rewindModal) {
      this.rewindModal.classList.add("hidden");
    }
  }

  /**
   * Return the selected rewind index, or null if none.
   */
  getRewindSelection() {
    const selected = this.rewindList?.querySelector(".selected");
    if (!selected) return null;
    const idx = Number(selected.dataset.index);
    return Number.isNaN(idx) ? null : idx;
  }

  /**
   * Update the rewind hover preview text.
   */
  setRewindPreview(text) {
    if (this.rewindPreviewText) {
      this.rewindPreviewText.textContent = text || "";
    }
  }

  /**
   * Render rewind board snapshots into the preview slots.
   */
  renderRewindBoards(humanBoardArr, computerBoardArr) {
    const render = (arr, container) => {
      if (!container || !arr) return;
      container.innerHTML = "";
      for (let i = 0; i < arr.length; i++) {
        const squareNum = i + 1;
        const covered = arr[i] === 0;
        const cell = document.createElement("div");
        cell.classList.add("square");
        if (covered) cell.classList.add("covered");
        cell.textContent = covered ? "_" : String(squareNum);
        container.appendChild(cell);
      }
    };
    render(humanBoardArr, this.rewindPreviewHuman);
    render(computerBoardArr, this.rewindPreviewComputer);
  }

  /**
   * Show the queued dice modal and clear prior text.
   */
  openQueueDiceModal() {
    if (!this.queueDiceModal) return;
    if (this.queueDiceInput) this.queueDiceInput.value = "";
    this.queueDiceModal.classList.remove("hidden");
  }

  /**
   * Hide the queued dice modal.
   */
  closeQueueDiceModal() {
    if (this.queueDiceModal) this.queueDiceModal.classList.add("hidden");
  }

  /**
   * Return trimmed lines from the queue dice textarea.
   */
  getQueuedDiceLines() {
    if (!this.queueDiceInput) return [];
    return this.queueDiceInput.value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }

  /**
   * Display the current player's label.
   */
  setCurrentPlayerLabel(text) {
    this.lblCurrentPlayer.textContent = text;
  }

  /**
   * Show dice roll values and sum; display placeholders when null.
   */
  setDiceText({ d1, d2, sum }) {
    if (sum == null) {
      this.lblDice.textContent = "–";
      this.lblDiceSum.textContent = "–";
      return;
    }
    if (d2 == null) {
      this.lblDice.textContent = `${d1}`;
    } else {
      this.lblDice.textContent = `${d1} + ${d2}`;
    }
    this.lblDiceSum.textContent = String(sum);
  }

  /**
   * Update the status line beneath dice controls.
   */
  setTurnStatus(text) {
    this.lblTurnStatus.textContent = text;
  }

  /**
   * Control visibility and enabled state of roll buttons for the human player.
   */
  setRollButtonsVisibility({ canRoll1, enableRollButtons }) {
    this.btnRoll1.style.display = canRoll1 ? "inline-block" : "none";
    this.btnRoll1.disabled = !enableRollButtons;
    this.btnRoll2.disabled = !enableRollButtons;
    if (this.btnRollManual) {
      this.btnRollManual.disabled = !enableRollButtons;
    }
  }

  /**
   * Remove all log entries.
   */
  clearLog() {
    this.logEl.innerHTML = "";
  }

  /**
   * Append a formatted line to the scrolling log.
   */
  appendLog(line) {
    const p = document.createElement("p");
    if (line.startsWith("[")) {
      const closing = line.indexOf("]");
      if (closing > 0) {
        const tsText = line.slice(1, closing);
        const msgText = line.slice(closing + 1).trim();
        const tsSpan = document.createElement("span");
        tsSpan.classList.add("log-ts");
        tsSpan.textContent = tsText;
        const msgSpan = document.createElement("span");
        msgSpan.classList.add("log-msg");
        msgSpan.textContent = msgText ? ` ${msgText}` : "";
        p.appendChild(tsSpan);
        p.appendChild(msgSpan);
      } else {
        p.textContent = line;
      }
    } else {
      p.textContent = line;
    }
    this.logEl.appendChild(p);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  /**
   * Render both boards, applying advantage styling when present.
   */
  renderBoards(round, { humanAdvantage = null, computerAdvantage = null } = {}) {
    this._renderBoard(round.human.board, this.boardHuman, humanAdvantage);
    this._renderBoard(round.computer.board, this.boardComputer, computerAdvantage);
  }

  _renderBoard(board, container, advantageSquare) {
    container.innerHTML = "";
    const size = board.size;
    for (let i = 1; i <= size; i++) {
      const btn = document.createElement("div");
      btn.classList.add("square");
      const covered = board.isCovered(i);
      btn.textContent = covered ? "_" : String(i);
      if (covered) {
        btn.classList.add("covered");
      }
      if (advantageSquare && i === advantageSquare) {
        btn.classList.add("advantage");
      }
      container.appendChild(btn);
    }
  }

  /**
   * Configure and display the move modal for the current roll and options.
   */
  openMoveModal(diceSum, coverOptions, uncoverOptions) {
    this.modalDiceSum.textContent = String(diceSum);
    this.modalHelpText.textContent = "";

    this.modalMoveCover.disabled = coverOptions.length === 0;
    this.modalMoveUncover.disabled = uncoverOptions.length === 0;

    let defaultType;
    if (coverOptions.length > 0) defaultType = "cover";
    else defaultType = "uncover";

    if (defaultType === "cover") {
      this.modalMoveCover.checked = true;
      this.modalMoveUncover.checked = false;
      this._fillOptionsSelect(coverOptions);
    } else {
      this.modalMoveCover.checked = false;
      this.modalMoveUncover.checked = true;
      this._fillOptionsSelect(uncoverOptions);
    }

    this.moveModal.classList.remove("hidden");
  }

  /**
   * Hide the move modal.
   */
  closeMoveModal() {
    this.moveModal.classList.add("hidden");
  }

  /**
   * Refresh the options list after toggling cover/uncover radios.
   */
  updateMoveModalOptions(moveType, options) {
    this._fillOptionsSelect(options);
  }

  /**
   * Programmatically select a move type and option inside the modal.
   */
  setMoveSelection(moveType, options, squares) {
    if (moveType === "cover") {
      this.modalMoveCover.checked = true;
      this.modalMoveUncover.checked = false;
    } else {
      this.modalMoveCover.checked = false;
      this.modalMoveUncover.checked = true;
    }

    this._fillOptionsSelect(options);

    const target = [...(squares || [])].sort((a, b) => a - b);
    let matchIndex = 0;
    options.forEach((opt, idx) => {
      const sorted = [...opt].sort((a, b) => a - b);
      if (sorted.length === target.length && sorted.every((v, i) => v === target[i])) {
        matchIndex = idx;
      }
    });
    this.modalMoveOptions.value = String(matchIndex);
  }

  /**
   * Internal helper to fill the combo dropdown.
   */
  _fillOptionsSelect(options) {
    this.modalMoveOptions.innerHTML = "";
    options.forEach((combo, idx) => {
      const opt = document.createElement("option");
      opt.value = String(idx);
      opt.textContent = combo.join(" + ");
      this.modalMoveOptions.appendChild(opt);
    });
  }

  /**
   * Read the current user selection from the move modal.
   */
  getMoveModalSelection(coverOptions, uncoverOptions) {
    const type = this.modalMoveCover.checked ? "cover" : "uncover";
    const idx = Number(this.modalMoveOptions.value);
    const options = type === "cover" ? coverOptions : uncoverOptions;
    if (!options[idx]) return null;
    return {
      moveType: type,
      squares: [...options[idx]],
    };
  }

  /**
   * Show helper copy beneath the move modal selector.
   */
  setMoveHelpText(text) {
    this.modalHelpText.textContent = text || "";
  }

  /**
   * Wire up manual dice buttons to behave like toggle selectors.
   */
  initManualDiceListeners() {
    if (!this.manualDieButtons || this.manualDieButtons.length === 0) return;

    this.manualDieButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dieIndex = btn.getAttribute("data-die");
        this.manualDieButtons.forEach((b) => {
          if (b.getAttribute("data-die") === dieIndex) {
            b.classList.remove("selected");
          }
        });
        btn.classList.add("selected");
      });
    });

    if (this.manualDiceCountRadios && this.manualDiceRows) {
      this.manualDiceCountRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
          const count = Number(
            document.querySelector('input[name="manual-dice-count"]:checked')
              ?.value || 1
          );
          this.manualDiceRows.forEach((row) => {
            const dieIndex = row.getAttribute("data-die");
            if (dieIndex === "2") {
              row.style.display = count === 2 ? "flex" : "none";
            }
          });
        });
      });
    }
  }

  /**
   * Reset and display the manual dice modal with current die count selection.
   */
  openManualDiceModal() {
    if (!this.manualDiceModal) return;

    if (this.manualDiceCountRadios && this.manualDiceCountRadios.length > 0) {
      const alreadyChecked = Array.from(this.manualDiceCountRadios).some(
        (r) => r.checked
      );
      if (!alreadyChecked) {
        this.manualDiceCountRadios.forEach((r) => {
          r.checked = r.value === "1";
        });
      }
    }

    if (this.manualDieButtons) {
      this.manualDieButtons.forEach((btn) => btn.classList.remove("selected"));
    }

    if (this.manualDiceRows) {
      const count = Number(
        document.querySelector('input[name="manual-dice-count"]:checked')
          ?.value || 1
      );
      this.manualDiceRows.forEach((row) => {
        const dieIndex = row.getAttribute("data-die");
        if (dieIndex === "2") {
          row.style.display = count === 2 ? "flex" : "none";
        } else {
          row.style.display = "flex";
        }
      });
    }

    this.setManualDiceHelp("");
    this.manualDiceModal.classList.remove("hidden");
  }

  /**
   * Hide the manual dice modal.
   */
  closeManualDiceModal() {
    if (!this.manualDiceModal) return;
    this.manualDiceModal.classList.add("hidden");
  }

  /**
   * Show validation/help text inside the manual dice modal.
   */
  setManualDiceHelp(text) {
    if (this.manualDiceHelp) {
      this.manualDiceHelp.textContent = text || "";
    }
  }

  /**
   * Read selected dice values and count from the modal; null if incomplete.
   */
  getManualDiceSelection() {
    if (!this.manualDiceCountRadios) return null;

    const count = Number(
      document.querySelector('input[name="manual-dice-count"]:checked')?.value ||
        1
    );

    const values = [];

    const readDie = (dieIndex) => {
      let selectedValue = null;
      this.manualDieButtons.forEach((btn) => {
        if (
          btn.getAttribute("data-die") === String(dieIndex) &&
          btn.classList.contains("selected")
        ) {
          selectedValue = Number(btn.getAttribute("data-value"));
        }
      });
      return selectedValue;
    };

    const v1 = readDie(1);
    if (!Number.isInteger(v1)) {
      return null;
    }
    values.push(v1);

    if (count === 2) {
      const v2 = readDie(2);
      if (!Number.isInteger(v2)) {
        return null;
      }
      values.push(v2);
    }

    return {
      numDice: count === 2 ? 2 : 1,
      values,
    };
  }

  /**
   * Pre-select number of dice (1 or 2) and adjust visibility of rows.
   */
  setManualDiceCount(count) {
    if (!this.manualDiceCountRadios) return;
    this.manualDiceCountRadios.forEach((r) => {
      r.checked = Number(r.value) === count;
    });
    if (this.manualDiceRows) {
      this.manualDiceRows.forEach((row) => {
        const dieIndex = row.getAttribute("data-die");
        if (dieIndex === "2") {
          row.style.display = count === 2 ? "flex" : "none";
        }
      });
    }
  }


  /**
   * Render round summary and tournament totals on the end screen.
   */
  setEndScreen({
    roundWinnerId,
    winType,
    roundScore,
    humanScore,
    computerScore,
    advantageForNext,
  }) {
    let winnerText;
    if (!roundWinnerId) winnerText = "No winner (error?)";
    else if (roundWinnerId === "HUMAN") winnerText = "Human";
    else if (roundWinnerId === "COMPUTER") winnerText = "Computer";
    else winnerText = roundWinnerId;

    this.lblRoundWinner.textContent = winnerText;
    this.lblRoundWinType.textContent = winType || "–";
    this.lblRoundScore.textContent = String(roundScore ?? 0);
    this.lblFinalHumanScore.textContent = String(humanScore ?? 0);
    this.lblFinalComputerScore.textContent = String(computerScore ?? 0);

    this.lblRoundResult.textContent = `Round winner: ${winnerText} | Win type: ${winType} | Round score: ${roundScore}`;

    if (!advantageForNext) {
      this.lblFinalAdvantage.textContent = "None";
    } else {
      const who = advantageForNext.playerId === "HUMAN" ? "Human" : "Computer";
      this.lblFinalAdvantage.textContent = `${who} gets advantage square ${advantageForNext.digitSum}`;
    }
  }
}
