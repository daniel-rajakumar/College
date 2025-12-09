// js/main.js
import { Dice } from './model/Dice.js';
import { Tournament } from './model/Tournament.js';
import { View } from './ui/View.js';
import { Serializer } from './model/Serializer.js';

let dice = new Dice();
let tournament = null;
let view = null;

// current dice state for the *last* roll in this turn
let currentDice = { d1: null, d2: null, sum: null };
let pendingManualNumDice = 2; // used by the manual dice modal

// ------------ Screen helpers (welcome / setup / game / end) ------------

function showScreen(name) {
  const ids = ['welcome', 'setup', 'game', 'end'];
  ids.forEach(id => {
    const el = document.getElementById(`screen-${id}`);
    if (!el) return;
    el.classList.toggle('active', id === name);
  });
}

// -----------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  view = new View();

  // start on welcome screen
  showScreen('welcome');

  // ====== Welcome screen ======
  document.getElementById('welcome-new-game-btn')?.addEventListener('click', () => {
    showScreen('setup');
  });

  document.getElementById('welcome-load-btn')?.addEventListener('click', () => {
    onLoadGame(true);
    if (tournament && tournament.currentRound) {
      showScreen('game');
    }
  });

  // ====== Setup screen ======
  document.getElementById('setup-back-btn')?.addEventListener('click', () => {
    showScreen('welcome');
  });

  document.getElementById('setup-roll-btn')?.addEventListener('click', () => {
    onStartRound();
    if (!tournament?.currentRound) return;

    document.getElementById('setup-roll-result').textContent =
      `First player: ${tournament.currentRound.firstPlayer}`;

    document.getElementById('setup-continue-btn').disabled = false;
  });

  document.getElementById('setup-continue-btn')?.addEventListener('click', () => {
    showScreen('game');
    if (tournament.currentRound.firstPlayer === 'Computer') {
      setTimeout(computerTurn, 500);
    }
  });

  // ====== End screen ======
  document.getElementById('end-play-again-btn')?.addEventListener('click', () => {
    if (!tournament) return;
    tournament.startNewRound();
    currentDice = { d1: null, d2: null, sum: null };
    document.getElementById('round-status').textContent = 'Round in progress';
    renderAll();
    showScreen('game');
    if (tournament.currentRound.firstPlayer === 'Computer') {
      setTimeout(computerTurn, 500);
    }
  });

  document.getElementById('end-exit-btn')?.addEventListener('click', () => {
    showScreen('welcome');
  });

  // ====== Game screen buttons ======
  document.getElementById('save-game-btn')?.addEventListener('click', onSaveGame);
  document.getElementById('load-game-btn')?.addEventListener('click', () => onLoadGame(false));

  document.getElementById('roll-one-die-btn')?.addEventListener('click', () => handleRollClick(1));
  document.getElementById('roll-two-dice-btn')?.addEventListener('click', () => handleRollClick(2));

  // Manual move UI is disabled; old "Apply Move" is unused
  document.getElementById('apply-move-btn')?.classList.add('hidden-ui');

  document.getElementById('help-btn')?.addEventListener('click', onHelp);

  // show/hide hidden manual dice inputs based on radio (for logic)
  document.querySelectorAll('input[name="dice-mode"]').forEach(r => {
    r.addEventListener('change', () => {
      const box = document.getElementById('manual-dice-inputs');
      box.style.display = getDiceMode() === 'manual' ? 'block' : 'none';
    });
  });

  // ====== Manual dice modal ======
  document.getElementById('modal-confirm-btn')?.addEventListener('click', () => {
    const d1Val = document.getElementById('modal-die1').value;
    const d2Val = document.getElementById('modal-die2').value;

    if (!d1Val || (pendingManualNumDice === 2 && !d2Val)) {
      alert('Please select values for your dice.');
      return;
    }

    document.getElementById('die1-input').value = d1Val;
    document.getElementById('die2-input').value =
      pendingManualNumDice === 2 ? d2Val : 0;

    closeManualDiceModal();
    onRollDice(pendingManualNumDice);
  });

  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeManualDiceModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', closeManualDiceModal);

  // ====== Move modal listeners ======
  document.querySelectorAll('input[name="move-modal-type"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (currentDice.sum) populateMoveOptions(currentDice.sum);
    });
  });

  document.getElementById('move-modal-help-btn')?.addEventListener('click', () => {
    document.getElementById('move-modal-help-output').textContent =
      generateHelpText(currentDice.sum);
  });

  document.getElementById('move-modal-confirm-btn')?.addEventListener('click', () => {
    const type = document.querySelector('input[name="move-modal-type"]:checked').value;
    const val = document.getElementById('move-modal-options').value;

    if (!val) {
      alert("Select a valid move.");
      return;
    }

    const squares = val.split(',').map(Number);

    applyMove('Human', type, squares);
    view.log(`Human ${type} squares: ${squares.join(', ')}`);

    closeMoveModal();
    handleEndOfMove('Human');
  });

  document.getElementById('move-modal-cancel-btn')?.addEventListener('click', closeMoveModal);
  document.getElementById('move-modal-backdrop')?.addEventListener('click', closeMoveModal);

  // initial UI state
  updateTurnUI();
});

