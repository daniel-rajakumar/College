// js/ui/View.js
export class View {
  constructor() {
    this.computerRowEl = document.getElementById('computer-row');
    this.humanRowEl = document.getElementById('human-row');
    this.logEl = document.getElementById('log');
  }

  renderBoards(humanBoard, computerBoard) {
    this.computerRowEl.innerHTML = this.#renderRow(computerBoard);
    this.humanRowEl.innerHTML = this.#renderRow(humanBoard);
  }

  #renderRow(board) {
    return board.squares
      .map(v => (v === 0 ? `<span class="square covered">X</span>` :
                         `<span class="square uncovered">${v}</span>`))
      .join('');
  }

  log(message) {
    this.logEl.textContent += message + '\n';
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  updateScores(hTotal, cTotal) {
    document.getElementById('human-total-score').textContent = hTotal;
    document.getElementById('computer-total-score').textContent = cTotal;
  }

  updateTurnInfo(first, next, advOwner, advSquare) {
    document.getElementById('first-player-label').textContent = first || '-';
    document.getElementById('next-player-label').textContent = next || '-';
    const adv = advOwner ? `${advOwner} (square ${advSquare})` : 'None';
    document.getElementById('advantage-label').textContent = adv;
  }
}
