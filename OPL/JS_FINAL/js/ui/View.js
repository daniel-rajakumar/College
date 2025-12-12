// js/ui/View.js

export class View {
  constructor() {
    // Screens
    this.screens = {
      welcome: document.getElementById("screen-welcome"),
      setup: document.getElementById("screen-setup"),
      game: document.getElementById("screen-game"),
      end: document.getElementById("screen-end"),
    };

    // Setup screen
    this.rolloffResultEl = document.getElementById("rolloff-result");
    this.btnStartRound = document.getElementById("btn-start-round");

    // Game header
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

    this.logEl = document.getElementById("log");

    this.btnRollManual = document.getElementById("btn-roll-manual");

// Manual dice modal
this.manualDiceModal = document.getElementById("manual-dice-modal");
this.manualDiceHelp = document.getElementById("manual-dice-help");
this.manualDiceConfirm = document.getElementById("manual-dice-confirm");
this.manualDiceCancel = document.getElementById("manual-dice-cancel");
this.manualDiceCountRadios = document.querySelectorAll(
  'input[name="manual-dice-count"]'
);
this.manualDiceRows = document.querySelectorAll(".manual-dice-row");
this.manualDieButtons = document.querySelectorAll(".manual-die");


    this.btnRoll1 = document.getElementById("btn-roll-1");
    this.btnRoll2 = document.getElementById("btn-roll-2");

    // Move modal elements
    this.moveModal = document.getElementById("move-modal");
    this.modalDiceSum = document.getElementById("modal-dice-sum");
    this.modalMoveCover = document.getElementById("modal-move-cover");
    this.modalMoveUncover = document.getElementById("modal-move-uncover");
    this.modalMoveOptions = document.getElementById("modal-move-options");
    this.modalHelpText = document.getElementById("modal-help-text");

    // End screen
    this.lblRoundResult = document.getElementById("lbl-round-result");
    this.lblRoundWinner = document.getElementById("lbl-round-winner");
    this.lblRoundWinType = document.getElementById("lbl-round-win-type");
    this.lblRoundScore = document.getElementById("lbl-round-score");
    this.lblFinalHumanScore = document.getElementById("lbl-final-human-score");
    this.lblFinalComputerScore = document.getElementById("lbl-final-computer-score");
    this.lblFinalAdvantage = document.getElementById("lbl-final-advantage");
  }

