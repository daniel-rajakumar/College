// js/model/HumanPlayer.js
import { Player } from "./Player.js";

/**
 * HumanPlayer = currently no extra logic over Player.
 * Kept as separate class for clear OO / future extensions.
 */
export class HumanPlayer extends Player {
  constructor(name = "Human") {
    super("HUMAN", name);
  }
}
