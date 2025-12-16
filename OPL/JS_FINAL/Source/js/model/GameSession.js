import { Tournament } from "./Tournament.js";
import { Dice } from "./Dice.js";
import { Serializer } from "./Serializer.js";
import { GameRound } from "./GameRound.js";

/**
 * Orchestrates tournament state, the active round, dice rolls, history, and persistence.
 */
export class GameSession {
  constructor() {
    this.tournament = null;
    this.dice = null;
    this.currentRound = null;
    this.history = [];
    this.queuedRolls = [];

    this.gameMode = "HvsC";
    this.currentPlayerId = "HUMAN";
    this.phase = "idle";

    this.currentDice = { d1: null, d2: null, sum: null };
  }

  /**
   * Create a fresh tournament with new dice, clearing history and queues.
   */
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

  /**
   * Set the current game mode (HvsC, HvsH, or CvsC).
   */
  setMode(mode) {
    this.gameMode = mode;
  }

  /**
   * @returns {string} user-facing mode label
   */
  getModeLabel() {
    if (this.gameMode === "HvsC") return "Human vs Computer";
    if (this.gameMode === "HvsH") return "Human vs Human";
    if (this.gameMode === "CvsC") return "Computer vs Computer";
    return this.gameMode;
  }

  /**
   * @param {"HUMAN"|"COMPUTER"} playerId
   * @returns {boolean} true if player is human-controlled for current mode
   */
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

  /**
   * @param {"HUMAN"|"COMPUTER"} playerId
   * @returns {string} display name adjusted for current mode
   */
  getPlayerDisplayName(playerId) {
    if (this.gameMode === "HvsH") {
      return playerId === "HUMAN" ? "Player 1 (Human)" : "Player 2 (Human)";
    }
    if (this.gameMode === "CvsC") {
      return playerId === "HUMAN" ? "Player 1 (Computer)" : "Player 2 (Computer)";
    }
    return playerId === "HUMAN" ? "Human" : "Computer";
  }

  /**
   * @returns {string} display name of current player
   */
  getCurrentPlayerLabel() {
    return this.getPlayerDisplayName(this.currentPlayerId);
  }

  /**
   * @returns {{d1:number|null,d2:number|null,sum:number|null}} current dice values
   */
  getCurrentDice() {
    return { ...this.currentDice };
  }

  /**
   * @returns {GameRound|null} active round
   */
  getCurrentRound() {
    return this.currentRound;
  }

  /**
   * @returns {"HUMAN"|"COMPUTER"} current player id
   */
  getCurrentPlayerId() {
    return this.currentPlayerId;
  }

  /**
   * @returns {"idle"|"awaitingRoll"|"awaitingMove"|"roundOver"} current phase
   */
  getPhase() {
    return this.phase;
  }

  /**
   * @returns {{humanScore:number, computerScore:number}} tournament totals
   */
  getScores() {
    if (!this.tournament) {
      return { humanScore: 0, computerScore: 0 };
    }
    return {
      humanScore: this.tournament.human.totalScore,
      computerScore: this.tournament.computer.totalScore,
    };
  }

  /**
   * @returns {{winnerId:"HUMAN"|"COMPUTER"|"DRAW",humanScore:number,computerScore:number}}
   */
  getTournamentResult() {
    return this.tournament
      ? this.tournament.getTournamentResult()
      : {
          winnerId: "DRAW",
          humanScore: 0,
          computerScore: 0,
        };
  }



  /**
   * Pre-round roll-off to choose the first player.
   */
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

  /**
   * Initialize and enter a new round with given board size and starting player.
   */
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




