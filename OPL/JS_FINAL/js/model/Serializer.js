// js/model/Serializer.js
export class Serializer {
  static save(tournament, round) {
    const c = tournament.computer;
    const h = tournament.human;

    const computerSquares = c.board.squares.join(' ');
    const humanSquares = h.board.squares.join(' ');

    return [
      'Computer:',
      `   Squares: ${computerSquares}`,
      `   Score: ${c.totalScore}`,
      '',
      'Human:',
      `   Squares: ${humanSquares}`,
      `   Score: ${h.totalScore}`,
      '',
      `First Turn: ${round.firstPlayer}`,
      `Next Turn: ${round.nextPlayer}`,
    ].join('\n');
  }

  static load(text) {
    // parse text into:
    // { computerSquares, humanSquares, computerScore, humanScore, firstTurn, nextTurn }
    // TODO: regex parsing
  }
}
