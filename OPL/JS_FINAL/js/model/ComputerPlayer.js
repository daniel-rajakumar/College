// js/model/ComputerPlayer.js
import { Player } from "./Player.js";

/**
 * ComputerPlayer encapsulates AI strategy and help-mode logic.
 *
 * It does NOT roll dice or control turn flow.
 * It only decides:
 *  - cover vs uncover
 *  - which squares to use
 */
export class ComputerPlayer extends Player {
  constructor(name = "Computer") {
    super("COMPUTER", name);
  }

  /**
   * Decide best move for given player (usually the computer itself).
   * We keep this generic so it can also be used to give help to human.
   *
   * SMART STRATEGY:
   *  1. Check ALL legal moves (cover + uncover) for an IMMEDIATE WIN.
   *     - Cover: move covers ALL your remaining uncovered squares.
   *     - Uncover: move uncovers ALL of opponent's remaining covered squares.
   *  2. If no winning move:
   *     - Prefer covering over uncovering (rubric rule).
   *     - Within cover/uncover moves, choose combo with:
   *         a) more squares,
   *         b) if tie, larger sum.
   *
   * @param {GameRound} round
   * @param {string} playerId "HUMAN" | "COMPUTER"
   * @param {number} diceSum
   * @returns {{
   *   action: "cover" | "uncover" | "none",
   *   squares: number[],
   *   reason: string,
   *   allCoverOptions: number[][],
   *   allUncoverOptions: number[][]
   * }}
   */
  decideMove(round, playerId, diceSum) {
    const coverOptions = round.getCoverOptions(playerId, diceSum);
    const uncoverOptions = round.getUncoverOptions(playerId, diceSum);

    if (coverOptions.length === 0 && uncoverOptions.length === 0) {
      return {
        action: "none",
        squares: [],
        reason: "No valid cover or uncover moves available for this dice sum.",
        allCoverOptions: [],
        allUncoverOptions: []
      };
    }

    const self = round.getPlayerById(playerId);
    const opp = round.getOpponent(playerId);

    const selfUncovered = self.board.getUncoveredNumbers();
    const oppCovered = opp.board.getCoveredNumbers();

    // ------------------------------------------------------
    // 1. LOOK FOR AN IMMEDIATE WIN (COVER OR UNCOVER)
    // ------------------------------------------------------

    // Win by COVER: if this combo covers ALL remaining uncovered squares
    // => combo length == #uncovered (combos are subsets of uncovered).
    for (const combo of coverOptions) {
      if (combo.length === selfUncovered.length) {
        return {
          action: "cover",
          squares: combo,
          reason:
            "This move COVERS all your remaining squares and wins the round immediately.",
          allCoverOptions: coverOptions,
          allUncoverOptions: uncoverOptions
        };
      }
    }

    // Win by UNCOVER: if this combo uncovers ALL of opponent's covered squares
    // => combo length == #covered (combos are subsets of covered).
    for (const combo of uncoverOptions) {
      if (combo.length === oppCovered.length) {
        return {
          action: "uncover",
          squares: combo,
          reason:
            "This move UNCOVERS all opponent squares and wins the round immediately.",
          allCoverOptions: coverOptions,
          allUncoverOptions: uncoverOptions
        };
      }
    }

    // ------------------------------------------------------
    // 2. NO FORCED WIN: USE HEURISTIC
    //    - Prefer covering if possible.
    //    - Otherwise uncover.
    //    - Within each, prefer:
    //        * more squares
    //        * if tie, larger sum
    // ------------------------------------------------------
    if (coverOptions.length > 0) {
      const best = this._pickBestCombo(coverOptions);
      return {
        action: "cover",
        squares: best,
        reason:
          "No immediate win available. Chose to COVER own squares using the combination that makes the most progress (more / larger squares).",
        allCoverOptions: coverOptions,
        allUncoverOptions: uncoverOptions
      };
    } else {
      const best = this._pickBestCombo(uncoverOptions);
      return {
        action: "uncover",
        squares: best,
        reason:
          "No immediate win available and no cover move. Chose to UNCOVER opponent's squares using the strongest combination (more / larger squares).",
        allCoverOptions: coverOptions,
        allUncoverOptions: uncoverOptions
      };
    }
  }

  /**
   * Helper for help-mode: same logic as decideMove, but explicitly labelled.
   */
  getHelpSuggestion(round, playerId, diceSum) {
    // Help is literally "what would the AI do in your shoes?"
    return this.decideMove(round, playerId, diceSum);
  }

  /**
   * Choose whether to roll 1 die or 2 dice based on board state.
   *
   * Rule (per rubric):
   *  - If 7..n are all covered: roll 1 die.
   *  - Otherwise: roll 2 dice.
   *
   * @param {Board} board the player's own board
   * @returns {1 | 2}
   */
  chooseNumDice(board) {
    const n = board.size;
    let allHighCovered = true;
    for (let i = 7; i <= n; i++) {
      if (i >= 1 && i <= n && !board.isCovered(i)) {
        allHighCovered = false;
        break;
      }
    }
    return allHighCovered ? 1 : 2;
  }

  /**
   * Generic "best combo" according to:
   *  - more squares is better
   *  - if tie, higher total sum is better
   */
  _pickBestCombo(options) {
    let best = options[0];
    for (let i = 1; i < options.length; i++) {
      const candidate = options[i];
      if (candidate.length > best.length) {
        best = candidate;
      } else if (candidate.length === best.length) {
        const sumBest = best.reduce((a, b) => a + b, 0);
        const sumCand = candidate.reduce((a, b) => a + b, 0);
        if (sumCand > sumBest) {
          best = candidate;
        }
      }
    }
    return best;
  }
}