  /**
   * UI helper describing whether roll buttons are visible/enabled for current phase.
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




  /**
   * Apply a validated human move choice and advance turn state.
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

    if (this.currentRound.roundOver) {
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();

      return {
        roundOver: true,
        summary: this._buildRoundSummary(),
      };
    }

    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    return {
      roundOver: false,
    };
  }


  /**
   * Finish a player's turn when no move is made and swap turns if needed.
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

  /**
   * Relay AI help suggestion for the current dice roll (if any).
   */
  getHelpSuggestion() {
    if (!this.currentRound || !this.currentDice.sum) return null;
    const ai = this.tournament.computer;
    return ai.getHelpSuggestion(
      this.currentRound,
      this.currentPlayerId,
      this.currentDice.sum
    );
  }




  /**
   * Load a saved snapshot string into a fresh tournament state.
   */
  loadSnapshotFromText(text) {
    if (!this.tournament || !this.dice) {
      this.resetTournament();
    }
    this.history = [];

    const snapshot = Serializer.parseSnapshot(text);

    this.gameMode = "HvsC";

    const boardSize = snapshot.humanSquares.length;

    this.currentRound = this.tournament.startNewRound(
      boardSize,
      snapshot.firstTurnId
    );

    this.tournament.human.totalScore = snapshot.humanScore;
    this.tournament.computer.totalScore = snapshot.computerScore;

    this.currentRound.human.board.loadFromNumberArrayFormat(
      snapshot.humanSquares
    );
    this.currentRound.computer.board.loadFromNumberArrayFormat(
      snapshot.computerSquares
    );

    this.currentRound.humanEverCovered =
      this.currentRound.human.board.getCoveredNumbers().length > 0;
    this.currentRound.computerEverCovered =
      this.currentRound.computer.board.getCoveredNumbers().length > 0;

    this.currentRound.currentPlayerId = snapshot.nextTurnId;
    this.currentPlayerId = snapshot.nextTurnId;

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



  /**
   * @returns {Object} packaged summary of the finished round for UI
   */
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
   * Process a manually provided dice roll for the current player.
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

    if (isHumanCtrl) {
      if (coverOptions.length === 0 && uncoverOptions.length === 0) {

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

    const ai = this.tournament.computer;

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

    if (this.currentRound.roundOver) {

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
   * Wrapper around manual roll using RNG/queued values with same shape.
   */
  handleRandomRoll(numDice) {
    if (!this.dice) this.dice = new Dice();

    if (this.queuedRolls && this.queuedRolls.length) {
      this.dice.setQueue(this.queuedRolls);
    }
    const roll = this.dice.rollRandom(numDice);

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
   * Fully automatic computer-only turn loop for CvsC or when AI controls current player.
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

      this.currentDice = { d1: null, d2: null, sum: null };
      this.phase = "awaitingRoll";
    }

    return { logs, switchedToHuman: false, roundOver: false };
  }



  /**
   * Capture a rewindable snapshot of tournament and round state.
   * @param {Object|null} lastAction
   * @returns {Object|null}
   */
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

  /**
   * Restore previously captured snapshot into live objects.
   * @param {Object} snap
   */
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

  /**
   * Append a labeled snapshot to history for rewinding.
   * @param {string} label
   * @param {Object|null} lastAction
   */
  _pushHistory(label, lastAction = null) {
    const snap = this._captureSnapshot(lastAction);
    if (!snap) return;
    this.history.push({ label, snapshot: snap, lastAction });
  }

  /**
   * @returns {{index:number,label:string}[]} history labels for rewind UI
   */
  getHistoryEntries() {
    return this.history.map((h, idx) => ({
      index: idx,
      label: h.label,
    }));
  }

  /**
   * @param {number} index
   * @returns {Object|null} snapshot at history index
   */
  getHistorySnapshot(index) {
    if (index < 0 || index >= this.history.length) return null;
    return this.history[index].snapshot;
  }

  /**
   * Restore state to a previous history entry.
   * @param {number} index
   * @returns {Object} details for UI refresh or error
   */
  rewindTo(index) {
    if (index < 0 || index >= this.history.length) {
      return { error: "Invalid rewind selection." };
    }
    const entry = this.history[index];
    this._restoreSnapshot(entry.snapshot);

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
   * Serialize current round to snapshot text.
   * @returns {string}
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
