

// js/model/GameRound.js

import { BoardView, section } from "../ui/View.js";
import { Tournament } from "./Tournament.js";

/**
 * GameRound = one round of play between human & computer.
 * It uses Tournament for scoring + advantage, but does not
 * own the Tournament (it's passed in).
 */
export class GameRound {
  /**
   * @param {Player} player1 - HumanPlayer
   * @param {Player} player2 - ComputerPlayer
   * @param {Tournament} tournament
   * @param {boolean} isNewGame - true if this is a fresh round, not a resumed one
   */
  constructor(player1, player2, tournament, isNewGame) {
    this.player1 = player1;
    this.player2 = player2;
    this.tournament = tournament;
    this.isNewGame = !!isNewGame;
  }

  /**
   * Roll 2 dice for each side until one wins; returns the first player.
   */
  determineFirstPlayer() {
    let player1Roll, player2Roll;

    do {
      player1Roll =
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1);
      console.log("Human rolled: " + player1Roll);

      player2Roll =
        (Math.floor(Math.random() * 6) + 1) +
        (Math.floor(Math.random() * 6) + 1);
      console.log("Computer rolled: " + player2Roll);

      if (player1Roll > player2Roll) {
        console.log("Human plays first!");
        return this.player1;
      }
      if (player2Roll > player1Roll) {
        console.log("Computer plays first!");
        return this.player2;
      }
      console.log("It's a tie! Rolling again...");
    } while (player1Roll === player2Roll);

    return this.player1; // should never hit, but just in case
  }

  isRoundOver() {
    const b1 = this.player1.getBoard();
    const b2 = this.player2.getBoard();
    return (
      b1.allCovered() ||
      b2.allCovered() ||
      b1.allUncovered() ||
      b2.allUncovered()
    );
  }

  /**
   * Declare winner and update tournament state.
   *
   * @param {Player} currentPlayer - winner
   * @param {boolean} winnerWasFirstPlayer
   */
  declareWinner(currentPlayer, winnerWasFirstPlayer) {
    const b1 = this.player1.getBoard();
    const b2 = this.player2.getBoard();

    if (b1.allCovered()) {
      console.log("Human wins by covering all their squares!");
      this.tournament.updateScores(
        true,
        false,
        false,
        false,
        b1.getCoveredSum(),
        b2.getUncoveredSum()
      );
      this.tournament.applyHandicap(
        winnerWasFirstPlayer,
        true,
        b2.getUncoveredSum()
      );
    } else if (b2.allCovered()) {
      console.log("Computer wins by covering all their squares!");
      this.tournament.updateScores(
        false,
        false,
        true,
        false,
        b1.getUncoveredSum(),
        b2.getCoveredSum()
      );
      this.tournament.applyHandicap(
        winnerWasFirstPlayer,
        false,
        b1.getUncoveredSum()
      );
    } else if (b2.allUncovered()) {
      console.log("Human wins by uncovering all the computer's squares!");
      this.tournament.updateScores(
        false,
        true,
        false,
        false,
        b1.getCoveredSum(),
        0
      );
      this.tournament.applyHandicap(
        winnerWasFirstPlayer,
        true,
        b1.getCoveredSum()
      );
    } else if (b1.allUncovered()) {
      console.log("Computer wins by uncovering all the human's squares!");
      this.tournament.updateScores(
        false,
        false,
        false,
        true,
        0,
        b2.getCoveredSum()
      );
      this.tournament.applyHandicap(
        winnerWasFirstPlayer,
        false,
        b2.getCoveredSum()
      );
    }
  }

  /**
   * Core loop for a single round.
   */
  play() {
    const { player1, player2, tournament } = this;

    // Set the current player based on stored "next turn"
    let currentPlayer = tournament.getIsHumanTurn() ? player1 : player2;

    // If this is a *new* round, we roll off to see who starts
    if (this.isNewGame) {
      console.log("~~~~~~~~[Who Goes First?]~~~~~~~~~");
      const fp = this.determineFirstPlayer();
      currentPlayer = fp;
      tournament.setFirstPlayerIsHuman(fp.getIsHuman());
      tournament.setIsHumanTurn(currentPlayer.getIsHuman());
      console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
    }

    // show starting boards
    section("Starting Board State");
    const humanView = new BoardView(player1.getBoard(), "Human");
    const compView = new BoardView(player2.getBoard(), "Computer");

    compView.display(
      Tournament.getAdvantageApplied() &&
        Tournament.getAdvantageOwner() === Tournament.Side.Computer,
      Tournament.getAdvantageSquare()
    );
    humanView.display(
      Tournament.getAdvantageApplied() &&
        Tournament.getAdvantageOwner() === Tournament.Side.Human,
      Tournament.getAdvantageSquare()
    );
    console.log("");

    tournament.setIsHumanTurn(currentPlayer.getIsHuman());

    // quick check: round might already be over (edge case if you ever add loading)
    if (this.isRoundOver()) {
      const b1 = player1.getBoard();
      const b2 = player2.getBoard();
      let winnerIsHuman = false;

      if (b1.allCovered() || b2.allUncovered()) winnerIsHuman = true;
      else if (b2.allCovered() || b1.allUncovered()) winnerIsHuman = false;

      const winnerWasFirst =
        tournament.getFirstPlayerIsHuman() === winnerIsHuman;
      const winner = winnerIsHuman ? player1 : player2;
      this.declareWinner(winner, winnerWasFirst);
      return;
    }

    // ---- main turn loop ----
    while (true) {
      // One *full* turn for this player (they roll until they bust)
      currentPlayer.takeTurn();

      // Clear one-turn advantage protection after that side's *first* turn
      if (Tournament.getAdvantageApplied()) {
        if (
          Tournament.getAdvantageOwner() === Tournament.Side.Human &&
          currentPlayer.getIsHuman()
        ) {
          Tournament.clearAdvantageProtectionForHuman();
        } else if (
          Tournament.getAdvantageOwner() === Tournament.Side.Computer &&
          !currentPlayer.getIsHuman()
        ) {
          Tournament.clearAdvantageProtectionForComputer();
        }
      }

      if (this.isRoundOver()) {
        const winnerWasFirst =
          tournament.getFirstPlayerIsHuman() ===
          currentPlayer.getIsHuman();
        this.declareWinner(currentPlayer, winnerWasFirst);
        break;
      }

      // Swap players, store whose turn is next (for potential save/load later)
      currentPlayer = currentPlayer === player1 ? player2 : player1;
      tournament.setIsHumanTurn(currentPlayer.getIsHuman());
    }
  }
}

