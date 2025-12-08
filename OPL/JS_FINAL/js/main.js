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
  const newGameBtn = document.getElementById('welcome-new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      showScreen('setup');
    });
  }

  const welcomeLoadBtn = document.getElementById('welcome-load-btn');
  if (welcomeLoadBtn) {
    welcomeLoadBtn.addEventListener('click', () => {
      onLoadGame(true); // load from welcome textarea
      if (tournament && tournament.currentRound) {
        showScreen('game');
      }
    });
  }

  // ====== Setup screen ======
  const setupBackBtn = document.getElementById('setup-back-btn');
  if (setupBackBtn) {
    setupBackBtn.addEventListener('click', () => {
      showScreen('welcome');
    });
  }

  const setupRollBtn = document.getElementById('setup-roll-btn');
  if (setupRollBtn) {
    setupRollBtn.addEventListener('click', () => {
      onStartRound(); // build tournament + round
      if (!tournament || !tournament.currentRound) return;

      const first = tournament.currentRound.firstPlayer;
      const resEl = document.getElementById('setup-roll-result');
      if (resEl) {
        resEl.textContent = `First player: ${first}`;
      }
      const contBtn = document.getElementById('setup-continue-btn');
      if (contBtn) contBtn.disabled = false;
    });
  }

  const setupContinueBtn = document.getElementById('setup-continue-btn');
  if (setupContinueBtn) {
    setupContinueBtn.addEventListener('click', () => {
      showScreen('game');
      // if computer is first, let it move immediately
      if (
        tournament &&
        tournament.currentRound &&
        tournament.currentRound.firstPlayer === 'Computer'
      ) {
        setTimeout(computerTurn, 500);
      }
    });
  }

  // ====== End screen ======
  const endPlayAgainBtn = document.getElementById('end-play-again-btn');
  if (endPlayAgainBtn) {
    endPlayAgainBtn.addEventListener('click', () => {
      if (!tournament) return;
      tournament.startNewRound();
      currentDice = { d1: null, d2: null, sum: null };
      const roundStatus = document.getElementById('round-status');
      if (roundStatus) roundStatus.textContent = 'Round in progress';
      renderAll();
      showScreen('game');
      if (tournament.currentRound.firstPlayer === 'Computer') {
        setTimeout(computerTurn, 500);
      }
    });
  }

  const endExitBtn = document.getElementById('end-exit-btn');
  if (endExitBtn) {
    endExitBtn.addEventListener('click', () => {
      showScreen('welcome');
    });
  }

  // ====== Game screen buttons ======
  const saveBtn = document.getElementById('save-game-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', onSaveGame);
  }

  const loadBtn = document.getElementById('load-game-btn');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => onLoadGame(false));
  }

  const rollOneBtn = document.getElementById('roll-one-die-btn');
  if (rollOneBtn) {
    rollOneBtn.addEventListener('click', () => handleRollClick(1));
  }

  const rollTwoBtn = document.getElementById('roll-two-dice-btn');
  if (rollTwoBtn) {
    rollTwoBtn.addEventListener('click', () => handleRollClick(2));
  }

  const applyMoveBtn = document.getElementById('apply-move-btn');
  if (applyMoveBtn) {
    applyMoveBtn.addEventListener('click', onApplyHumanMove);
  }

  const helpBtn = document.getElementById('help-btn');
  if (helpBtn) {
    helpBtn.addEventListener('click', onHelp);
  }

  // show/hide hidden manual dice inputs based on radio (for logic)
  const diceModeRadios = document.querySelectorAll('input[name="dice-mode"]');
  diceModeRadios.forEach(r => {
    r.addEventListener('change', () => {
      const mode = getDiceMode();
      const box = document.getElementById('manual-dice-inputs');
      if (box) box.style.display = mode === 'manual' ? 'block' : 'none';
    });
  });

  // ====== Manual dice modal ======
  const modalConfirm = document.getElementById('modal-confirm-btn');
  const modalCancel = document.getElementById('modal-cancel-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (modalConfirm) {
    modalConfirm.addEventListener('click', () => {
      const d1Val = document.getElementById('modal-die1')?.value;
      const d2Val = document.getElementById('modal-die2')?.value;

      if (!d1Val || (pendingManualNumDice === 2 && !d2Val)) {
        alert('Please select values for the dice.');
        return;
      }

      // write into hidden inputs used by onRollDice
      const die1Input = document.getElementById('die1-input');
      const die2Input = document.getElementById('die2-input');
      if (die1Input) die1Input.value = d1Val;
      if (die2Input) die2Input.value = pendingManualNumDice === 2 ? d2Val : 0;

      closeManualDiceModal();
      onRollDice(pendingManualNumDice);
    });
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', closeManualDiceModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeManualDiceModal);
  }

  // initial UI state: no round yet
  updateTurnUI();
});

