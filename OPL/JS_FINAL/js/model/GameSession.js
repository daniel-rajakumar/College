// js/model/GameSession.js
import { Tournament } from "./Tournament.js";
import { Dice } from "./Dice.js";
import { Serializer } from "./Serializer.js";

export class GameSession {
  constructor() {
    this.tournament = null;
    this.dice = null;
    this.currentRound = null;

    this.gameMode = "HvsC"; // "HvsC" | "HvsH" | "CvsC"
    this.currentPlayerId = "HUMAN"; // "HUMAN" | "COMPUTER"
    this.phase = "idle"; // "idle" | "awaitingRoll" | "awaitingMove" | "roundOver"

    this.currentDice = { d1: null, d2: null, sum: null };
  }

  /* ---------- CORE SETUP ---------- */

  resetTournament() {
    this.tournament = new Tournament("Human", "Computer");
    this.dice = new Dice();
    this.currentRound = null;
    this.currentPlayerId = "HUMAN";
    this.phase = "idle";
    this.currentDice = { d1: null, d2: null, sum: null };
  }

  setMode(mode) {
    this.gameMode = mode;
  }

  getModeLabel() {
    if (this.gameMode === "HvsC") return "Human vs Computer";
    if (this.gameMode === "HvsH") return "Human vs Human";
    if (this.gameMode === "CvsC") return "Computer vs Computer";
    return this.gameMode;
  }

  isPlayerHumanControlled(playerId) {
    if (this.gameMode === "HvsC") {
      return playerId === "HUMAN";
    }
    if (this.gameMode === "HvsH") {
      return true;
    }
    if (this.gameMode === "CvsC") {
      return false;
    }
    return true;
  }

  getCurrentPlayerLabel() {
    return this.currentPlayerId === "HUMAN" ? "Human" : "Computer";
  }

  getCurrentDice() {
    return { ...this.currentDice };
  }

  getCurrentRound() {
    return this.currentRound;
  }

  getScores() {
    if (!this.tournament) {
      return { humanScore: 0, computerScore: 0 };
    }
    return {
      humanScore: this.tournament.human.totalScore,
      computerScore: this.tournament.computer.totalScore,
    };
  }

  getTournamentResult() {
    return this.tournament ? this.tournament.getTournamentResult() : {
      winnerId: "DRAW",
      humanScore: 0,
      computerScore: 0,
    };
  }

  /* ---------- ROLLOFF / START ROUND ---------- */

  rollOff(boardSize) {
    if (!this.tournament || !this.dice) {
      this.resetTournament();
    }

    const humanRoll = this.dice.rollRandom(2);
    const compRoll = this.dice.rollRandom(2);

    const hr = humanRoll.sum;
    const cr = compRoll.sum;

    let text = `Human rolled ${humanRoll.d1} + ${humanRoll.d2} = ${hr}. `;
    text += `Computer rolled ${compRoll.d1} + ${compRoll.d2} = ${cr}. `;

    let firstPlayerId = "";
    let canStart = false;

    if (hr > cr) {
      text += "Human goes first.";
      firstPlayerId = "HUMAN";
      canStart = true;
    } else if (cr > hr) {
      text += "Computer goes first.";
      firstPlayerId = "COMPUTER";
      canStart = true;
    } else {
      text += "It's a tie. Roll again.";
      firstPlayerId = "";
      canStart = false;
    }

    return {
      humanRoll,
      compRoll,
      firstPlayerId,
      text,
      canStart,
    };
  }

  startNewRound(boardSize, firstPlayerId) {
    if (!this.tournament || !this.dice) {
      this.resetTournament();
    }

    this.currentRound = this.tournament.startNewRound(boardSize, firstPlayerId);
    this.currentPlayerId = this.currentRound.currentPlayerId;
    this.phase = "awaitingRoll";
    this.currentDice = { d1: null, d2: null, sum: null };

    const advantageText = this.tournament.nextRoundAdvantage
      ? `Advantage: ${
          this.tournament.nextRoundAdvantage.playerId === "HUMAN"
            ? "Human"
            : "Computer"
        } has square ${this.tournament.nextRoundAdvantage.digitSum} pre-covered.`
      : "";

    return {
      header: {
        roundNumber: this.tournament.roundNumber,
        modeLabel: this.getModeLabel(),
        firstPlayerLabel: firstPlayerId === "HUMAN" ? "Human" : "Computer",
        advantageText,
      },
      scores: this.getScores(),
    };
  }