// -----------------------------------------------------------------------
//                               GAME LOGIC
// -----------------------------------------------------------------------

function onStartRound() {
  const size = parseInt(document.getElementById('board-size').value, 10);

  if (!tournament) {
    tournament = new Tournament(size, dice);
  } else {
    tournament.boardSize = size;
  }

  tournament.startNewRound();
  currentDice = { d1: null, d2: null, sum: null };

  document.getElementById('round-status').textContent = 'Round in progress';

  renderAll();
  view.log('Started new round');
}

// ---------- Dice helpers ----------

function getDiceMode() {
  return document.querySelector('input[name="dice-mode"]:checked')?.value || 'auto';
}

function handleRollClick(numDice) {
  if (getDiceMode() === 'manual') {
    openManualDiceModal(numDice);
  } else {
    onRollDice(numDice);
  }
}

function openManualDiceModal(numDice) {
  pendingManualNumDice = numDice;

  const die2Label = document.getElementById('modal-die2-label');
  const instr = document.getElementById('modal-instruction');

  if (numDice === 1) {
    die2Label.style.display = 'none';
    instr.textContent = 'Choose the value for your die.';
  } else {
    die2Label.style.display = 'block';
    instr.textContent = 'Choose values for both dice.';
  }

  document.getElementById('modal-die1').value = '';
  document.getElementById('modal-die2').value = '';

  document.getElementById('modal-backdrop').classList.remove('hidden');
  document.getElementById('manual-dice-modal').classList.remove('hidden');
}

function closeManualDiceModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
  document.getElementById('manual-dice-modal').classList.add('hidden');
}

// Rule: 1 die only allowed if 7–n are covered
function canUseNumDice(playerName, numDice) {
  const board =
    playerName === 'Human' ? tournament.human.board : tournament.computer.board;

  const n = board.size;
  for (let s = 7; s <= n; s++) {
    if (!board.isCovered(s)) return numDice === 2;
  }
  return true;
}

function updateDiceOptionsLabel(playerName) {
  if (!tournament?.currentRound) return;

  const board =
    playerName === 'Human' ? tournament.human.board : tournament.computer.board;

  let all7toNCovered = true;
  for (let s = 7; s <= board.size; s++) {
    if (!board.isCovered(s)) {
      all7toNCovered = false;
      break;
    }
  }

  const label = document.getElementById('dice-options-label');
  const rollOneBtn = document.getElementById('roll-one-die-btn');

  if (all7toNCovered) {
    label.textContent = 'You may roll 1 die or 2 dice.';
    rollOneBtn.classList.remove('hidden-ui');
  } else {
    label.textContent = 'You must roll 2 dice (7–n not fully covered).';
    rollOneBtn.classList.add('hidden-ui');
  }
}

