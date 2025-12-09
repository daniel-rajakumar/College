// js/model/Serializer.js

/**
 * Serializer = convert between Tournament/GameRound state and the
 * text format specified in the Canoga project handout.
 *
 * NOTE: This focuses on the board & scores & first/next player,
 * as per spec. Advantage lock is already baked into the board state
 * at the time of saving.
 */

export class Serializer {
  /**
   * Serialize the given state to the C++/Java-like text format:
   *
   * Computer:
   *    Squares: 1 2 3 0 5 ...
   *    Score: 34
   *
   * Human:
   *    Squares: ...
   *    Score: 36
   *
   * First Turn: Computer
   * Next Turn: Computer
   *
   * @param {Object} params
   *  - computerBoard: Board
   *  - humanBoard: Board
   *  - computerScore: number
   *  - humanScore: number
   *  - firstTurnId: "HUMAN" | "COMPUTER"
   *  - nextTurnId: "HUMAN" | "COMPUTER"
   * @returns {string}
   */
  static serializeSnapshot({
    computerBoard,
    humanBoard,
    computerScore,
    humanScore,
    firstTurnId,
    nextTurnId
  }) {
    const compArr = computerBoard.toNumberArrayFormat();
    const humanArr = humanBoard.toNumberArrayFormat();

    const firstTurnLabel = firstTurnId === "COMPUTER" ? "Computer" : "Human";
    const nextTurnLabel = nextTurnId === "COMPUTER" ? "Computer" : "Human";

    const computerLine = compArr.join(" ");
    const humanLine = humanArr.join(" ");

    return (
      "Computer:\n" +
      `   Squares: ${computerLine}\n` +
      `   Score: ${computerScore}\n\n` +
      "Human:\n" +
      `   Squares: ${humanLine}\n` +
      `   Score: ${humanScore}\n\n` +
      `First Turn: ${firstTurnLabel}\n` +
      `Next Turn: ${nextTurnLabel}\n`
    );
  }

  /**
   * Parse a snapshot string into a JS object.
   * This assumes the same structure produced by serializeSnapshot.
   *
   * @returns {{
   *  computerSquares: number[],
   *  humanSquares: number[],
   *  computerScore: number,
   *  humanScore: number,
   *  firstTurnId: "HUMAN" | "COMPUTER",
   *  nextTurnId: "HUMAN" | "COMPUTER"
   * }}
   */
  static parseSnapshot(text) {
    const lines = text.split(/\r?\n/).map((s) => s.trim());

    const findLine = (prefix) => {
      const line = lines.find((l) => l.startsWith(prefix));
      if (!line) throw new Error(`Cannot find line starting with "${prefix}"`);
      return line;
    };

    const parseSquares = (line) => {
      // line like: "Squares: 1 2 3 0 5 6"
      const afterColon = line.split(":")[1];
      if (!afterColon) throw new Error(`Bad squares line: "${line}"`);
      return afterColon
        .trim()
        .split(/\s+/)
        .filter((s) => s.length > 0)
        .map((s) => Number(s));
    };

    const parseScore = (line) => {
      // line like: "Score: 34"
      const afterColon = line.split(":")[1];
      if (!afterColon) throw new Error(`Bad score line: "${line}"`);
      const n = Number(afterColon.trim());
      if (!Number.isFinite(n)) throw new Error(`Score is not a number: "${line}"`);
      return n;
    };

    const compSquaresLine = findLine("Squares:");
    const compScoreLine = findLine("Score:");
    // find AFTER the "Human:" line for human squares/score
    const humanIdx = lines.findIndex((l) => l === "Human:");
    if (humanIdx === -1) throw new Error('Missing "Human:" section');
    const humanSquaresLine = lines
      .slice(humanIdx + 1)
      .find((l) => l.startsWith("Squares:"));
    const humanScoreLine = lines
      .slice(humanIdx + 1)
      .find((l) => l.startsWith("Score:"));

    if (!humanSquaresLine || !humanScoreLine) {
      throw new Error("Cannot find human squares/score lines");
    }

    const firstTurnLine = findLine("First Turn:");
    const nextTurnLine = findLine("Next Turn:");

    const computerSquares = parseSquares(compSquaresLine);
    const humanSquares = parseSquares(humanSquaresLine);
    const computerScore = parseScore(compScoreLine);
    const humanScore = parseScore(humanScoreLine);

    const firstTurnLabel = firstTurnLine.split(":")[1].trim(); // "Computer" or "Human"
    const nextTurnLabel = nextTurnLine.split(":")[1].trim();

    const mapLabel = (label) => {
      if (label.toLowerCase() === "computer") return "COMPUTER";
      if (label.toLowerCase() === "human") return "HUMAN";
      throw new Error(`Unknown player label: "${label}"`);
    };

    const firstTurnId = mapLabel(firstTurnLabel);
    const nextTurnId = mapLabel(nextTurnLabel);

    return {
      computerSquares,
      humanSquares,
      computerScore,
      humanScore,
      firstTurnId,
      nextTurnId
    };
  }
}
