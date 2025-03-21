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
const preGameElement = document.getElementById("pre-game");
const liveGameElement = document.getElementById("live-game");
const currentTurnElement = document.getElementById("current-turn");
const inputDiceButton = document.getElementById("input-dice");
const diceModalElement = document.getElementById("dice-modal");
const gameUIElement = document.getElementById("game-ui");
const diceResultElement = document.getElementById("dice-result");
const submitDiceButton = document.getElementById("submit-dice");
const closeButton = document.getElementById("close-button");
const validRollsElement = document.getElementById("valid-rolls");
const confirmValidRollsButton = document.getElementById("confirm-valid-rolls");
const coverSwitchElement = document.getElementById("cover-switch");
const fileInput = document.getElementById("file-input");


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
  currentTurnElement.textContent = state.GAME_TURN || "Unknown";
  diceResultElement.textContent = "Dice: " + state.diceRoll || "No dice rolled yet.";

}

// Event listeners
loadGameInitialButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/load", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Load game response:", data); // Log the result

    if (data.screen === "LOAD") {
      showConfigUI(data.screen);
    } else {
        console.error("Unknown screen:", data.screen);
    }
  }
});

newGameInitialButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/new", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("New game response:", data); // Log the result

    if (data.screen === "CONFIG") {
        showConfigUI(data.screen);
    } else {
        console.error("Unknown screen:", data.screen);
    }
  }
});

rollDiceButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Roll dice response:", data); // Log the result

    afterDieRoll(data);
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

    if (data.GAME_TURN == "HUMAN") {
      console.log("Human's turn");
    } else if (data.GAME_TURN == "COMPUTER") {
      console.log("Computer's turn");
    } else {
      console.error("Unknown turn:", data.GAME_TURN);
    }

    if (data.screen === "PLAY") {
      console.log("Showing live game UI");
      showLiveGameUI();
      updateUI();

      rollDiceButton.classList.remove("hidden");
      rewindButton.classList.add("hidden");
      saveGameButton.classList.add("hidden");
      helpButton.classList.add("hidden");
      coverSwitchElement.classList.add("hidden");

    } else {
        console.error("Unknown screen:", data.screen);
    }


    // updateUI();
  }
});

inputDiceButton.addEventListener("click", async () => {
  regularUI.classList.add("hidden");
  diceModalElement.classList.remove("hidden");
});


closeButton.addEventListener("click", () => {
  regularUI.classList.remove("hidden")
  diceModalElement.classList.add("hidden");
});

submitDiceButton.addEventListener("click", async () => {
  const dice1 = document.getElementById("dice1").value;
  const dice2 = document.getElementById("dice2").value;
  const inputDice = [parseInt(dice1), parseInt(dice2)];

  const response = await fetch("http://localhost:3000/api/game/input-dice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputDice }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Input dice response:", data); // Log the result
    afterDieRoll(data);
  }
});

confirmValidRollsButton.addEventListener("click", async () => {
  const validMove = validRollsElement.value;
  const response = await fetch("http://localhost:3000/api/game/valid-move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ validMove }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("User selected dice response:", validMove); // Log the result
  }
});

fileInput.addEventListener("change", async (event) => {
  console.log("File input changed:", event.target.files);
  fileInput.classList.add("hidden");
  showLiveGameUI();
});


function showStartUI() {
  // initialUI.classList.remove("hidden");
  // regularUI.classList.add("hidden");
}

function showConfigUI(screen) {
  if (screen === "CONFIG") {
    initialUI.classList.add("hidden");
    regularUI.classList.remove("hidden");

    preGameElement.classList.remove("hidden");
    liveGameElement.classList.add("hidden");

  } else if (screen === "LOAD") {
    initialUI.classList.add("hidden");
    fileInput.classList.remove("hidden");
  }
}

function showLiveGameUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");

  preGameElement.classList.add("hidden");
  liveGameElement.classList.remove("hidden");
}

function afterDieRoll(data){
    regularUI.classList.remove("hidden")
    diceModalElement.classList.add("hidden");
    diceResultElement.classList.remove("hidden");
    rollDiceButton.classList.add("hidden");
    inputDiceButton.classList.add("hidden");
    validRollsElement.classList.remove("hidden");
    confirmValidRollsButton.classList.remove("hidden");
    coverSwitchElement.classList.remove("hidden");
    const validRolls = ["one", "two", "three"];
    populateStringSelect(validRolls);

    console.log("Data from afterDieRoll:", data);

    if (data.GAME_TURN == "HUMAN") {
      helpButton.classList.remove("hidden");
    } else if (data.GAME_TURN == "COMPUTER") {
      helpButton.classList.add("hidden");
    } else {
      console.error("Unknown turn:", data.GAME_TURN);
    }

    updateUI();
}

function populateStringSelect(strings) {
  validRollsElement.innerHTML = "";
  strings.forEach(str => {
    const option = document.createElement("option");
    option.value = str;
    option.textContent = str;
    validRollsElement.appendChild(option);
  });
}
// Initialize the UI
// initialUI.classList.remove("hidden");
// regularUI.classList.add("hidden");

