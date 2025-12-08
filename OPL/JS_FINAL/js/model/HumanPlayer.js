// js/model/HumanPlayer.js
import { Player } from './Player.js';

export class HumanPlayer extends Player {
  constructor(board) {
    super('Human', board);
  }

  // human decisions are made via UI, so this class might stay thin
}
