
// js/ui/View.js

// TextUI-style helpers & a simple BoardView for console output

export const USE_COLOR = true;

export const RESET  = "\x1b[0m";
export const DIM    = "\x1b[2m";
export const BOLD   = "\x1b[1m";
export const CYAN   = "\x1b[36m";
export const GREEN  = "\x1b[32m";
export const YELLOW = "\x1b[33m";

export function c(code) {
  return USE_COLOR ? code : "";
}

export function hr(ch = "-", w = 60) {
  let s = "";
  for (let i = 0; i < w; ++i) s += ch;
  console.log(s);
}

export function banner(title, ch = "=", w = 60) {
  hr(ch, w);
  console.log(c(BOLD) + title + c(RESET));
  hr(ch, w);
}

export function section(title) {
  console.log("\n" + c(CYAN) + "> " + title + c(RESET));
}

// fixed-width-ish cell (not heavily used)
export function cell(i, covered, isAdv = false) {
  if (covered) {
    console.log(c(DIM) + String(i).padStart(2, "-") + c(RESET) + " ");
  } else if (isAdv) {
    console.log(c(YELLOW) + c(BOLD) + String(i).padStart(2, " ") + c(RESET) + " ");
  } else {
    console.log(String(i).padStart(2, " ") + " ");
  }
}

// BoardView used by Human/Computer/Round
export class BoardView {
  constructor(board, name) {
    this.board = board;
    this.playerName = name;
  }

  /**
   * Displays the board.
   * @param {boolean} advantageApplied
   * @param {number} advantageSquare
   */
  display(advantageApplied = false, advantageSquare = 0) {
    let s = `${this.playerName}: [ `;
    for (let i = 1; i <= this.board.getSize(); ++i) {
      const covered = this.board.isSquareCovered(i);
      s += covered ? "_" : i.toString();
      if (advantageApplied && i === advantageSquare) s += "*";
      s += (i < this.board.getSize()) ? ", " : " ]";
    }
    console.log(s);
  }
}


