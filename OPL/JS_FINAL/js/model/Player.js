// js/model/Player.js

/**
 * Base Player class.
 * HumanPlayer and ComputerPlayer extend this.
 */
export class Player {
  /**
   * @param {string} id "HUMAN" | "COMPUTER"
   * @param {string} name display name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.board = null;      // Board instance (set by GameRound)
    this.totalScore = 0;    // tournament cumulative score
  }

  addToScore(delta) {
    if (!Number.isFinite(delta)) {
      throw new Error("Score delta must be a finite number");
    }
    this.totalScore += delta;
  }
}
