// js/model/GameSession.js
import { Tournament } from "./Tournament.js";
import { Dice } from "./Dice.js";
import { Serializer } from "./Serializer.js";
import { GameRound } from "./GameRound.js";

export class GameSession {
  constructor() {
    this.tournament = null;
    this.dice = null;
    this.currentRound = null;
    this.history = [];
    this.queuedRolls = [];

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
    this.history = [];
    this.queuedRolls = [];
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

  getPlayerDisplayName(playerId) {
    if (this.gameMode === "HvsH") {
      return playerId === "HUMAN" ? "Player 1 (Human)" : "Player 2 (Human)";
    }
    if (this.gameMode === "CvsC") {
      return playerId === "HUMAN" ? "Player 1 (Computer)" : "Player 2 (Computer)";
    }
    return playerId === "HUMAN" ? "Human" : "Computer";
  }

  getCurrentPlayerLabel() {
    return this.getPlayerDisplayName(this.currentPlayerId);
  }

  getCurrentDice() {
    return { ...this.currentDice };
  }

  getCurrentRound() {
    return this.currentRound;
  }

  getCurrentPlayerId() {
    return this.currentPlayerId;
  }

  getPhase() {
    return this.phase;
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
    return this.tournament
      ? this.tournament.getTournamentResult()
      : {
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

    const humanName = this.getPlayerDisplayName("HUMAN");
    const compName = this.getPlayerDisplayName("COMPUTER");

    let text = `${humanName} rolled ${humanRoll.d1} + ${humanRoll.d2} = ${hr}. `;
    text += `${compName} rolled ${compRoll.d1} + ${compRoll.d2} = ${cr}. `;

    let firstPlayerId = "";
    let canStart = false;

    if (hr > cr) {
      text += `${humanName} goes first.`;
      firstPlayerId = "HUMAN";
      canStart = true;
    } else if (cr > hr) {
      text += `${compName} goes first.`;
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
    this.history = [];
    this.queuedRolls = [];

    const advantageText = this.tournament.nextRoundAdvantage
      ? `Advantage: ${
          this.getPlayerDisplayName(this.tournament.nextRoundAdvantage.playerId)
        } has square ${this.tournament.nextRoundAdvantage.digitSum} pre-covered.`
      : "";

    this._pushHistory(
      `Round ${this.tournament.roundNumber} start (first: ${this.getPlayerDisplayName(
        firstPlayerId
      )})`
    );

    return {
      header: {
        roundNumber: this.tournament.roundNumber,
        modeLabel: this.getModeLabel(),
        firstPlayerLabel: this.getPlayerDisplayName(firstPlayerId),
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
   *
   * Now this depends ONLY on: "Is there a round, and are we awaiting a roll?"
   * It works for both human and computer turns.
   */
  getRollButtonState() {
    if (!this.currentRound || this.phase !== "awaitingRoll") {
      return { canRoll1: false, enableRollButtons: false };
    }

    const player = this.currentRound.getPlayerById(this.currentPlayerId);
    const board = player.board;

    const canRoll1 = board.canUseOneDie ? board.canUseOneDie() : false;
    return {
      canRoll1,
      enableRollButtons: true,
    };
  }

  /* ---------- HUMAN MOVE (after dice are chosen) ---------- */

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

    const lastAction = {
      playerId: this.currentPlayerId,
      action: moveType,
      squares: [...squares],
      roll: { ...this.currentDice },
    };
    this._pushHistory(
      `${this.getPlayerDisplayName(this.currentPlayerId)} ${moveType}s [${squares.join(
        ", "
      )}]`,
      lastAction
    );

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

  /* ---------- SNAPSHOT LOADING ---------- */

  /**
   * Load a saved snapshot from a .txt file (text contents).
   * Returns initial UI state needed by the controller/View.
   */
  loadSnapshotFromText(text) {
    if (!this.tournament || !this.dice) {
      this.resetTournament();
    }
    this.history = [];

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

    // Ensure uncover win detection works after loading covered squares
    this.currentRound.humanEverCovered =
      this.currentRound.human.board.getCoveredNumbers().length > 0;
    this.currentRound.computerEverCovered =
      this.currentRound.computer.board.getCoveredNumbers().length > 0;

    // Next turn
    this.currentRound.currentPlayerId = snapshot.nextTurnId;
    this.currentPlayerId = snapshot.nextTurnId;

    // Restore optional state
    this.phase = snapshot.phase || "awaitingRoll";
    this.currentDice = snapshot.currentDice || { d1: null, d2: null, sum: null };
    if (snapshot.advantageLock) {
      this.currentRound.advantageLock = { ...snapshot.advantageLock };
    }
    this.queuedRolls = snapshot.queuedRolls || [];

    this._pushHistory(
      `Loaded snapshot (first: ${this.getPlayerDisplayName(snapshot.firstTurnId)})`
    );

    const header = {
      roundNumber: this.tournament.roundNumber,
      modeLabel: this.getModeLabel(),
      firstPlayerLabel:
        this.getPlayerDisplayName(snapshot.firstTurnId),
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

  _formatComputerReason(decision, diceSum, coverOptions = [], uncoverOptions = []) {
    const baseReason = decision?.reason || "Computer applied its move.";
    const choiceSquares =
      decision && decision.squares && decision.squares.length
        ? `[${decision.squares.join(", ")}]`
        : "(no squares)";
    const choiceText = decision?.action
      ? `${decision.action.toUpperCase()} ${choiceSquares}`
      : "No move";
    const coverCount = coverOptions?.length || 0;
    const uncoverCount = uncoverOptions?.length || 0;
    const optionParts = [];
    if (coverCount > 0) {
      optionParts.push(`${coverCount} cover option${coverCount === 1 ? "" : "s"}`);
    }
    if (uncoverCount > 0) {
      optionParts.push(`${uncoverCount} uncover option${uncoverCount === 1 ? "" : "s"}`);
    }
    const optionsText = optionParts.length ? ` Options seen: ${optionParts.join(" | ")}.` : "";
    return `Rolled ${diceSum}. ${baseReason} Chosen: ${choiceText}.${optionsText}`;
  }

  /**
   * Manual dice input for the current player (human OR computer).
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
    if (numDice !== 1 && numDice !== 2) {
      return { error: "You must use 1 or 2 dice." };
    }
    if (!Array.isArray(values) || values.length < numDice) {
      return { error: "Please select enough dice values." };
    }

    const validDie = (v) => Number.isInteger(v) && v >= 1 && v <= 6;

    const d1 = values[0];
    const d2 = numDice === 2 ? values[1] : null;

    if (!validDie(d1) || (numDice === 2 && !validDie(d2))) {
      return { error: "Dice values must be between 1 and 6." };
    }

    const player = this.currentRound.getPlayerById(this.currentPlayerId);
    const board = player.board;

    // 1-die rule (7..n covered)
    if (numDice === 1 && board.canUseOneDie && !board.canUseOneDie()) {
      return {
        error: "You may roll ONE die only if squares 7..n are ALL covered.",
      };
    }

    const sum = d1 + (d2 ?? 0);
    const rollInfo = { d1, d2, sum };
    this.currentDice = rollInfo;

    const coverOptions = this.currentRound.getCoverOptions(
      this.currentPlayerId,
      sum
    );
    const uncoverOptions = this.currentRound.getUncoverOptions(
      this.currentPlayerId,
      sum
    );

    const isHumanCtrl = this.isPlayerHumanControlled(this.currentPlayerId);

    // ---------- HUMAN-CONTROLLED PLAYER ----------
    if (isHumanCtrl) {
      if (coverOptions.length === 0 && uncoverOptions.length === 0) {
        // No moves -> controller should endTurn() just like before
        return {
          roll: this.currentDice,
          coverOptions,
          uncoverOptions,
          canMove: false,
          autoMoveDone: false,
        };
      }

      this.phase = "awaitingMove";

      return {
        roll: this.currentDice,
        coverOptions,
        uncoverOptions,
        canMove: true,
        autoMoveDone: false,
      };
    }

    // ---------- AI-CONTROLLED PLAYER (COMPUTER) ----------
    const ai = this.tournament.computer;

    // No moves at all -> treat like passing the turn
    if (coverOptions.length === 0 && uncoverOptions.length === 0) {
      const reason = this._formatComputerReason(
        {
          action: "none",
          squares: [],
          reason: "No valid cover or uncover moves available.",
        },
        sum,
        coverOptions,
        uncoverOptions
      );
      const lastAction = {
        playerId: this.currentPlayerId,
        action: "none",
        squares: [],
        roll: rollInfo,
        reason,
      };

      this.currentRound.notifyTurnEnded(this.currentPlayerId);

      if (this.currentRound.roundOver) {
        this.phase = "roundOver";
        this.tournament.updateAdvantageForNextRound();

        this._pushHistory(
          `${this.getPlayerDisplayName(this.currentPlayerId)} had no moves`,
          lastAction
        );
        return {
          roll: rollInfo,
          canMove: false,
          autoMoveDone: true,
          roundOver: true,
          summary: this._buildRoundSummary(),
          lastAction,
        };
      }

      this.currentRound.switchTurn();
      this.currentPlayerId = this.currentRound.currentPlayerId;
      this.currentDice = { d1: null, d2: null, sum: null };
      this.phase = "awaitingRoll";

      return {
        roll: rollInfo,
        canMove: false,
        autoMoveDone: true,
        roundOver: false,
        lastAction,
      };
    }

    // AI decides best move (should already be "smart" and prefer winning move)
    const decision = ai.decideMove(this.currentRound, this.currentPlayerId, sum);
    const decisionReason = this._formatComputerReason(
      decision,
      sum,
      coverOptions,
      uncoverOptions
    );

    if (decision.action === "cover") {
      this.currentRound.applyCoverMove(this.currentPlayerId, decision.squares);
    } else if (decision.action === "uncover") {
      this.currentRound.applyUncoverMove(
        this.currentPlayerId,
        decision.squares
      );
    }

    const lastAction = {
      playerId: this.currentPlayerId,
      action: decision.action,
      squares: [...decision.squares],
      roll: rollInfo,
      reason: decisionReason,
    };
    this._pushHistory(
      `${this.getPlayerDisplayName(this.currentPlayerId)} ${decision.action}s [${decision.squares.join(
        ", "
      )}]`,
      lastAction
    );

    // After applying AI move, check for round end
    if (this.currentRound.roundOver) {
      // AI's turn is done and the round is over → unlock advantage & finalize
      this.currentRound.notifyTurnEnded(this.currentPlayerId);
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();

      return {
        roll: rollInfo,
        canMove: false,
        autoMoveDone: true,
        roundOver: true,
        summary: this._buildRoundSummary(),
        lastAction,
      };
    }

    // Round still active:
    // AI's move is done, same player rolls again (manual dice again).
    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    return {
      roll: rollInfo,
      canMove: false,
      autoMoveDone: true,
      roundOver: false,
      lastAction,
    };
  }

  /**
   * Random dice roll wrapper with same return shape as handleManualRoll.
   * @param {number} numDice
   */
  handleRandomRoll(numDice) {
    if (!this.dice) this.dice = new Dice();
    // prime dice with queued rolls if any
    if (this.queuedRolls && this.queuedRolls.length) {
      this.dice.setQueue(this.queuedRolls);
    }
    const roll = this.dice.rollRandom(numDice);
    // persist remaining queue
    this.queuedRolls = this.dice.queue ? [...this.dice.queue] : [];
    const res = this.handleManualRoll(
      numDice,
      roll.d2 == null ? [roll.d1] : [roll.d1, roll.d2]
    );
    if (!res.roll) {
      res.roll = roll;
    }
    return res;
  }

  /**
   * Fully automatic computer turn: roll, pick move, repeat until
   * no moves are possible or the round ends.
   * Returns logs for UI and status flags.
   */
  autoPlayComputerTurn() {
    const logs = [];
    if (!this.currentRound || this.phase !== "awaitingRoll") {
      return { logs, switchedToHuman: false, roundOver: false };
    }
    if (this.isPlayerHumanControlled(this.currentPlayerId)) {
      return { logs, switchedToHuman: false, roundOver: false };
    }
    if (!this.dice) {
      this.dice = new Dice();
    }

    while (
      this.currentRound &&
      !this.currentRound.roundOver &&
      !this.isPlayerHumanControlled(this.currentPlayerId) &&
      this.phase === "awaitingRoll"
    ) {
      // choose dice count per AI rule
      const ai = this.tournament.computer;
      const player = this.currentRound.getPlayerById(this.currentPlayerId);
      const board = player.board;
      const numDice = ai.chooseNumDice(board);
      const roll = this.dice.rollRandom(numDice);
      this.currentDice = roll;

      logs.push(
        `Computer rolled ${roll.d1}${roll.d2 == null ? "" : " + " + roll.d2} (sum = ${roll.sum})`
      );

      const coverOptions = this.currentRound.getCoverOptions(this.currentPlayerId, roll.sum);
      const uncoverOptions = this.currentRound.getUncoverOptions(this.currentPlayerId, roll.sum);

      if (coverOptions.length === 0 && uncoverOptions.length === 0) {
        logs.push("No moves available. Turn ends.");
        this.currentRound.notifyTurnEnded(this.currentPlayerId);
        if (this.currentRound.roundOver) {
          this.phase = "roundOver";
          this.tournament.updateAdvantageForNextRound();
          const summary = this._buildRoundSummary();
          logs.push("=== ROUND OVER ===");
          return { logs, switchedToHuman: false, roundOver: true, summary };
        }
        this.currentRound.switchTurn();
        this.currentPlayerId = this.currentRound.currentPlayerId;
        this.currentDice = { d1: null, d2: null, sum: null };
        this.phase = "awaitingRoll";
        return { logs, switchedToHuman: true, roundOver: false };
      }

      const decision = ai.decideMove(this.currentRound, this.currentPlayerId, roll.sum);
      logs.push(
        `Computer decision: ${decision.action.toUpperCase()} [${decision.squares.join(
          ", "
        )}] – ${decision.reason}`
      );

      if (decision.action === "cover") {
        this.currentRound.applyCoverMove(this.currentPlayerId, decision.squares);
        logs.push(`Computer covers squares [${decision.squares.join(", ")}]`);
      } else if (decision.action === "uncover") {
        this.currentRound.applyUncoverMove(this.currentPlayerId, decision.squares);
        logs.push(`Computer uncovers opponent squares [${decision.squares.join(", ")}]`);
      } else {
        // should not hit because handled above
        this.currentRound.notifyTurnEnded(this.currentPlayerId);
        this.currentRound.switchTurn();
        this.currentPlayerId = this.currentRound.currentPlayerId;
        this.currentDice = { d1: null, d2: null, sum: null };
        this.phase = "awaitingRoll";
        return { logs, switchedToHuman: true, roundOver: false };
      }

      if (this.currentRound.roundOver) {
        this.currentRound.notifyTurnEnded(this.currentPlayerId);
        this.phase = "roundOver";
        this.tournament.updateAdvantageForNextRound();
        const summary = this._buildRoundSummary();
        logs.push("=== ROUND OVER ===");
        return { logs, switchedToHuman: false, roundOver: true, summary };
      }

      // Same player continues rolling
      this.currentDice = { d1: null, d2: null, sum: null };
      this.phase = "awaitingRoll";
    }

    return { logs, switchedToHuman: false, roundOver: false };
  }

  /* ---------- HISTORY / REWIND ---------- */

  _captureSnapshot(lastAction = null) {
    if (!this.currentRound || !this.tournament) return null;
    return {
      gameMode: this.gameMode,
      currentPlayerId: this.currentPlayerId,
      phase: this.phase,
      currentDice: { ...this.currentDice },
      lastAction,
      tournament: {
        humanScore: this.tournament.human.totalScore,
        computerScore: this.tournament.computer.totalScore,
        nextRoundAdvantage: this.tournament.nextRoundAdvantage
          ? { ...this.tournament.nextRoundAdvantage }
          : null,
        roundNumber: this.tournament.roundNumber,
      },
      round: {
        boardSize: this.currentRound.boardSize,
        firstPlayerId: this.currentRound.firstPlayerId,
        currentPlayerId: this.currentRound.currentPlayerId,
        advantageInfo: this.currentRound.advantageInfo
          ? { ...this.currentRound.advantageInfo }
          : null,
        advantageLock: this.currentRound.advantageLock
          ? { ...this.currentRound.advantageLock }
          : null,
        roundOver: this.currentRound.roundOver,
        roundWinnerId: this.currentRound.roundWinnerId,
        winType: this.currentRound.winType,
        roundScore: this.currentRound.roundScore,
        humanBoard: this.currentRound.human.board.toNumberArrayFormat(),
        computerBoard: this.currentRound.computer.board.toNumberArrayFormat(),
        humanScore: this.currentRound.human.totalScore,
        computerScore: this.currentRound.computer.totalScore,
      },
    };
  }

  _restoreSnapshot(snap) {
    this.gameMode = snap.gameMode;
    this.tournament = new Tournament("Human", "Computer");
    this.tournament.roundNumber = snap.tournament.roundNumber;
    this.tournament.nextRoundAdvantage = snap.tournament.nextRoundAdvantage
      ? { ...snap.tournament.nextRoundAdvantage }
      : null;
    this.tournament.human.totalScore = snap.tournament.humanScore;
    this.tournament.computer.totalScore = snap.tournament.computerScore;

    this.currentRound = new GameRound({
      boardSize: snap.round.boardSize,
      humanPlayer: this.tournament.human,
      computerPlayer: this.tournament.computer,
      firstPlayerId: snap.round.firstPlayerId,
      advantageInfo: snap.round.advantageInfo,
    });

    this.currentRound.advantageLock = snap.round.advantageLock
      ? { ...snap.round.advantageLock }
      : null;

    this.currentRound.human.board.loadFromNumberArrayFormat(
      snap.round.humanBoard
    );
    this.currentRound.computer.board.loadFromNumberArrayFormat(
      snap.round.computerBoard
    );
    this.currentRound.human.totalScore = snap.round.humanScore;
    this.currentRound.computer.totalScore = snap.round.computerScore;

    this.currentRound.humanEverCovered =
      this.currentRound.human.board.getCoveredNumbers().length > 0;
    this.currentRound.computerEverCovered =
      this.currentRound.computer.board.getCoveredNumbers().length > 0;

    this.currentRound.currentPlayerId = snap.round.currentPlayerId;
    this.currentRound.roundOver = snap.round.roundOver;
    this.currentRound.roundWinnerId = snap.round.roundWinnerId;
    this.currentRound.winType = snap.round.winType;
    this.currentRound.roundScore = snap.round.roundScore;

    this.currentPlayerId = snap.currentPlayerId;
    this.phase = snap.phase;
    this.currentDice = { ...snap.currentDice };
  }

  _pushHistory(label, lastAction = null) {
    const snap = this._captureSnapshot(lastAction);
    if (!snap) return;
    this.history.push({ label, snapshot: snap, lastAction });
  }

  getHistoryEntries() {
    return this.history.map((h, idx) => ({
      index: idx,
      label: h.label,
    }));
  }

  getHistorySnapshot(index) {
    if (index < 0 || index >= this.history.length) return null;
    return this.history[index].snapshot;
  }

  rewindTo(index) {
    if (index < 0 || index >= this.history.length) {
      return { error: "Invalid rewind selection." };
    }
    const entry = this.history[index];
    this._restoreSnapshot(entry.snapshot);
    // After rewind, force a fresh roll state
    this.phase = "awaitingRoll";
    this.currentDice = { d1: null, d2: null, sum: null };
    const header = {
      roundNumber: this.tournament.roundNumber,
      modeLabel: this.getModeLabel(),
      firstPlayerLabel: this.getPlayerDisplayName(
        this.currentRound.firstPlayerId
      ),
      advantageText: this.tournament.nextRoundAdvantage
        ? `Advantage: ${this.getPlayerDisplayName(
            this.tournament.nextRoundAdvantage.playerId
          )} has square ${this.tournament.nextRoundAdvantage.digitSum} pre-covered.`
        : "",
    };
    return {
      header,
      scores: this.getScores(),
      lastAction: entry.lastAction,
      currentDice: { ...this.currentDice },
      phase: this.phase,
    };
  }

  /**
   * Export a snapshot string of the current round for saving.
   */
  getSnapshotText() {
    if (!this.currentRound) {
      throw new Error("No active round to save.");
    }
    return Serializer.serializeSnapshot({
      computerBoard: this.currentRound.computer.board,
      humanBoard: this.currentRound.human.board,
      computerScore: this.tournament.computer.totalScore,
      humanScore: this.tournament.human.totalScore,
      firstTurnId: this.currentRound.firstPlayerId,
      nextTurnId: this.currentPlayerId,
      phase: this.phase,
      currentDice: this.currentDice,
      advantageLock: this.currentRound.advantageLock,
      queuedRolls: this.queuedRolls,
    });
  }
}
