/**
 * Base player model holding identity, board reference, and tournament score.
 */
export class Player {

  /**
   * @param {"HUMAN"|"COMPUTER"} id player id
   * @param {string} name display name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.board = null;
    this.totalScore = 0;
  }

  /**
   * Add delta to the player's tournament score.
   * @param {number} delta
   */
  addToScore(delta) {
    if (!Number.isFinite(delta)) {
      throw new Error("Score delta must be a finite number");
    }
    this.totalScore += delta;
  }
}