function onRollDice(numDice) {
  if (!tournament?.currentRound) {
    alert('Start a round first.');
    return;
  }

  const player = tournament.currentRound.nextPlayer;
  if (player !== 'Human') {
    alert('It is not your turn.');
    return;
  }

  if (!canUseNumDice(player, numDice)) {
    alert('That number of dice is not allowed.');
    return;
  }

  const mode = getDiceMode();
  let d1, d2;

  if (mode === 'auto') {
    const roll = dice.roll(numDice);
    d1 = roll.d1;
    d2 = roll.d2;
  } else {
    d1 = parseInt(document.getElementById('die1-input').value, 10);
    d2 = numDice === 2 ? parseInt(document.getElementById('die2-input').value, 10) : 0;

    if (!d1 || (numDice === 2 && !d2)) {
      alert("Enter valid manual dice.");
      return;
    }
  }

  const sum = d1 + d2;
  currentDice = { d1, d2, sum };

  document.getElementById('dice-display').textContent =
    numDice === 2 ? `${d1} + ${d2} = ${sum}` : `${d1} = ${sum}`;

  updateDiceOptionsLabel(player);

  view.log(`Human rolled ${d1}${numDice === 2 ? ' + ' + d2 : ''} = ${sum}`);

  // open modal for choosing a move
  populateMoveOptions(sum);
  showMoveModal(sum);

  updateTurnUI();
}

// ---------- Move modal logic ----------

function getValidMovesForModal(sum, type) {
  return getValidMovesForPlayer(sum, 'Human', type)
    .map(m => ({ text: m.join(' + '), value: m.join(',') }));
}

function populateMoveOptions(sum) {
  const type = document.querySelector('input[name="move-modal-type"]:checked').value;
  const select = document.getElementById('move-modal-options');

  const moves = getValidMovesForModal(sum, type);

  select.innerHTML = '<option value="">-- Select a move --</option>';

  moves.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = m.text;
    select.appendChild(opt);
  });
}

function showMoveModal(sum) {
  document.getElementById('move-modal-sum').textContent = sum;
  populateMoveOptions(sum);
  document.getElementById('move-modal-backdrop').classList.remove('hidden');
  document.getElementById('move-modal').classList.remove('hidden');
}

function closeMoveModal() {
  document.getElementById('move-modal-backdrop').classList.add('hidden');
  document.getElementById('move-modal').classList.add('hidden');
  document.getElementById('move-modal-help-output').textContent = '';
}

// ---------- Board & moves ----------

function getCandidateSquaresForCover(board) {
  return board.squares.filter(v => v !== 0);
}

function getCandidateSquaresForUncover(board) {
  return board.squares
    .map((v, i) => (v === 0 ? i + 1 : null))
    .filter(v => v !== null);
}