  showScreen(name) {
    Object.entries(this.screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
  }

  // ----- SETUP -----

  setRolloffText(text, canStart) {
    this.rolloffResultEl.textContent = text;
    this.btnStartRound.disabled = !canStart;
  }

  // ----- GAME HEADER / STATE -----

  setRoundHeader({ roundNumber, modeLabel, firstPlayerLabel, advantageText }) {
    this.lblRoundNumber.textContent = roundNumber;
    this.lblMode.textContent = modeLabel;
    this.lblFirstPlayer.textContent = firstPlayerLabel;
    this.lblAdvantage.textContent = advantageText || "";
  }

  setScores(humanScore, computerScore) {
    this.scoreHuman.textContent = humanScore;
    this.scoreComputer.textContent = computerScore;
  }

  setCurrentPlayerLabel(text) {
    this.lblCurrentPlayer.textContent = text;
  }

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

  setTurnStatus(text) {
    this.lblTurnStatus.textContent = text;
  }

  /**
   * Show/hide roll buttons for the human player.
   * - canRoll1: boolean (Roll 1 Die visible only when allowed).
   * Roll 2 button remains visible for human turns.
   */
  setRollButtonsVisibility({ canRoll1, enableRollButtons }) {
  // 1-die button visible only when allowed
  this.btnRoll1.style.display = canRoll1 ? "inline-block" : "none";
  this.btnRoll1.disabled = !enableRollButtons;

  // 2-dice always visible when it's a human-controlled turn, but disabled when not allowed
  this.btnRoll2.disabled = !enableRollButtons;

  // Manual button uses same enable flag; always visible
  if (this.btnRollManual) {
    this.btnRollManual.disabled = !enableRollButtons;
  }
}

  clearLog() {
    this.logEl.innerHTML = "";
  }

  appendLog(line) {
    const p = document.createElement("p");
    p.textContent = line;
    this.logEl.appendChild(p);
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  /**
   * Render both boards.
   * Pure display of covered/uncovered numbers.
   */
  renderBoards(round) {
    this._renderBoard(round.human.board, this.boardHuman);
    this._renderBoard(round.computer.board, this.boardComputer);
  }

  _renderBoard(board, container) {
    container.innerHTML = "";
    const size = board.size;
    for (let i = 1; i <= size; i++) {
      const btn = document.createElement("div");
      btn.classList.add("square");
      btn.textContent = String(i);
      if (board.isCovered(i)) {
        btn.classList.add("covered");
      }
      container.appendChild(btn);
    }
  }

  // ----- MOVE MODAL -----

  /**
   * Configure and show move modal.
   * @param {number} diceSum
   * @param {number[][]} coverOptions
   * @param {number[][]} uncoverOptions
   */
  openMoveModal(diceSum, coverOptions, uncoverOptions) {
    this.modalDiceSum.textContent = String(diceSum);
    this.modalHelpText.textContent = "";

    // enable/disable move-type radios based on available options
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

  closeMoveModal() {
    this.moveModal.classList.add("hidden");
  }

  /**
   * Update options when user switches Cover/Uncover radio.
   */
  updateMoveModalOptions(moveType, options) {
    this._fillOptionsSelect(options);
  }

  /**
   * Programmatically select move type and option in the modal.
   * @param {"cover"|"uncover"} moveType
   * @param {number[][]} options
   * @param {number[]} squares
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

    // pick the option matching the suggested squares (order-insensitive)
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
   * Read current selection from modal.
   * @param {number[][]} coverOptions
   * @param {number[][]} uncoverOptions
   * @returns {{ moveType: "cover"|"uncover", squares: number[] } | null}
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

  setMoveHelpText(text) {
    this.modalHelpText.textContent = text || "";
  }

    // ----- MANUAL DICE MODAL -----

  initManualDiceListeners() {
    // Called once by controller to wire basic behavior (hide/show 2nd row & select buttons)
    if (!this.manualDieButtons || this.manualDieButtons.length === 0) return;

    // Toggle selected state when clicking a die
    this.manualDieButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dieIndex = btn.getAttribute("data-die");
        // Clear previous selection for this die
        this.manualDieButtons.forEach((b) => {
          if (b.getAttribute("data-die") === dieIndex) {
            b.classList.remove("selected");
          }
        });
        btn.classList.add("selected");
      });
    });

    // Handle 1 vs 2 dice (show/hide die 2 row)
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

  openManualDiceModal() {
    if (!this.manualDiceModal) return;

    // Default to 1 die
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

    // Clear previous selections
    if (this.manualDieButtons) {
      this.manualDieButtons.forEach((btn) => btn.classList.remove("selected"));
    }

    // Hide die2 row by default
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

  closeManualDiceModal() {
    if (!this.manualDiceModal) return;
    this.manualDiceModal.classList.add("hidden");
  }

  setManualDiceHelp(text) {
    if (this.manualDiceHelp) {
      this.manualDiceHelp.textContent = text || "";
    }
  }

  /**
   * @returns {{ numDice: 1|2, values: number[] } | null}
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
   * Helper to pre-select number of dice (1 or 2) before opening modal.
   */
  setManualDiceCount(count) {
    if (!this.manualDiceCountRadios) return;
    this.manualDiceCountRadios.forEach((r) => {
      r.checked = Number(r.value) === count;
    });
    // trigger show/hide for die 2 row
    if (this.manualDiceRows) {
      this.manualDiceRows.forEach((row) => {
        const dieIndex = row.getAttribute("data-die");
        if (dieIndex === "2") {
          row.style.display = count === 2 ? "flex" : "none";
        }
      });
    }
  }


  // ----- END SCREEN -----

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


  // ui/View.js (inside export class View { ... })
}
