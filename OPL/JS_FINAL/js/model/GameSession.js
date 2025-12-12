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

  /* ---------- COMPUTER AUTO-TURNS (old auto-roll logic, now unused) ---------- */
  // Leaving this here in case you ever want to bring back fully automatic AI turns.
  // main.js doesn't call this anymore.

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

      const decision = ai.decideMove(
        this.currentRound,
        this.currentPlayerId,
        roll.sum
      );

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
    this.currentDice = { d1, d2, sum };

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
      this.currentRound.notifyTurnEnded(this.currentPlayerId);

      if (this.currentRound.roundOver) {
        this.phase = "roundOver";
        this.tournament.updateAdvantageForNextRound();
        return {
          roll: this.currentDice,
          canMove: false,
          autoMoveDone: true,
          roundOver: true,
          summary: this._buildRoundSummary(),
        };
      }

      this.currentRound.switchTurn();
      this.currentPlayerId = this.currentRound.currentPlayerId;
      this.currentDice = { d1: null, d2: null, sum: null };
      this.phase = "awaitingRoll";

      return {
        roll: null,
        canMove: false,
        autoMoveDone: true,
        roundOver: false,
      };
    }

    // AI decides best move (should already be "smart" and prefer winning move)
    const decision = ai.decideMove(this.currentRound, this.currentPlayerId, sum);

    if (decision.action === "cover") {
      this.currentRound.applyCoverMove(this.currentPlayerId, decision.squares);
    } else if (decision.action === "uncover") {
      this.currentRound.applyUncoverMove(
        this.currentPlayerId,
        decision.squares
      );
    }

    // After applying AI move, check for round end
    if (this.currentRound.roundOver) {
      // AI's turn is done and the round is over → unlock advantage & finalize
      this.currentRound.notifyTurnEnded(this.currentPlayerId);
      this.phase = "roundOver";
      this.tournament.updateAdvantageForNextRound();

      return {
        roll: this.currentDice,
        canMove: false,
        autoMoveDone: true,
        roundOver: true,
        summary: this._buildRoundSummary(),
      };
    }

    // Round still active:
    // AI's move is done, same player rolls again (manual dice again).
    this.currentDice = { d1: null, d2: null, sum: null };
    this.phase = "awaitingRoll";

    return {
      roll: { d1, d2, sum },
      canMove: false,
      autoMoveDone: true,
      roundOver: false,
    };
  }

  /**
   * Random dice roll wrapper with same return shape as handleManualRoll.
   * @param {number} numDice
   */
  handleRandomRoll(numDice) {
    if (!this.dice) this.dice = new Dice();
    const roll = this.dice.rollRandom(numDice);
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
    });
  }
}
