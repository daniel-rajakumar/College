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

// Render squares in the format [ x, x, x, ..., x ]
function renderSquares(container, squares, player) {
  container.innerHTML = "";

  // Create a wrapper for the squares
  const squaresWrapper = document.createElement("div");
  squaresWrapper.classList.add("squares-wrapper");

  // Add opening bracket
  const openBracket = document.createElement("span");
  openBracket.textContent = " ";
  squaresWrapper.appendChild(openBracket);

  // Add squares
  squares.forEach((square) => {
    const squareElement = document.createElement("span");
    squareElement.classList.add("square");
    squareElement.textContent = square;
    squaresWrapper.appendChild(squareElement);

    // Add comma separator (except for the last square)
    if (square !== squares[squares.length - 1]) {
      const comma = document.createElement("span");
      comma.textContent = " ";
      squaresWrapper.appendChild(comma);
    }
  });

  // Add closing bracket
  const closeBracket = document.createElement("span");
  closeBracket.textContent = " ";
  squaresWrapper.appendChild(closeBracket);

  // Append the wrapper to the container
  container.appendChild(squaresWrapper);
}

// Event listeners
rollDiceButton.addEventListener("click", rollDice);
newRoundButton.addEventListener("click", newRound);
helpButton.addEventListener("click", showHelp);

// Initialize the game
newRound();