import { Player } from "./Player.js";

/**
 * AI player with heuristic move selection and dice count rules.
 */
export class ComputerPlayer extends Player {
  constructor(name = "Computer") {
    super("COMPUTER", name);
  }


  /**
   * Choose the best move for the given dice sum and player state.
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
   * Help-mode convenience: what the AI would do in the player's shoes.
   */
  getHelpSuggestion(round, playerId, diceSum) {
    return this.decideMove(round, playerId, diceSum);
  }

  /**
   * Decide whether to roll 1 or 2 dice based on covered high squares.
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
   * Tie-breaker for combos: more squares first, then higher sum.
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
