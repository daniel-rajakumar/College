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

    // Strategy from rubric:
    // 1. Prefer covering if possible.
    // 2. Otherwise uncover.
    // Within each, prefer:
    //   - combos with more squares
    //   - if tie, higher total value (larger numbers).
    if (coverOptions.length > 0) {
      const best = this._pickBestCombo(coverOptions);
      return {
        action: "cover",
        squares: best,
        reason:
          "Chose to COVER own squares first to move closer to winning and make it harder for opponent to score.",
        allCoverOptions: coverOptions,
        allUncoverOptions: uncoverOptions
      };
    } else {
      const best = this._pickBestCombo(uncoverOptions);
      return {
        action: "uncover",
        squares: best,
        reason:
          "No cover move available, so chose to UNCOVER opponent's squares to disrupt their progress.",
        allCoverOptions: coverOptions,
        allUncoverOptions: uncoverOptions
      };
    }
  }

  /**
   * Helper for help-mode: same logic as decideMove, but explicitly labelled.
   */
  getHelpSuggestion(round, playerId, diceSum) {
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