  /* ---------- ROLL BUTTON STATE ---------- */

  /**
   * Pure game-rule info for the controller/View.
   * - canRoll1: whether "Roll 1 Die" should be visible.
   * - enableRollButtons: whether roll buttons should be enabled.
   */
  getRollButtonState() {
    if (
      !this.currentRound ||
      this.phase !== "awaitingRoll" ||
      !this.isPlayerHumanControlled(this.currentPlayerId)
    ) {
      return { canRoll1: false, enableRollButtons: false };
    }

    const player = this.currentRound.getPlayerById(this.currentPlayerId);
    const board = player.board;

    const canRoll1 = board.canUseOneDie();
    return {
      canRoll1,
      enableRollButtons: true,
    };
  }

  /* ---------- HUMAN ROLL / MOVE ---------- */

  handleHumanRoll(numDice) {
    if (!this.currentRound) {
      return { error: "No active round." };
    }
    if (this.phase !== "awaitingRoll") {
      return { error: "You cannot roll dice right now." };
    }
    if (!this.isPlayerHumanControlled(this.currentPlayerId)) {
      return { error: "It is not a human-controlled player's turn." };
    }
    if (numDice !== 1 && numDice !== 2) {
      return { error: "You must roll 1 or 2 dice." };
    }

    const player = this.currentRound.getPlayerById(this.currentPlayerId);
    const board = player.board;

    if (numDice === 1 && !board.canUseOneDie()) {
      return {
        error: "You may roll ONE die only if squares 7..n are ALL covered.",
      };
    }

    const roll = this.dice.rollRandom(numDice);
    this.currentDice = roll;

    const coverOptions = this.currentRound.getCoverOptions(
      this.currentPlayerId,
      roll.sum
    );
    const uncoverOptions = this.currentRound.getUncoverOptions(
      this.currentPlayerId,
      roll.sum
    );

    if (coverOptions.length === 0 && uncoverOptions.length === 0) {
      // No moves → controller will immediately end the turn.
      return {
        roll,
        coverOptions,
        uncoverOptions,
        canMove: false,
      };
    }

    // We now require a move selection via modal.
    this.phase = "awaitingMove";

    return {
      roll,
      coverOptions,
      uncoverOptions,
      canMove: true,
    };
  }

  /**
   * Apply a human-selected move.
   * @param {"cover"|"uncover"} moveType
   * @param {number[]} squares
   */
  applyHumanMove(moveType, squares) {
    if (!this.currentRound) {
      return { error: "No active round." };
    }
    if (this.phase !== "awaitingMove") {
      return { error: "Not expecting a move selection right now." };
    }
    if (!this.currentDice.sum) {
      return { error: "No active dice roll." };
    }

    const sum = this.currentDice.sum;
    const options =
      moveType === "cover"
        ? this.currentRound.getCoverOptions(this.currentPlayerId, sum)
        : this.currentRound.getUncoverOptions(this.currentPlayerId, sum);

    const sortedSel = [...squares].sort((a, b) => a - b);
    const exists = options.some((combo) => {
      const s = [...combo].sort((a, b) => a - b);
      if (s.length !== sortedSel.length) return false;
      return s.every((v, i) => v === sortedSel[i]);
    });

    if (!exists) {
      return {
        error:
          "Selected combination is no longer valid based on current board.",
      };
    }

    // Apply move
    if (moveType === "cover") {
      this.currentRound.applyCoverMove(this.currentPlayerId, squares);
    } else {
      this.currentRound.applyUncoverMove(this.currentPlayerId, squares);
    }

    // Check for end-of-round
    if (this.currentRound.roundOver) {
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();

      return {
        roundOver: true,
        summary: this._buildRoundSummary(),
      };
    }

    // Same player rolls again
    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    return {
      roundOver: false,
    };
  }

  /**
   * End current player's turn when no move is made (no options, or Cancel).
   */
  endTurn() {
    if (!this.currentRound) {
      return { error: "No active round." };
    }

    this.currentRound.notifyTurnEnded(this.currentPlayerId);

    if (this.currentRound.roundOver) {
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();
      return {
        roundOver: true,
        summary: this._buildRoundSummary(),
      };
    }

    this.currentRound.switchTurn();
    this.currentPlayerId = this.currentRound.currentPlayerId;

    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    return {
      roundOver: false,
      currentPlayerId: this.currentPlayerId,
    };
  }