// -----------------------------------------------------------------------
//                               GAME LOGIC
// -----------------------------------------------------------------------

function onStartRound() {
  const sizeEl = document.getElementById('board-size');
  const size = sizeEl ? parseInt(sizeEl.value, 10) : 9;

  if (!tournament) {
    tournament = new Tournament(size, dice);
  } else {
    tournament.boardSize = size;
  }
  tournament.startNewRound();
  currentDice = { d1: null, d2: null, sum: null };

  const roundStatus = document.getElementById('round-status');
  if (roundStatus) roundStatus.textContent = 'Round in progress';

  renderAll();
  view.log('Started new round');
}

// ---------- Dice helpers ----------

function getDiceMode() {
  const radio = document.querySelector('input[name="dice-mode"]:checked');
  return radio ? radio.value : 'auto';
}

// When user clicks roll buttons: if manual → open modal; else roll directly.
function handleRollClick(numDice) {
  if (getDiceMode() === 'manual') {
    openManualDiceModal(numDice);
  } else {
    onRollDice(numDice);
  }
}

function openManualDiceModal(numDice) {
  pendingManualNumDice = numDice;

  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('manual-dice-modal');
  const die2Label = document.getElementById('modal-die2-label');
  const instr = document.getElementById('modal-instruction');

  if (die2Label && instr) {
    if (numDice === 1) {
      die2Label.style.display = 'none';
      instr.textContent = 'Choose the value for your die.';
    } else {
      die2Label.style.display = 'block';
      instr.textContent = 'Choose values for both dice.';
    }
  }

  const d1Sel = document.getElementById('modal-die1');
  const d2Sel = document.getElementById('modal-die2');
  if (d1Sel) d1Sel.value = '';
  if (d2Sel) d2Sel.value = '';

  if (backdrop) backdrop.classList.remove('hidden');
  if (modal) modal.classList.remove('hidden');
}

function closeManualDiceModal() {
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('manual-dice-modal');
  if (backdrop) backdrop.classList.add('hidden');
  if (modal) modal.classList.add('hidden');
}

// check rule: if any of 7..n uncovered -> MUST use 2 dice
// if all 7..n covered -> can use 1 or 2
function canUseNumDice(playerName, numDice) {
  const board =
    playerName === 'Human' ? tournament.human.board : tournament.computer.board;

  const n = board.size;
  let all7toNCovered = true;
  for (let s = 7; s <= n; s++) {
    if (!board.isCovered(s)) {
      all7toNCovered = false;
      break;
    }
  }

  if (!all7toNCovered) {
    // must roll 2 dice
    return numDice === 2;
  }
  // all 7..n are covered -> allowed 1 or 2 dice
  return numDice === 1 || numDice === 2;
}

