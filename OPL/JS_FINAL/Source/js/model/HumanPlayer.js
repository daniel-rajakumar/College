import { Player } from "./Player.js";

/**
 * Thin extension of Player representing a human-controlled participant.
 */
export class HumanPlayer extends Player {
  constructor(name = "Human") {
    super("HUMAN", name);
  }
}