function getCombinations(arr, max = 4) {
  const res = [];
  function backtrack(start, path) {
    if (path.length > 0 && path.length <= max) res.push([...path]);
    if (path.length === max) return;
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return res;
}

function getValidMovesForPlayer(sum, playerName, type) {
  const me = playerName === 'Human' ? tournament.human : tournament.computer;
  const op = playerName === 'Human' ? tournament.computer : tournament.human;

  const candidates =
    type === 'cover'
      ? getCandidateSquaresForCover(me.board)
      : getCandidateSquaresForUncover(op.board);

  return getCombinations(candidates, 4)
    .filter(c => c.reduce((a, b) => a + b, 0) === sum);
}

function applyMove(playerName, type, squares) {
  const me = playerName === 'Human' ? tournament.human : tournament.computer;
  const op = playerName === 'Human' ? tournament.computer : tournament.human;

  if (type === 'cover') {
    squares.forEach(s => me.board.cover(s));
  } else {
    squares.forEach(s => op.board.uncover(s));
  }
}

// ---------- Help mode ----------

function generateHelpText(sum) {
  const coverMoves = getValidMovesForPlayer(sum, 'Human', 'cover');
  const uncoverMoves = getValidMovesForPlayer(sum, 'Human', 'uncover');
  const best = chooseBestMoveForComputer(sum);

  let out = `Dice sum: ${sum}\n\nCover options:\n`;
  out += coverMoves.length
    ? coverMoves.map(m => '  ' + m.join(', ')).join('\n')
    : '  (none)\n';

  out += `\nUncover options:\n`;
  out += uncoverMoves.length
    ? uncoverMoves.map(m => '  ' + m.join(', ')).join('\n')
    : '  (none)\n';

  if (!best) {
    out += `\nRecommendation: End turn (no good moves).`;
  } else {
    out += `\nRecommendation: ${best.type.toUpperCase()} [${best.squares.join(', ')}]`;
  }

  return out;
}

function onHelp() {
  if (!tournament?.currentRound) return;
  if (tournament.currentRound.nextPlayer !== 'Human') {
    alert('Help is only available on your turn.');
    return;
  }
  if (!currentDice.sum) {
    alert('Roll dice first.');
    return;
  }

  document.getElementById('help-output').textContent =
    generateHelpText(currentDice.sum);
}

// ---------- Computer AI ----------

function chooseBestMoveForComputer(sum) {
  const cover = getValidMovesForPlayer(sum, 'Computer', 'cover');
  const uncover = getValidMovesForPlayer(sum, 'Computer', 'uncover');

  const pickBest = moves =>
    moves.reduce((best, cur) => {
      if (!best) return cur;
      if (cur.length > best.length) return cur;
      const curSum = cur.reduce((a, b) => a + b, 0);
      const bestSum = best.reduce((a, b) => a + b, 0);
      return (cur.length === best.length && curSum > bestSum) ? cur : best;
    }, null);

  let best = pickBest(cover);
  if (best) return { type: 'cover', squares: best };

  best = pickBest(uncover);
  if (best) return { type: 'uncover', squares: best };

  return null;
}

function computerTurn() {
  const round = tournament.currentRound;
  if (round.nextPlayer !== 'Computer') return;

  updateTurnUI();

  // dice count selection
  const board = tournament.computer.board;
  let all7toNCovered = true;
  for (let s = 7; s <= board.size; s++) {
    if (!board.isCovered(s)) {
      all7toNCovered = false;
      break;
    }
  }
  const numDice = all7toNCovered ? 1 : 2;

  const roll = dice.roll(numDice);
  const sum = roll.d1 + roll.d2;

  currentDice = { d1: roll.d1, d2: roll.d2, sum };
  document.getElementById('dice-display').textContent =
    numDice === 2 ? `${roll.d1} + ${roll.d2} = ${sum}` : `${roll.d1} = ${sum}`;

  view.log(`Computer rolled ${roll.d1}${numDice === 2 ? ' + ' + roll.d2 : ''} = ${sum}`);

  const move = chooseBestMoveForComputer(sum);
  if (!move) {
    view.log('Computer has no legal moves. Turn ends.');
    round.nextPlayer = 'Human';
    currentDice = { d1: null, d2: null, sum: null };
    renderAll();
    return;
  }

  applyMove('Computer', move.type, move.squares);
  view.log(
    `Computer ${move.type === 'cover' ? 'covers' : 'uncovers'} squares: ${move.squares.join(', ')}`
  );

  handleEndOfMove('Computer');
}

// ---------- End of move ----------

function handleEndOfMove(player) {
  const round = tournament.currentRound;

  if (round.checkWin()) {
    const score = round.computeRoundScore();
    const winner = round.winner;

    tournament.finishRound();

    view.log(`${winner.name} wins by ${round.winnerReason} and earns ${score} points.`);
    document.getElementById('round-status').textContent =
      `Round over. Winner: ${winner.name}`;

    const tourWinner = tournament.getWinnerOfTournament();
    document.getElementById('end-summary').textContent =
      `${winner.name} wins this round (${score} pts).\n` +
      `Human: ${tournament.human.totalScore}, Computer: ${tournament.computer.totalScore}\n` +
      (tourWinner ? `${tourWinner.name} is leading.` : `Tournament is tied.`);

    renderAll();
    showScreen('end');
    return;
  }

  if (!hasAnyMoveForPlayer(currentDice.sum, player)) {
    view.log(`${player} cannot move. Turn ends.`);
    round.nextPlayer = player === 'Human' ? 'Computer' : 'Human';
    currentDice = { d1: null, d2: null, sum: null };
  } else {
    // must roll again
    if (player === 'Human') {
      currentDice = { d1: null, d2: null, sum: null };
    }
  }

  renderAll();

  if (round.nextPlayer === 'Computer') {
    setTimeout(computerTurn, 500);
  }
}

// ---------- Move availability ----------

function hasAnyMoveForPlayer(sum, player) {
  return (
    getValidMovesForPlayer(sum, player, 'cover').length > 0 ||
    getValidMovesForPlayer(sum, player, 'uncover').length > 0
  );
}

// ---------- Serialization ----------

function onSaveGame() {
  if (!tournament?.currentRound) return;

  const text = Serializer.save(tournament, tournament.currentRound);

  const saveOut = document.getElementById('save-output');
  saveOut.value = text;
  saveOut.classList.remove('hidden-ui');

  view.log('Game saved.');
}

function onLoadGame(fromWelcome = false) {
  let text = fromWelcome
    ? document.getElementById('welcome-load-input').value.trim()
    : document.getElementById('load-input')?.value.trim();

  if (!text) {
    alert('Paste save text first.');
    return;
  }

  try {
    const state = Serializer.load(text);
    const size = state.computerSquares.length;

    dice = new Dice();
    tournament = new Tournament(size, dice);

    tournament.human.board.squares = state.humanSquares;
    tournament.computer.board.squares = state.computerSquares;
    tournament.human.totalScore = state.humanScore;
    tournament.computer.totalScore = state.computerScore;

    tournament.startNewRound();
    tournament.currentRound.firstPlayer = state.firstTurn;
    tournament.currentRound.nextPlayer = state.nextTurn;

    currentDice = { d1: null, d2: null, sum: null };

    document.getElementById('round-status').textContent =
      'Round in progress (loaded)';

    renderAll();
    view.log('Game loaded.');
  } catch {
    alert('Save text invalid.');
  }
}

// ---------- UI state ----------

function updateTurnUI() {
  const moveSection = document.getElementById('move-section');
  const helpSection = document.getElementById('help-section');
  const rollOne = document.getElementById('roll-one-die-btn');
  const rollTwo = document.getElementById('roll-two-dice-btn');

  // Hide old move UI
  moveSection?.classList.add('hidden-ui');

  if (!tournament?.currentRound) {
    helpSection?.classList.add('hidden-ui');
    rollOne.disabled = true;
    rollTwo.disabled = true;
    return;
  }

  const round = tournament.currentRound;
  const isHuman = round.nextPlayer === 'Human';
  const hasRoll = currentDice.sum !== null;

  rollOne.disabled = !isHuman;
  rollTwo.disabled = !isHuman;

  if (!isHuman) {
    helpSection?.classList.add('hidden-ui');
    return;
  }

  if (!hasRoll) {
    helpSection?.classList.add('hidden-ui');
  } else {
    helpSection?.classList.remove('hidden-ui');
    rollOne.disabled = true;
    rollTwo.disabled = true;
  }
}

// ---------- Render everything ----------

function renderAll() {
  if (!tournament) {
    updateTurnUI();
    return;
  }

  const round = tournament.currentRound;

  view.renderBoards(tournament.human.board, tournament.computer.board);
  view.updateScores(tournament.human.totalScore, tournament.computer.totalScore);
  view.updateTurnInfo(
    round.firstPlayer,
    round.nextPlayer,
    tournament.advantageOwner,
    tournament.advantageSquare
  );

  updateDiceOptionsLabel(round.nextPlayer);
  updateTurnUI();
}
