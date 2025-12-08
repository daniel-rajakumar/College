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
    // Pull out squares and scores using regex close to the spec format.
    const compSquaresMatch = text.match(
      /Computer:[\s\S]*?Squares:\s*([0-9\s]+)/i
    );
    const compScoreMatch = text.match(/Computer:[\s\S]*?Score:\s*(\d+)/i);

    const humanSquaresMatch = text.match(
      /Human:[\s\S]*?Squares:\s*([0-9\s]+)/i
    );
    const humanScoreMatch = text.match(/Human:[\s\S]*?Score:\s*(\d+)/i);

    const firstTurnMatch = text.match(/First Turn:\s*(Human|Computer)/i);
    const nextTurnMatch = text.match(/Next Turn:\s*(Human|Computer)/i);

    if (
      !compSquaresMatch ||
      !compScoreMatch ||
      !humanSquaresMatch ||
      !humanScoreMatch
    ) {
      throw new Error('Invalid save format.');
    }

    const parseSquares = s =>
      s
        .trim()
        .split(/\s+/)
        .map(n => parseInt(n, 10));

    const computerSquares = parseSquares(compSquaresMatch[1]);
    const humanSquares = parseSquares(humanSquaresMatch[1]);
    const computerScore = parseInt(compScoreMatch[1], 10);
    const humanScore = parseInt(humanScoreMatch[1], 10);

    const normalizeName = v =>
      !v ? 'Human' : v.trim().toLowerCase() === 'computer' ? 'Computer' : 'Human';

    const firstTurn = normalizeName(firstTurnMatch && firstTurnMatch[1]);
    const nextTurn = normalizeName(nextTurnMatch && nextTurnMatch[1]);

    return {
      computerSquares,
      humanSquares,
      computerScore,
      humanScore,
      firstTurn,
      nextTurn,
    };
  }
}