  getHelpSuggestion() {
    if (!this.currentRound || !this.currentDice.sum) return null;
    const ai = this.tournament.computer;
    return ai.getHelpSuggestion(
      this.currentRound,
      this.currentPlayerId,
      this.currentDice.sum
    );
  }

  /* ---------- COMPUTER TURNS ---------- */

  /**
   * Let the computer play until:
   *  - It's a human-controlled player's turn, or
   *  - Round ends.
   *
   * Returns info for logs + next turn status.
   */
  runComputerUntilHumanOrRoundEnd() {
    const logs = [];
    let autoPlayed = false;

    if (!this.currentRound) {
      return { autoPlayed: false, logs, roundOver: false };
    }

    while (
      !this.currentRound.roundOver &&
      !this.isPlayerHumanControlled(this.currentPlayerId)
    ) {
      autoPlayed = true;
      const ai = this.tournament.computer;
      const player = this.currentRound.getPlayerById(this.currentPlayerId);
      const board = player.board;

      const numDice = ai.chooseNumDice(board);
      const roll = this.dice.rollRandom(numDice);
      this.currentDice = roll;

      const activeName =
        this.currentPlayerId === "HUMAN" ? "Human" : "Computer";

      if (roll.d2 == null) {
        logs.push(
          `${activeName} (AUTO) rolled ${roll.d1} (sum = ${roll.sum})`
        );
      } else {
        logs.push(
          `${activeName} (AUTO) rolled ${roll.d1} + ${roll.d2} (sum = ${roll.sum})`
        );
      }

      const decision = ai.decideMove(this.currentRound, this.currentPlayerId, roll.sum);

      logs.push(
        `${activeName} decision: action=${decision.action}, squares=[${decision.squares.join(
          ", "
        )}]. Reason: ${decision.reason}`
      );

      if (decision.action === "none") {
        logs.push("No moves available. Turn ends.");
        this.currentRound.notifyTurnEnded(this.currentPlayerId);
        if (!this.currentRound.roundOver) {
          this.currentRound.switchTurn();
          this.currentPlayerId = this.currentRound.currentPlayerId;
          this.currentDice = { d1: null, d2: null, sum: null };
          this.phase = "awaitingRoll";
        }
        break;
      }

      if (decision.action === "cover") {
        this.currentRound.applyCoverMove(this.currentPlayerId, decision.squares);
        logs.push(
          `${activeName} covers squares [${decision.squares.join(", ")}]`
        );
      } else if (decision.action === "uncover") {
        this.currentRound.applyUncoverMove(
          this.currentPlayerId,
          decision.squares
        );
        logs.push(
          `${activeName} uncovers opponent squares [${decision.squares.join(
            ", "
          )}]`
        );
      }

      if (this.currentRound.roundOver) {
        this.currentRound.notifyTurnEnded(this.currentPlayerId);
        break;
      }
    }

    const scores = this.getScores();

    if (this.currentRound.roundOver) {
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();
      const summary = this._buildRoundSummary();
      logs.push("=== ROUND OVER ===");
      logs.push(
        `Winner: ${summary.roundWinnerId}, type=${summary.winType}, roundScore=${summary.roundScore}`
      );
      return {
        autoPlayed,
        logs,
        roundOver: true,
        scores,
        summary,
        turnStatus: "Round finished.",
      };
    }

    this.phase = "awaitingRoll";
    this.currentDice = { d1: null, d2: null, sum: null };

    return {
      autoPlayed,
      logs,
      roundOver: false,
      scores,
      turnStatus: "New turn. Awaiting roll…",
    };
  }

  /* ---------- SNAPSHOT LOADING ---------- */

