/**
 * Serialize/parse tournament and round state to the text snapshot format.
 */
export class Serializer {

  /**
   * Serialize current boards and scores into the snapshot text format.
   * @param {Object} params
   * @returns {string}
   */
  static serializeSnapshot({
    computerBoard,
    humanBoard,
    computerScore,
    humanScore,
    firstTurnId,
    nextTurnId,
    phase = "awaitingRoll",
    currentDice = { d1: null, d2: null, sum: null },
    advantageLock = null,
    queuedRolls = []
  }) {
    const compArr = computerBoard.toNumberArrayFormat();
    const humanArr = humanBoard.toNumberArrayFormat();

    const firstTurnLabel = firstTurnId === "COMPUTER" ? "Computer" : "Human";
    const nextTurnLabel = nextTurnId === "COMPUTER" ? "Computer" : "Human";

    const computerLine = compArr.join(" ");
    const humanLine = humanArr.join(" ");

    const base =
      "Computer:\n" +
      `   Squares: ${computerLine}\n` +
      `   Score: ${computerScore}\n\n` +
      "Human:\n" +
      `   Squares: ${humanLine}\n` +
      `   Score: ${humanScore}\n\n` +
      `First Turn: ${firstTurnLabel}\n` +
      `Next Turn: ${nextTurnLabel}\n`;

    const meta = [];
    meta.push(`# Phase: ${phase}`);
    meta.push(
      `# CurrentDice: ${currentDice.d1 ?? "-"} ${currentDice.d2 ?? "-"} (sum=${currentDice.sum ?? "-"})`
    );
    if (advantageLock && advantageLock.squareNumber) {
      meta.push(
        `# AdvantageLock: ${advantageLock.playerId} ${advantageLock.squareNumber} unlocked=${advantageLock.unlocked}`
      );
    }
    if (queuedRolls && queuedRolls.length) {
      const rollsText = queuedRolls
        .map((r) => (r.d2 != null ? `${r.d1},${r.d2}` : `${r.d1}`))
        .join(" | ");
      meta.push(`# QueuedRolls: ${rollsText}`);
    }

    return base + (meta.length ? "\n" + meta.join("\n") + "\n" : "");
  }


  /**
   * Parse snapshot text back into structured state for loading.
   * @param {string} text
   * @returns {Object}
   */
  static parseSnapshot(text) {
    const lines = text.split(/\r?\n/).map((s) => s.trim());

    const findLine = (prefix) => {
      const line = lines.find((l) => l.startsWith(prefix));
      if (!line) throw new Error(`Cannot find line starting with "${prefix}"`);
      return line;
    };

    const parseSquares = (line) => {

      const afterColon = line.split(":")[1];
      if (!afterColon) throw new Error(`Bad squares line: "${line}"`);
      return afterColon
        .trim()
        .split(/\s+/)
        .filter((s) => s.length > 0)
        .map((s) => Number(s));
    };

    const parseScore = (line) => {

      const afterColon = line.split(":")[1];
      if (!afterColon) throw new Error(`Bad score line: "${line}"`);
      const n = Number(afterColon.trim());
      if (!Number.isFinite(n)) throw new Error(`Score is not a number: "${line}"`);
      return n;
    };

    const compSquaresLine = findLine("Squares:");
    const compScoreLine = findLine("Score:");

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

    const firstTurnLabel = firstTurnLine.split(":")[1].trim();
    const nextTurnLabel = nextTurnLine.split(":")[1].trim();

    const mapLabel = (label) => {
      if (label.toLowerCase() === "computer") return "COMPUTER";
      if (label.toLowerCase() === "human") return "HUMAN";
      throw new Error(`Unknown player label: "${label}"`);
    };

    const firstTurnId = mapLabel(firstTurnLabel);
    const nextTurnId = mapLabel(nextTurnLabel);

    let phase = "awaitingRoll";
    let currentDice = { d1: null, d2: null, sum: null };
    let advantageLock = null;
    let queuedRolls = [];

    lines
      .filter((l) => l.startsWith("#"))
      .forEach((metaLine) => {
        const body = metaLine.slice(1).trim();
        if (body.startsWith("Phase:")) {
          phase = body.split(":")[1].trim();
        } else if (body.startsWith("CurrentDice:")) {
          const parts = body.replace("CurrentDice:", "").trim().split(/\s+/);
          const d1 = parts[0] === "-" ? null : Number(parts[0]);
          const d2 = parts[1] === "-" ? null : Number(parts[1]);
          const sumMatch = body.match(/sum=([0-9\-]+)/i);
          let sum = null;
          if (sumMatch) {
            const raw = sumMatch[1];
            sum = raw === "-" ? null : Number(raw);
          }
          currentDice = { d1, d2, sum };
        } else if (body.startsWith("AdvantageLock:")) {
          const parts = body.replace("AdvantageLock:", "").trim().split(/\s+/);
          if (parts.length >= 3) {
            advantageLock = {
              playerId: parts[0],
              squareNumber: Number(parts[1]),
              unlocked: /true/i.test(parts[2]),
            };
          }
        } else if (body.startsWith("QueuedRolls:")) {
          const payload = body.replace("QueuedRolls:", "").trim();
          queuedRolls = payload
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((entry) => {
              const vals = entry.split(",").map((v) => Number(v.trim()));
              if (vals.length === 1) return { d1: vals[0], d2: null };
              return { d1: vals[0], d2: vals[1] };
            });
        }
      });

    return {
      computerSquares,
      humanSquares,
      computerScore,
      humanScore,
      firstTurnId,
      nextTurnId,
      phase,
      currentDice,
      advantageLock,
      queuedRolls,
    };
  }
}