function updateDiceOptionsLabel(playerName) {
  if (!tournament || !tournament.currentRound) return;

  const board =
    playerName === 'Human' ? tournament.human.board : tournament.computer.board;

  const n = board.size;
  let all7toNCovered = true;
  for (let s = 7; s <= n; s++) {
    if (!board.isCovered(s)) {
      all7toNCovered = false;
      break;
    }
  }

  const label = document.getElementById('dice-options-label');
  const rollOneBtn = document.getElementById('roll-one-die-btn');

  if (all7toNCovered) {
    if (label) label.textContent = 'You may roll 1 die or 2 dice.';
    // show 1-die button
    if (rollOneBtn) rollOneBtn.classList.remove('hidden-ui');
  } else {
    if (label) label.textContent =
      'You must roll 2 dice (7–n not fully covered).';
    // hide 1-die button
    if (rollOneBtn) rollOneBtn.classList.add('hidden-ui');
  }
}



function onRollDice(numDice) {
  if (!tournament || !tournament.currentRound) {
    alert('Start a round first.');
    return;
  }
  const playerName = tournament.currentRound.nextPlayer;
  if (playerName !== 'Human') {
    alert('It is not your turn.');
    return;
  }
  if (!canUseNumDice(playerName, numDice)) {
    alert('That number of dice is not allowed right now.');
    return;
  }

  const mode = getDiceMode();
  let d1, d2;
  if (mode === 'auto') {
    const roll = dice.roll(numDice);
    d1 = roll.d1;
    d2 = roll.d2;
  } else {
    const die1Input = document.getElementById('die1-input');
    const die2Input = document.getElementById('die2-input');
    const i1 = die1Input ? parseInt(die1Input.value, 10) : NaN;
    const i2 =
      numDice === 2 && die2Input ? parseInt(die2Input.value, 10) : 0;
    if (
      Number.isNaN(i1) ||
      i1 < 1 ||
      i1 > 6 ||
      (numDice === 2 && (Number.isNaN(i2) || i2 < 1 || i2 > 6))
    ) {
      alert('Enter valid manual dice (1–6).');
      return;
    }
    d1 = i1;
    d2 = i2;
  }

  const sum = d1 + d2;
  currentDice = { d1, d2, sum };
  const diceText = numDice === 2 ? `${d1} + ${d2} = ${sum}` : `${d1} = ${sum}`;
  const diceDisplay = document.getElementById('dice-display');
  if (diceDisplay) diceDisplay.textContent = diceText;
  updateDiceOptionsLabel(playerName);

  // reset user inputs/help for this new roll
  const sqInput = document.getElementById('squares-input');
  const helpOut = document.getElementById('help-output');
  if (sqInput) sqInput.value = '';
  if (helpOut) helpOut.textContent = '';

  view.log(`Human rolled ${diceText}`);

  // we now expect a move, so update which controls are shown
  updateTurnUI();
}

// ---------- Move generation & validation ----------

function getCandidateSquaresForCover(board) {
  const res = [];
  for (let i = 0; i < board.squares.length; i++) {
    if (board.squares[i] !== 0) res.push(board.squares[i]);
  }
  return res;
}

function getCandidateSquaresForUncover(board) {
  const res = [];
  for (let i = 0; i < board.squares.length; i++) {
    if (board.squares[i] === 0) res.push(i + 1);
  }
  return res;
}

