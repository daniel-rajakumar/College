
// js/model/Tournament.js

// Tournament = tournament-wide state: scores + who starts + advantage system.
// Advantage flags are static so Human/Computer can query them from anywhere.

export class Tournament {
  // Who gets advantage / owns advantage
  static Side = {
    None: "None",
    Human: "Human",
    Computer: "Computer",
  };

  // --- Static advantage state, shared across the whole app ---
  static advantageApplied = false;
  static advantageSquare = 0;

  static protectHumanAdvantage = false;
  static protectComputerAdvantage = false;
  static advantageOwner = Tournament.Side.None;

  constructor() {
    this.tournamentScoreHuman = 0;
    this.tournamentScoreComputer = 0;

    // who should act next (used by GameRound when continuing / next round)
    this.isHumanTurn = true;
    this.firstPlayerIsHuman = true;

    // queued advantage for NEXT round
    this.pendingAdvantageSquare = 0;
    this.pendingAdvantageFor = Tournament.Side.None;
  }

  // ---------- Simple getters/setters for turn metadata ----------

  getIsHumanTurn() {
    return this.isHumanTurn;
  }

  setIsHumanTurn(h) {
    this.isHumanTurn = !!h;
  }

  getFirstPlayerIsHuman() {
    return this.firstPlayerIsHuman;
  }

  setFirstPlayerIsHuman(isHuman) {
    this.firstPlayerIsHuman = !!isHuman;
  }

  // ---------- Advantage: shared static flags ----------

  static getAdvantageApplied() {
    return Tournament.advantageApplied;
  }

  static getAdvantageSquare() {
    return Tournament.advantageSquare;
  }

  static isHumanAdvantageProtected() {
    return Tournament.protectHumanAdvantage;
  }

  static isComputerAdvantageProtected() {
    return Tournament.protectComputerAdvantage;
  }

  static getAdvantageOwner() {
    return Tournament.advantageOwner;
  }

  static clearAdvantageProtectionForHuman() {
    Tournament.protectHumanAdvantage = false;
    if (!Tournament.protectComputerAdvantage) {
      Tournament.advantageApplied = false;
      Tournament.advantageOwner = Tournament.Side.None;
    }
  }

  static clearAdvantageProtectionForComputer() {
    Tournament.protectComputerAdvantage = false;
    if (!Tournament.protectHumanAdvantage) {
      Tournament.advantageApplied = false;
      Tournament.advantageOwner = Tournament.Side.None;
    }
  }

  // ---------- Advantage helpers (instance + static mix) ----------

  static calculateAdvantageSquare(winningScore) {
    let sum = 0;
    let score = Math.max(0, Math.floor(winningScore));
    while (score > 0) {
      sum += score % 10;
      score = Math.floor(score / 10);
    }
    return sum;
  }

  /**
   * Called at end of a round to decide who gets the advantage next round.
   * Does NOT actually cover any square yet; that happens in applyAdvantageToNewRound().
   *
   * @param {boolean} winnerWasFirstPlayer
   * @param {boolean} winnerIsHuman
   * @param {number} winningScore - score used to compute advantage square
   */
  applyHandicap(winnerWasFirstPlayer, winnerIsHuman, winningScore) {
    const advSquare = Tournament.calculateAdvantageSquare(winningScore);
    Tournament.advantageSquare = advSquare;

    let forWhom;
    if (winnerWasFirstPlayer) {
      // winner started -> OTHER side gets advantage next round
      forWhom = winnerIsHuman ? Tournament.Side.Computer : Tournament.Side.Human;
    } else {
      // winner did not start -> WINNER gets advantage
      forWhom = winnerIsHuman ? Tournament.Side.Human : Tournament.Side.Computer;
    }

    this.pendingAdvantageSquare = advSquare;
    this.pendingAdvantageFor = forWhom;

    console.log(
      `[Advantage queued for next round] Square ${advSquare} -> ${
        forWhom === Tournament.Side.Human ? "Human" : "Computer"
      }`
    );
  }

  /**
   * Call this right after you create new Boards for a round.
   * This actually covers the advantage square and turns on protection flags.
   *
   * @param {Board} humanBoard
   * @param {Board} computerBoard
   */
  applyAdvantageToNewRound(humanBoard, computerBoard) {
    // reset per-round flags
    Tournament.advantageApplied = false;
    Tournament.advantageOwner = Tournament.Side.None;
    Tournament.protectHumanAdvantage = false;
    Tournament.protectComputerAdvantage = false;

    if (
      this.pendingAdvantageFor === Tournament.Side.None ||
      this.pendingAdvantageSquare <= 0
    ) {
      return;
    }

    const square = this.pendingAdvantageSquare;

    if (this.pendingAdvantageFor === Tournament.Side.Human) {
      humanBoard.coverSquare(square);
      Tournament.protectHumanAdvantage = true;
      Tournament.advantageOwner = Tournament.Side.Human;
    } else {
      computerBoard.coverSquare(square);
      Tournament.protectComputerAdvantage = true;
      Tournament.advantageOwner = Tournament.Side.Computer;
    }

    Tournament.advantageApplied = true;

    // clear queue
    this.pendingAdvantageSquare = 0;
    this.pendingAdvantageFor = Tournament.Side.None;
  }

  // ---------- Scores ----------

  /**
   * Update tournament scores based on a round result.
   * Mirrors your C++ logic.
   */
  updateScores(
    humanWonByCover,
    humanWonByUncover,
    computerWonByCover,
    computerWonByUncover,
    humanScore,
    computerScore
  ) {
    if (humanWonByCover) {
      this.tournamentScoreHuman += computerScore;
    }
    if (humanWonByUncover) {
      this.tournamentScoreHuman += humanScore;
    }
    if (computerWonByCover) {
      this.tournamentScoreComputer += humanScore;
    }
    if (computerWonByUncover) {
      this.tournamentScoreComputer += computerScore;
    }
  }

  getScores() {
    return {
      human: this.tournamentScoreHuman,
      computer: this.tournamentScoreComputer,
    };
  }

  logScoreBoard() {
    const { human, computer } = this.getScores();
    console.log("\n~~~~~~~~~[SCORE BOARD]~~~~~~~~~~");
    console.log("Your Score: " + human);
    console.log("Computer's Score: " + computer);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n");
  }

  declareTournamentWinner() {
    const { human, computer } = this.getScores();

    if (human > computer) {
      console.log(`You win the tournament with a score of ${human}!`);
    } else if (computer > human) {
      console.log(`Computer wins the tournament with a score of ${computer}!`);
    } else {
      console.log("The tournament is a draw!");
    }
  }
}







