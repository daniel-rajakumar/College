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
const computerBoardElement = document.getElementById("computer-board");
const humanBoardElement = document.getElementById("human-board");
const player1TypeElement = document.getElementById("player1-type-select");
const player2TypeElement = document.getElementById("player2-type-select");

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

  console.log("State from updateUI:", state);

  renderSquares(humanSquaresElement, state.player1.squares);
  renderSquares(computerSquaresElement, state.player2.squares);
  humanScoreElement.textContent = state.player1.score;
  computerScoreElement.textContent = state.player2.score;
  diceRollElement.textContent = state.diceRoll || "No dice rolled yet.";
  gameMessageElement.textContent = state.message || "";
  currentTurnElement.textContent = state.currentPlayer || "Unknown";
  diceResultElement.textContent = "Dice: " + state.dice.total || "No dice rolled yet.";
  document.querySelector("#human-board > h2").innerHTML = "Player 1: " + state.player1.type;
  document.querySelector("#computer-board > h2").innerHTML = "Player 2: " + state.player2.type;
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
  showConfigUI("CONFIG");
  // const response = await fetch("http://localhost:3000/api/game/new", {
  //   method: "POST",
  // });
  // if (response.ok) {
  //   const data = await response.json();
  //   console.log("New game response:", data); // Log the result

  //   if (data.screen === "CONFIG") {
  //       showConfigUI(data.screen);
  //   } else {
  //       console.error("Unknown screen:", data.screen);
  //   }
  // }
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
    saveGame();
    // updateUI();
  }
});

applyConfigButton.addEventListener("click", async () => {
  const boardSize = boardSizeSelect.value;
  const player1Type = player1TypeElement.value;
  const player2Type = player2TypeElement.value;
  const response = await fetch("http://localhost:3000/api/game/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardSize, player1Type, player2Type }),
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Apply config response:", data); // Log the result

    if (data.currentPlayer == "player1") {
      console.log("Player1's turn");
    } else if (data.currentPlayer == "player2") {
      console.log("Player2's turn");
    } else {
      console.error("Unknown turn:", data.currentPlayer);
    }

    if (data.screen === "PLAY") {
      console.log("Showing live game UI");
      showLiveGameUI();
      updateUI();

      rollDiceButton.classList.remove("hidden");
      // rewindButton.classList.add("hidden");
      // saveGameButton.classList.add("hidden");
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
  const dice1 = parseInt(document.getElementById("dice1").value);
  const dice2 = parseInt(document.getElementById("dice2").value);
  const inputDice = [dice1, dice2];

  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
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

    diceResultElement.classList.add("hidden");
    rollDiceButton.classList.remove("hidden");
    inputDiceButton.classList.remove("hidden");
    validRollsElement.classList.add("hidden");
    confirmValidRollsButton.classList.add("hidden");
    coverSwitchElement.classList.add("hidden");
    rewindButton.classList.remove("hidden");
    saveGameButton.classList.remove("hidden");
    updateUI();
  }
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      try {
        // Parse the file content
        const gameState = parseGameState(content);

        // Send the parsed game state to the backend
        const response = await fetch("http://localhost:3000/api/game/load-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gameState),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("File load response:", data);

          // Update the UI with the new game state
          showLiveGameUI();
          updateUI();

          rollDiceButton.classList.remove("hidden");
          rewindButton.classList.add("hidden");
          saveGameButton.classList.add("hidden");
          helpButton.classList.add("hidden");
          coverSwitchElement.classList.add("hidden");
        } else {
          console.error("Failed to load game state from file");
        }
      } catch (error) {
        console.error("Error parsing or loading game state:", error);
      }
    };
    reader.readAsText(file);
  }
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
    rewindButton.classList.add("hidden");
    saveGameButton.classList.add("hidden");

    populateStringSelect(data.validCoverCombinations || []);

    console.log("Data from afterDieRoll:", data);

    if (data.player1.type === "human" || data.player2.type === "human") {
      helpButton.classList.remove("hidden");
    } else if (data.player1.type === "computer" || data.player2.type === "computer") {
      helpButton.classList.add("hidden");
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



async function saveGame() {
  try {
    // Fetch the current game state
    const humanSquares = Array.from(humanSquaresElement.querySelectorAll('.square')).map(square => square.textContent).join(' ');
    const computerSquares = Array.from(computerSquaresElement.querySelectorAll('.square')).map(square => square.textContent).join(' ');
    const humanScore = humanScoreElement.textContent;
    const computerScore = computerScoreElement.textContent;
    const currentTurn = currentTurnElement.textContent;

    // Determine the next turn
    const nextTurn = currentTurn === "player1" ? "player1" : "player2";

    // Format the game state as a string
    const gameStateString = `Computer:
                              Squares: ${computerSquares}
                              Score: ${computerScore}

                            Human:
                              Squares: ${humanSquares}
                              Score: ${humanScore}

                            First Turn: ${currentTurn}
                            Next Turn: ${nextTurn}`;

    // Create a Blob with the game state string
    const blob = new Blob([gameStateString], { type: "text/plain;charset=utf-8" });

    // Prompt the user to save the file
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: "savegame.txt", // Default file name
      types: [
        {
          description: "Text Files",
          accept: { "text/plain": [".txt"] },
        },
      ],
    });

    // Write the Blob to the file
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();

    console.log("Game saved successfully!");
  } catch (error) {
    console.error("Error saving the game:", error);
    alert("Failed to save the game. Please try again.");
  }
}


function parseGameState(content) {
  const lines = content.split("\n");
  const gameState = {
  };

  let boardSize = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes("Computer:")) {
      // Read the next line for computer squares
      const squaresLine = lines[++i].trim();
      const squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(" ")
        .map(Number);

      boardSize = squares.length;
      gameState.player2Squares = squares;

      // Read the next line for computer score
      const scoreLine = lines[++i].trim();
      gameState.player2Score = parseInt(scoreLine.split("Score:")[1].trim());
    } else if (line.includes("Human:")) {
      // Read the next line for human squares
      const squaresLine = lines[++i].trim();
      const squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(" ")
        .map(Number);

      gameState.player1Squares = squares;

      // Read the next line for human score
      const scoreLine = lines[++i].trim();
      gameState.player1Score = parseInt(scoreLine.split("Score:")[1].trim());
    } else if (line.includes("First Turn:")) {
      // Determine the first turn
      // gameState.GAME_TURN = line.includes("Human") ? "human" : "computer";
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
    } else if (line.includes("Next Turn:")) {
      // Determine the next turn (optional, depending on your game logic)
      // This can be used to set the current turn after loading the game
      // gameState.GAME_TURN = line.includes("Human") ? "HUMAN" : "computer";
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
    }
  }

  return gameState;
}