function getCombinations(arr, maxLength = 4) {
  const results = [];
  function backtrack(start, path) {
    if (path.length > 0 && path.length <= maxLength) {
      results.push([...path]);
    }
    if (path.length === maxLength) return;
    for (let i = start; i < arr.length; i++) {
      path.push(arr[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return results;
}

function getValidMovesForPlayer(sum, playerName, type) {
  const me = playerName === 'Human' ? tournament.human : tournament.computer;
  const op = playerName === 'Human' ? tournament.computer : tournament.human;

  let candidates;
  if (type === 'cover') {
    candidates = getCandidateSquaresForCover(me.board);
  } else {
    candidates = getCandidateSquaresForUncover(op.board);
  }
  const combos = getCombinations(candidates, 4);
  return combos.filter(c => c.reduce((a, b) => a + b, 0) === sum);
}

function hasAnyMoveForPlayer(sum, playerName) {
  const coverMoves = getValidMovesForPlayer(sum, playerName, 'cover');
  const uncoverMoves = getValidMovesForPlayer(sum, playerName, 'uncover');
  return coverMoves.length > 0 || uncoverMoves.length > 0;
}

function arraysEqualIgnoreOrder(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

// ---------- Human move ----------

function onApplyHumanMove() {
  if (!tournament || !tournament.currentRound) return;
  const round = tournament.currentRound;
  if (round.nextPlayer !== 'Human') {
    alert('It is not your turn.');
    return;
  }
  if (!currentDice.sum) {
    alert('Roll the dice first.');
    return;
  }

  const moveTypeRadio = document.querySelector(
    'input[name="move-type"]:checked'
  );
  const moveType = moveTypeRadio ? moveTypeRadio.value : 'cover';

  const text = document.getElementById('squares-input').value.trim();
  if (!text) {
    alert('Enter squares.');
    return;
  }
  const squares = text
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !Number.isNaN(n));

  const validMoves = getValidMovesForPlayer(currentDice.sum, 'Human', moveType);
  const isLegal = validMoves.some(m => arraysEqualIgnoreOrder(m, squares));

  if (!isLegal) {
    alert('Illegal move for current board and dice sum.');
    return;
  }

  applyMove('Human', moveType, squares);
  view.log(
    `Human ${
      moveType === 'cover' ? 'covers' : 'uncovers'
    } squares: ${squares.join(', ')}`
  );

  handleEndOfMove('Human');
}

// actually change Board state
function applyMove(playerName, type, squares) {
  const me = playerName === 'Human' ? tournament.human : tournament.computer;
  const op = playerName === 'Human' ? tournament.computer : tournament.human;

  if (type === 'cover') {
    squares.forEach(sq => me.board.cover(sq));
  } else {
    squares.forEach(sq => op.board.uncover(sq));
  }
}

// ---------- Computer move ----------

function chooseBestMoveForComputer(sum) {
  const coverMoves = getValidMovesForPlayer(sum, 'Computer', 'cover');
  const uncoverMoves = getValidMovesForPlayer(sum, 'Computer', 'uncover');

  function pickBest(moves) {
    if (moves.length === 0) return null;
    return moves.reduce((best, cur) => {
      if (!best) return cur;
      // prefer more squares, then higher total
      if (cur.length > best.length) return cur;
      const curSum = cur.reduce((a, b) => a + b, 0);
      const bestSum = best.reduce((a, b) => a + b, 0);
      if (cur.length === best.length && curSum > bestSum) {
        return cur;
      }
      return best;
    }, null);
  }

  let type = null;
  let best = pickBest(coverMoves);
  if (best) {
    type = 'cover';
  } else {
    best = pickBest(uncoverMoves);
    if (best) type = 'uncover';
  }
  return best ? { type, squares: best } : null;
}

function computerTurn() {
  if (!tournament || !tournament.currentRound) return;
  const round = tournament.currentRound;
  if (round.nextPlayer !== 'Computer') return;

  // hide/disable human controls while computer is thinking
  updateTurnUI();

  // decide dice count based on 7–n coverage
  const board = tournament.computer.board;
  const n = board.size;
  let all7toNCovered = true;
  for (let s = 7; s <= n; s++) {
    if (!board.isCovered(s)) {
      all7toNCovered = false;
      break;
    }
  }
  const numDice = all7toNCovered ? 1 : 2;

  const roll = dice.roll(numDice);
  const d1 = roll.d1;
  const d2 = roll.d2;
  const sum = d1 + d2;
  currentDice = { d1, d2, sum };
  const diceText = numDice === 2 ? `${d1} + ${d2} = ${sum}` : `${d1} = ${sum}`;
  const diceDisplay = document.getElementById('dice-display');
  if (diceDisplay) diceDisplay.textContent = diceText;
  view.log(`Computer rolled ${diceText}`);

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
    `Computer ${
      move.type === 'cover' ? 'covers its' : 'uncovers human'
    } squares: ${move.squares.join(', ')}`
  );

  handleEndOfMove('Computer');
}

// ---------- Turn end / round end ----------

function handleEndOfMove(playerName) {
  const round = tournament.currentRound;

  // check for round win
  if (round.checkWin()) {
    const roundScore = round.computeRoundScore();
    const winner = round.winner;
    tournament.finishRound();
    view.log(
      `${winner.name} wins the round by ${round.winnerReason} and earns ${roundScore} points.`
    );
    const roundStatus = document.getElementById('round-status');
    if (roundStatus) {
      roundStatus.textContent = `Round over. Winner: ${winner.name}`;
    }
    renderAll();

    const tourWinner = tournament.getWinnerOfTournament();
    const summaryLines = [
      `${winner.name} wins this round by ${round.winnerReason} with ${roundScore} points.`,
      `Tournament scores — Human: ${tournament.human.totalScore}, Computer: ${tournament.computer.totalScore}.`,
    ];
    const endSummaryEl = document.getElementById('end-summary');
    if (endSummaryEl) {
      let finalLine;
      if (tourWinner) {
        finalLine = `${tourWinner.name} is currently leading the tournament.`;
      } else {
        finalLine = 'Tournament is currently tied.';
      }
      endSummaryEl.textContent = summaryLines.join('\n') + '\n' + finalLine;
    }

    showScreen('end');
    return;
  }

  // if no win, check if player can continue or must stop
  const sum = currentDice.sum;
  if (!hasAnyMoveForPlayer(sum, playerName)) {
    view.log(`${playerName} has no more legal moves. Turn ends.`);
    round.nextPlayer = playerName === 'Human' ? 'Computer' : 'Human';
    currentDice = { d1: null, d2: null, sum: null };
  } else {
    // same player continues, must roll again
    view.log(`${playerName} may roll again (moves still possible).`);
    // if it was human and they can continue, we clear the dice to force a re-roll
    if (playerName === 'Human') {
      currentDice = { d1: null, d2: null, sum: null };
    }
  }

  renderAll();

  if (round.nextPlayer === 'Computer' && !round.winner) {
    setTimeout(computerTurn, 500);
  }
}

// ---------- Help mode ----------

function onHelp() {
  if (!tournament || !tournament.currentRound) return;
  const round = tournament.currentRound;
  if (round.nextPlayer !== 'Human') {
    alert('Help is only for the human turn.');
    return;
  }
  if (!currentDice.sum) {
    alert('Roll the dice first to get help.');
    return;
  }
  const sum = currentDice.sum;
  const coverMoves = getValidMovesForPlayer(sum, 'Human', 'cover');
  const uncoverMoves = getValidMovesForPlayer(sum, 'Human', 'uncover');
  const best = chooseBestMoveForComputer(sum); // same strategy but conceptually used for human

  let out = `Dice sum: ${sum}\n\n`;
  out += 'Cover options:\n';
  out += coverMoves.length
    ? coverMoves.map(m => '  ' + m.join(', ')).join('\n')
    : '  (none)\n';

  out += '\nUncover options:\n';
  out += uncoverMoves.length
    ? uncoverMoves.map(m => '  ' + m.join(', ')).join('\n')
    : '  (none)\n';

  if (!best) {
    out += '\nI recommend ending the turn because no legal moves are available.';
  } else {
    out += `\nRecommendation: ${
      best.type === 'cover' ? 'COVER' : 'UNCOVER'
    } squares ${best.squares.join(', ')}\n`;
    out += best.type === 'cover'
      ? 'Reason: Covering your own squares helps you get closer to winning and lowers their scoring potential.'
      : 'Reason: You cannot cover, so uncovering opponent squares disrupts their progress.';
  }

  const helpOutput = document.getElementById('help-output');
  if (helpOutput) helpOutput.textContent = out;
}

// ---------- Serialization ----------

function onSaveGame() {
  if (!tournament || !tournament.currentRound) return;
  const text = Serializer.save(tournament, tournament.currentRound);
  const saveOut = document.getElementById('save-output');
  if (saveOut) saveOut.value = text;

  view.log('Game serialized into text. Copy and save it to a file.');
}

// fromWelcome = true → read from #welcome-load-input, else from #load-input (if present)
function onLoadGame(fromWelcome = false) {
  let text = '';
  const welcomeEl = document.getElementById('welcome-load-input');
  const gameEl = document.getElementById('load-input');

  if (fromWelcome && welcomeEl) {
    text = welcomeEl.value.trim();
  } else if (gameEl) {
    text = gameEl.value.trim();
  } else if (welcomeEl) {
    text = welcomeEl.value.trim();
  }

  if (!text) {
    alert('Paste saved game text first.');
    return;
  }
  try {
    const state = Serializer.load(text);
    const boardSize = state.computerSquares.length;

    dice = new Dice();
    tournament = new Tournament(boardSize, dice);

    tournament.computer.board.squares = state.computerSquares;
    tournament.human.board.squares = state.humanSquares;
    tournament.computer.totalScore = state.computerScore;
    tournament.human.totalScore = state.humanScore;

    // start a round but override first/next player (per spec)
    tournament.startNewRound();
    tournament.currentRound.firstPlayer = state.firstTurn;
    tournament.currentRound.nextPlayer = state.nextTurn;

    currentDice = { d1: null, d2: null, sum: null };
    const roundStatus = document.getElementById('round-status');
    if (roundStatus) {
      roundStatus.textContent = 'Round in progress (loaded)';
    }
    renderAll();
    view.log('Game loaded from text.');
  } catch (e) {
    console.error(e);
    alert('Failed to parse save text. Check the format.');
  }
}

// ---------- UI state for turn flow ----------

function updateTurnUI() {
  const moveSection = document.getElementById('move-section');
  const helpSection = document.getElementById('help-section');
  const diceSection = document.getElementById('dice-section');
  const rollOneBtn = document.getElementById('roll-one-die-btn');
  const rollTwoBtn = document.getElementById('roll-two-dice-btn');

  // no tournament or round yet → hide move/help, disable rolls
  if (!tournament || !tournament.currentRound) {
    if (moveSection) moveSection.classList.add('hidden-ui');
    if (helpSection) helpSection.classList.add('hidden-ui');
    if (diceSection) diceSection.classList.remove('hidden-ui'); // still show the dice box
    if (rollOneBtn) rollOneBtn.disabled = true;
    if (rollTwoBtn) rollTwoBtn.disabled = true;
    return;
  }

  const round = tournament.currentRound;
  const isHumanTurn = round.nextPlayer === 'Human' && !round.winner;
  const hasRoll = !!currentDice.sum;

  if (rollOneBtn) rollOneBtn.disabled = !isHumanTurn;
  if (rollTwoBtn) rollTwoBtn.disabled = !isHumanTurn;

  if (!isHumanTurn) {
    // waiting on computer
    if (moveSection) moveSection.classList.add('hidden-ui');
    if (helpSection) helpSection.classList.add('hidden-ui');
    return;
  }

  // human's turn
  if (!hasRoll) {
    // must roll first → hide move & help
    if (moveSection) moveSection.classList.add('hidden-ui');
    if (helpSection) helpSection.classList.add('hidden-ui');
  } else {
    // have dice → show move & help; prevent rolling again until move handled
    if (moveSection) moveSection.classList.remove('hidden-ui');
    if (helpSection) helpSection.classList.remove('hidden-ui');
    if (rollOneBtn) rollOneBtn.disabled = true;
    if (rollTwoBtn) rollTwoBtn.disabled = true;
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
  view.updateScores(
    tournament.human.totalScore,
    tournament.computer.totalScore
  );
  view.updateTurnInfo(
    round ? round.firstPlayer : null,
    round ? round.nextPlayer : null,
    tournament.advantageOwner,
    tournament.advantageSquare
  );

  // 👇 update which dice are allowed for whoever is about to play
  if (round && round.nextPlayer) {
    updateDiceOptionsLabel(round.nextPlayer);
  }

  updateTurnUI();
}

