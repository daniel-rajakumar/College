// DOM elements
const initialUI = document.getElementById("initial-ui");
const regularUI = document.getElementById("regular-ui");
const loadGameInitialButton = document.getElementById("load-game-initial");
const newGameInitialButton = document.getElementById("new-game-initial");
const humanSquaresElement = document.getElementById("human-squares");
const computerSquaresElement = document.getElementById("computer-squares");
const humanScoreElement = document.getElementById("human-score");
const computerScoreElement = document.getElementById("computer-score");
const diceRollElement = document.getElementById("dice-roll");
const gameMessageElement = document.getElementById("game-message");
const rollDiceButton = document.getElementById("roll-dice");
const newRoundButton = document.getElementById("new-round");
const helpButton = document.getElementById("help");
const rewindButton = document.getElementById("rewind");
const saveGameButton = document.getElementById("save-game");
const boardSizeSelect = document.getElementById("board-size");
const applyConfigButton = document.getElementById("apply-config");

// Game state
let gameState = [];
let currentStateIndex = -1;

// Initialize the game
function initializeGame(boardSize = 11) {
  const humanSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  const computerSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  gameState = [{ humanSquares, computerSquares, humanScore: 0, computerScore: 0 }];
  currentStateIndex = 0;
  renderGame();
}

// Render the game
function renderGame() {
  const state = gameState[currentStateIndex];
  renderSquares(humanSquaresElement, state.humanSquares, "human");
  renderSquares(computerSquaresElement, state.computerSquares, "computer");
  humanScoreElement.textContent = state.humanScore;
  computerScoreElement.textContent = state.computerScore;
}

// Render squares in the format [ x, x, x, ..., x ]
function renderSquares(container, squares, player) {
  container.innerHTML = "";
  const squaresWrapper = document.createElement("div");
  squaresWrapper.classList.add("squares-wrapper");

  const openBracket = document.createElement("span");
  openBracket.textContent = "[";
  squaresWrapper.appendChild(openBracket);

  squares.forEach((square, index) => {
    const squareElement = document.createElement("span");
    squareElement.classList.add("square");
    squareElement.textContent = square;
    squaresWrapper.appendChild(squareElement);

    if (index !== squares.length - 1) {
      const comma = document.createElement("span");
      comma.textContent = ",";
      squaresWrapper.appendChild(comma);
    }
  });

  const closeBracket = document.createElement("span");
  closeBracket.textContent = "]";
  squaresWrapper.appendChild(closeBracket);

  container.appendChild(squaresWrapper);
}

// Roll dice
async function rollDice() {
  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
    method: "POST",
  });
  const data = await response.json();
  diceRollElement.textContent = `${data.dice1} + ${data.dice2} = ${data.total}`;
  gameMessageElement.textContent = `You rolled a ${data.total}.`;
}

// Start a new round
async function newRound() {
  const response = await fetch("http://localhost:3000/api/game/new-round", {
    method: "POST",
  });
  const data = await response.json();
  gameState.push({ ...data, humanScore: 0, computerScore: 0 });
  currentStateIndex = gameState.length - 1;
  renderGame();
  gameMessageElement.textContent = "New round started!";
}

// Rewind to a previous state
function rewind() {
  if (currentStateIndex > 0) {
    currentStateIndex--;
    renderGame();
    gameMessageElement.textContent = "Rewound to a previous state.";
  } else {
    gameMessageElement.textContent = "Cannot rewind further.";
  }
}

// Save the game state
function saveGame() {
  const state = gameState[currentStateIndex];
  localStorage.setItem("savedGameState", JSON.stringify(state));
  gameMessageElement.textContent = "Game saved!";
}

// Load the game state
function loadGame() {
  const savedState = localStorage.getItem("savedGameState");
  if (savedState) {
    const state = JSON.parse(savedState);
    gameState = [state];
    currentStateIndex = 0;
    renderGame();
    gameMessageElement.textContent = "Game loaded!";
  } else {
    gameMessageElement.textContent = "No saved game found.";
  }
}

// Show the regular UI and hide the initial UI
function showRegularUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");
}

function main() {
  // Event listeners for initial UI
  loadGameInitialButton.addEventListener("click", () => {
    loadGame();
    showRegularUI();
  });

  newGameInitialButton.addEventListener("click", () => {
    initializeGame();
    showRegularUI();
  });

  // Event listeners for regular UI
  rollDiceButton.addEventListener("click", rollDice);
  newRoundButton.addEventListener("click", newRound);
  helpButton.addEventListener("click", () => {
    gameMessageElement.textContent = "Help: Try to cover your squares or uncover the opponent's squares!";
  });
  rewindButton.addEventListener("click", rewind);
  saveGameButton.addEventListener("click", saveGame);
  applyConfigButton.addEventListener("click", applyConfig);

  initialUI.classList.remove("hidden");
  regularUI.classList.add("hidden");
}

main();


// Initialize the initial UI