  /**
   * Load a saved snapshot from a .txt file (text contents).
   * Returns initial UI state needed by the controller/View.
   */
  loadSnapshotFromText(text) {
    if (!this.tournament || !this.dice) {
      this.resetTournament();
    }

    const snapshot = Serializer.parseSnapshot(text);

    // Force classic HvsC mode for old saves
    this.gameMode = "HvsC";

    const boardSize = snapshot.humanSquares.length;

    // Start a new round with the snapshot's first player
    this.currentRound = this.tournament.startNewRound(
      boardSize,
      snapshot.firstTurnId
    );

    // Override total scores
    this.tournament.human.totalScore = snapshot.humanScore;
    this.tournament.computer.totalScore = snapshot.computerScore;

    // Restore board states
    this.currentRound.human.board.loadFromNumberArrayFormat(
      snapshot.humanSquares
    );
    this.currentRound.computer.board.loadFromNumberArrayFormat(
      snapshot.computerSquares
    );

    // Next turn
    this.currentRound.currentPlayerId = snapshot.nextTurnId;
    this.currentPlayerId = snapshot.nextTurnId;

    // Reset round flags
    this.currentRound.roundOver = false;
    this.currentRound.roundWinnerId = null;
    this.currentRound.winType = null;
    this.currentRound.roundScore = 0;

    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    const header = {
      roundNumber: this.tournament.roundNumber,
      modeLabel: this.getModeLabel(),
      firstPlayerLabel:
        snapshot.firstTurnId === "HUMAN" ? "Human" : "Computer",
      advantageText: "",
    };

    const scores = this.getScores();

    return {
      header,
      scores,
      logLines: ["Game loaded from saved .txt file."],
      turnStatus: `Loaded game. Next turn: ${
        this.currentPlayerId === "HUMAN" ? "Human" : "Computer"
      }. Roll to continue.`,
    };
  }

  /* ---------- INTERNAL HELPERS ---------- */

  _buildRoundSummary() {
    const summary = {
      roundWinnerId: this.currentRound.roundWinnerId,
      winType: this.currentRound.winType,
      roundScore: this.currentRound.roundScore,
      humanScore: this.tournament.human.totalScore,
      computerScore: this.tournament.computer.totalScore,
      advantageForNext: this.tournament.nextRoundAdvantage,
    };

    let winnerText;
    if (!summary.roundWinnerId) winnerText = "None";
    else if (summary.roundWinnerId === "HUMAN") winnerText = "Human";
    else if (summary.roundWinnerId === "COMPUTER") winnerText = "Computer";
    else winnerText = summary.roundWinnerId;

    summary.roundResultText = `Round winner: ${winnerText} | Win type: ${summary.winType} | Round score: ${summary.roundScore}`;

    return summary;
  }


    /**
   * Manual dice input for the current (human-controlled) player.
   * @param {number} numDice 1 or 2
   * @param {number[]} values [d1] or [d1, d2]
   */
  handleManualRoll(numDice, values) {
    if (!this.currentRound) {
      return { error: "No active round." };
    }
    if (this.phase !== "awaitingRoll") {
      return { error: "You cannot roll dice right now." };
    }
    // Only allow manual dice for human-controlled players (in HvsH, both sides)
    if (!this.isPlayerHumanControlled(this.currentPlayerId)) {
      return { error: "Manual dice input is only allowed for human-controlled players." };
    }
    if (numDice !== 1 && numDice !== 2) {
      return { error: "You must use 1 or 2 dice." };
    }
    if (!Array.isArray(values) || values.length < numDice) {
      return { error: "Please select enough dice values." };
    }

    const validDie = (v) =>
      Number.isInteger(v) && v >= 1 && v <= 6;

    const d1 = values[0];
    const d2 = numDice === 2 ? values[1] : null;

    if (!validDie(d1) || (numDice === 2 && !validDie(d2))) {
      return { error: "Dice values must be between 1 and 6." };
    }

    // 1-die rule (7..n covered)
    const player = this.currentRound.getPlayerById(this.currentPlayerId);
    const board = player.board;
    if (numDice === 1 && !board.canUseOneDie()) {
      return {
        error: "You may roll ONE die only if squares 7..n are ALL covered.",
      };
    }

    const sum = d1 + (d2 ?? 0);
    this.currentDice = { d1, d2, sum };

    const coverOptions = this.currentRound.getCoverOptions(
      this.currentPlayerId,
      sum
    );
    const uncoverOptions = this.currentRound.getUncoverOptions(
      this.currentPlayerId,
      sum
    );

    if (coverOptions.length === 0 && uncoverOptions.length === 0) {
      // No moves -> controller should endTurn() just like random roll
      return {
        roll: this.currentDice,
        coverOptions,
        uncoverOptions,
        canMove: false,
      };
    }

    this.phase = "awaitingMove";

    return {
      roll: this.currentDice,
      coverOptions,
      uncoverOptions,
      canMove: true,
    };
  }

}
