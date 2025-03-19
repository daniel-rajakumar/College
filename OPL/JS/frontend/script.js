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
const helpButton = document.getElementById("help");
const rewindButton = document.getElementById("rewind");
const saveGameButton = document.getElementById("save-game");
const boardSizeSelect = document.getElementById("board-size");
const applyConfigButton = document.getElementById("apply-config");

// Show the regular UI and hide the initial UI
function showRegularUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");
}

// Render squares in the format [ x, x, x, ..., x ]
function renderSquares(container, squares) {
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

// Fetch game state from the backend
async function fetchGameState() {
  const response = await fetch("http://localhost:3000/api/game/state");
  const data = await response.json();
  console.log("Game state from backend:", data); // Log the result
  return data;
}

// Update the UI with the game state
async function updateUI() {
  const state = await fetchGameState();
  renderSquares(humanSquaresElement, state.humanSquares);
  renderSquares(computerSquaresElement, state.computerSquares);
  humanScoreElement.textContent = state.humanScore;
  computerScoreElement.textContent = state.computerScore;
  diceRollElement.textContent = state.diceRoll || "No dice rolled yet.";
  gameMessageElement.textContent = state.message || "";
}

// Event listeners
loadGameInitialButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/load", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Load game response:", data); // Log the result
    showRegularUI();
    updateUI();
  }
});

newGameInitialButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/new", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("New game response:", data); // Log the result
    showRegularUI();
    updateUI();
  }
});

rollDiceButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Roll dice response:", data); // Log the result
    updateUI();
  }
});

helpButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/help", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Help response:", data); // Log the result
    updateUI();
  }
});

rewindButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/rewind", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Rewind response:", data); // Log the result
    updateUI();
  }
});

saveGameButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/save", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Save game response:", data); // Log the result
    updateUI();
  }
});

applyConfigButton.addEventListener("click", async () => {
  const boardSize = boardSizeSelect.value;
  const response = await fetch("http://localhost:3000/api/game/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardSize }),
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Apply config response:", data); // Log the result
    updateUI();
  }
});

// Initialize the UI
initialUI.classList.remove("hidden");
regularUI.classList.add("hidden");