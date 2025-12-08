// js/main.js
import { Dice } from './model/Dice.js';
import { Tournament } from './model/Tournament.js';
import { View } from './ui/View.js';
import { Serializer } from './model/Serializer.js';

let dice = new Dice();
let tournament = null;
let view = null;

window.addEventListener('DOMContentLoaded', () => {
  view = new View();

  document
    .getElementById('start-round-btn')
    .addEventListener('click', onStartRound);

  document
    .getElementById('save-game-btn')
    .addEventListener('click', onSaveGame);

  document
    .getElementById('load-game-btn')
    .addEventListener('click', onLoadGame);

  // TODO: hook up roll/apply move/help buttons
});

function onStartRound() {
  const size = parseInt(document.getElementById('board-size').value, 10);
  if (!tournament) {
    tournament = new Tournament(size, dice);
  } else {
    tournament.boardSize = size;
  }
  tournament.startNewRound();

  view.renderBoards(tournament.human.board, tournament.computer.board);
  view.updateScores(tournament.human.totalScore, tournament.computer.totalScore);
  view.updateTurnInfo(
    tournament.currentRound.firstPlayer,
    tournament.currentRound.nextPlayer,
    tournament.advantageOwner,
    tournament.advantageSquare
  );
  view.log('Started new round');
}

function onSaveGame() {
  if (!tournament || !tournament.currentRound) return;
  const text = Serializer.save(tournament, tournament.currentRound);
  document.getElementById('save-output').value = text;
  view.log('Game serialized into text.');
}

function onLoadGame() {
  const text = document.getElementById('load-input').value.trim();
  if (!text) return;
  // TODO: use Serializer.load(text) to rebuild Tournament + Round
  view.log('Loaded game from text (implement Serializer.load).');
}
