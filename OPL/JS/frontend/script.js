// DOM elements
const humanSquaresElement = document.getElementById("human-squares");
const computerSquaresElement = document.getElementById("computer-squares");
const humanScoreElement = document.getElementById("human-score");
const computerScoreElement = document.getElementById("computer-score");
const diceRollElement = document.getElementById("dice-roll");
const gameMessageElement = document.getElementById("game-message");
const rollDiceButton = document.getElementById("roll-dice");
const newRoundButton = document.getElementById("new-round");
const helpButton = document.getElementById("help");

// Fetch API to interact with the backend
async function rollDice() {
  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
    method: "POST",
  });
  const data = await response.json();
  diceRollElement.textContent = `${data.dice1} + ${data.dice2} = ${data.total}`;
  gameMessageElement.textContent = `You rolled a ${data.total}.`;
}

async function newRound() {
  const response = await fetch("http://localhost:3000/api/game/new-round", {
    method: "POST",
  });
  const data = await response.json();
  renderSquares(humanSquaresElement, data.humanSquares, "human");
  renderSquares(computerSquaresElement, data.computerSquares, "computer");
  gameMessageElement.textContent = "New round started!";
}

function showHelp() {
  gameMessageElement.textContent = "Help: Try to cover your squares or uncover the opponent's squares!";
}

// Event listeners
rollDiceButton.addEventListener("click", rollDice);
newRoundButton.addEventListener("click", newRound);
helpButton.addEventListener("click", showHelp);

// Render squares
function renderSquares(container, squares, player) {
  container.innerHTML = "";
  squares.forEach((square) => {
    const squareElement = document.createElement("div");
    squareElement.classList.add("square");
    squareElement.textContent = square;
    container.appendChild(squareElement);
  });
}

// Initialize the game
newRound();