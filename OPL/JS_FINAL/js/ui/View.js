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

    // Game screen references
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
    this.lblSelectedSquares = document.getElementById("lbl-selected-squares");
    this.lblTurnStatus = document.getElementById("lbl-turn-status");

    this.logEl = document.getElementById("log");

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

  // ----- GAME -----

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

  setSelectedSquares(squares) {
    this.lblSelectedSquares.textContent = `[${squares.join(", ")}]`;
  }

  setTurnStatus(text) {
    this.lblTurnStatus.textContent = text;
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
   * @param {GameRound} round
   * @param {Object} opts
   *   - selectedSquares: number[]
   *   - selectionOwner: "HUMAN" | "COMPUTER" | null
   *   - enabledPlayerId: "HUMAN" | "COMPUTER" | null
   */
  renderBoards(round, opts = {}) {
    const {
      selectedSquares = [],
      selectionOwner = null,
      enabledPlayerId = null,
    } = opts;

    this._renderBoard(
      round.human.board,
      this.boardHuman,
      "HUMAN",
      selectedSquares,
      selectionOwner,
      enabledPlayerId
    );
    this._renderBoard(
      round.computer.board,
      this.boardComputer,
      "COMPUTER",
      selectedSquares,
      selectionOwner,
      enabledPlayerId
    );
  }

  _renderBoard(board, container, playerId, selectedSquares, selectionOwner, enabledPlayerId) {
    container.innerHTML = "";
    const size = board.size;
    for (let i = 1; i <= size; i++) {
      const btn = document.createElement("button");
      btn.classList.add("square");
      btn.dataset.player = playerId;
      btn.dataset.number = String(i);
      btn.textContent = String(i);

      if (board.isCovered(i)) {
        btn.classList.add("covered");
      }

      if (selectionOwner === playerId && selectedSquares.includes(i)) {
        btn.classList.add("selected");
      }

      if (enabledPlayerId !== playerId) {
        btn.classList.add("disabled");
      }

      container.appendChild(btn);
    }
  }

  // ----- ROUND SUMMARY -----

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

    let summary = `Round winner: ${winnerText} | Win type: ${winType} | Round score: ${roundScore}`;
    this.lblRoundResult.textContent = summary;

    if (!advantageForNext) {
      this.lblFinalAdvantage.textContent = "None";
    } else {
      const who = advantageForNext.playerId === "HUMAN" ? "Human" : "Computer";
      this.lblFinalAdvantage.textContent = `${who} gets advantage square ${advantageForNext.digitSum}`;
    }
  }
}
