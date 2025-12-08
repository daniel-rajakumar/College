// js/model/ComputerPlayer.js
import { Player } from './Player.js';

export class ComputerPlayer extends Player {
  constructor(board) {
    super('Computer', board);
  }

  // choose cover/uncover + squares using strategy
  chooseMove(sum, opponentBoard) {
    // TODO: implement strategy:
    // 1) generate valid cover moves
    // 2) generate valid uncover moves
    // 3) prefer cover, more squares, higher sum (rubric strategy) :contentReference[oaicite:3]{index=3}
    return {
      type: 'cover',        // or 'uncover'
      squares: [/* ... */]  // ex: [4,2] or [3,2,1]
    };
  }

  chooseNumDice(are7ToNcovered) {
    // If 7–n all covered → prefer 1 die, else 2 dice. :contentReference[oaicite:4]{index=4}
    return are7ToNcovered ? 1 : 2;
  }
}
