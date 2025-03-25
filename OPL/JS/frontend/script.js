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
const toggleSwitchElement = document.getElementById("toggle-switch");
const ExitGameButton = document.getElementById("exit-game");
const playAgainGameButton = document.getElementById("play-again-game");
const roundWinnerElement = document.getElementById("round-winner");
const roundWinnerTextElement = document.getElementById("round-winner-text");
const currentTurnElement = document.querySelector("#live-game > div.current-turn");
const rewindModalElement = document.getElementById("rewind-modal");
const closeRewindButton = document.getElementById("close-rewind-button");
const confirmRewindButton = document.getElementById("confirm-rewind");
const historyListElement = document.getElementById("history-list");
const useOneDieElement = document.getElementById("use-one-die");
const diceToggleContainer = document.getElementById("dice-toggle-container");

let selectedHistoryIndex = -1;
let isNewGame = true;

// Show the regular UI and hide the initial UI
function showRegularUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");
}

// Render squares in the format [ x, x, x, ..., x ]
function renderSquares(container, squares, advantage) {
  container.innerHTML = "";
  const squaresWrapper = document.createElement("div");
  squaresWrapper.classList.add("squares-wrapper");

  const openBracket = document.createElement("span");
  openBracket.textContent = "[";
  openBracket.classList.add("square-num");
  squaresWrapper.appendChild(openBracket);

  squares.forEach((square, index) => {
    const squareElement = document.createElement("span");
    squareElement.classList.add("square");
    if (advantage === index) {
      squareElement.classList.add("advantage");
    }
    squareElement.textContent = square;
    squareElement.classList.add("square-num");
    squaresWrapper.appendChild(squareElement);

    if (index !== squares.length - 1) {
      const comma = document.createElement("span");
      comma.textContent = " ";
      squaresWrapper.appendChild(comma);
    }
  });

  const closeBracket = document.createElement("span");
  closeBracket.classList.add("square-num");
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

  if (state.advantage.player === "player1")
    renderSquares(humanSquaresElement, state.player1.squares, state.advantage.square);
  else 
    renderSquares(humanSquaresElement, state.player1.squares, -1);

  if (state.advantage.player === "player2")
    renderSquares(computerSquaresElement, state.player2.squares, state.advantage.square);
  else
    renderSquares(computerSquaresElement, state.player2.squares, -1);

  humanScoreElement.textContent = state.player1.score;
  computerScoreElement.textContent = state.player2.score;
  diceRollElement.textContent = state.diceRoll || "No dice rolled yet.";
  gameMessageElement.textContent = state.message || "";
  currentTurnElement.textContent = "Current Turn: " + (state.currentPlayer || "Unknown");
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
});

rollDiceButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/roll-dice", {
    method: "POST",
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Roll dice response:", data); // Log the result
    // console.log("computer move: " + data.move)

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
  const response = await fetch(`http://localhost:3000/api/game/${isNewGame ? "new" : "play-again"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ boardSize, player1Type, player2Type }),
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Apply config response:", data); // Log the result

    if (data.screen === "PLAY") {
      console.log("Showing live game UI");
      showLiveGameUI();
      updateUI();

      rollDiceButton.classList.remove("hidden");
      helpButton.classList.add("hidden");
      coverSwitchElement.classList.add("hidden");
      ExitGameButton.classList.add("hidden");
      playAgainGameButton.classList.add("hidden");
      currentTurnElement.classList.remove("hidden");
      inputDiceButton.classList.remove("hidden");
      rewindButton.classList.remove("hidden");
      saveGameButton.classList.remove("hidden");  

    } else {
        console.error("Unknown screen:", data.screen);
    }

    // updateUI();
  }
});

inputDiceButton.addEventListener("click", async () => {
  const canThrowSingleDie = await canThrowOneDie();

  if (canThrowSingleDie) {
    diceToggleContainer.classList.remove("hidden");
  }

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
  const useOneDie = useOneDieElement.checked;

  console.log("use one die", useOneDie)

  if (!useOneDie && (isNaN(dice1) || isNaN(dice2) || dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6)) {
    alert("Please enter valid dice values between 1 and 6");
    return;
  }


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
  await validRolls(validRollsElement.value, toggleSwitchElement.checked);
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
        gameState.player1Type = "human";
        gameState.player2Type = "computer";

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
          helpButton.classList.add("hidden");
          coverSwitchElement.classList.add("hidden");
          ExitGameButton.classList.add("hidden");
          playAgainGameButton.classList.add("hidden");
          currentTurnElement.classList.remove("hidden");
          fileInput.classList.add("hidden");

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

toggleSwitchElement.addEventListener("change", async () => {
  const checked = toggleSwitchElement.checked;
  const response = await fetch("http://localhost:3000/api/game/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ checked }),
  });
  if (response.ok) {
    const data = await response.json();
    console.log("Toggle response:", data); // Log the result
    
    populateStringSelect(data);
   
    updateUI();
  }
});

ExitGameButton.addEventListener("click", async () => {
  console.log("Exiting game");
  showStartUI();
});

playAgainGameButton.addEventListener("click", async () => {
  console.log("Playing again");
  boardSizeSelect.disabled = true;
  player1TypeElement.disabled = true;
  player2TypeElement.disabled = true;
  isNewGame = false;
  showConfigUI("CONFIG");
});


// Update rewind button event listener
rewindButton.addEventListener("click", async () => {
  const response = await fetch("http://localhost:3000/api/game/move-history");
  if (response.ok) {
    const data = await response.json();
    populateMoveHistory(data.history);
    if (data.history.length > 0) {
      updateMoveDetails(data.history[data.history.length - 1]);
    }
    rewindModalElement.classList.remove("hidden");
    regularUI.classList.add("hidden");
  }
});

// Update confirm button
confirmRewindButton.addEventListener("click", async () => {
  const selectedItem = document.querySelector(".move-item.selected");
  if (selectedItem) {
    const index = parseInt(selectedItem.dataset.index);
    const response = await fetch("http://localhost:3000/api/game/rewind-move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
    
    if (response.ok) {
      const data = await response.json();
      updateUI();
      rewindModalElement.classList.add("hidden");
      regularUI.classList.remove("hidden");
    }
  }
});


closeRewindButton.addEventListener("click", () => {
  rewindModalElement.classList.add("hidden");
  regularUI.classList.remove("hidden");
});

useOneDieElement.addEventListener("change", async () => {

  if (useOneDieElement.checked) {
    document.getElementById("dice2").disabled = true;
    document.getElementById("dice2").value = 0;
  }
  else {
    document.getElementById("dice2").disabled = false;
  }
  
});

async function validRolls(validMove = validRollsElement.value, toCover = toggleSwitchElement.checked) {
  console.log("Valid move:", validMove);
  console.log("toCover:", toCover);
  const response = await fetch("http://localhost:3000/api/game/valid-move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ validMove, toCover }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("User selected dice response:", data); // Log the result

    afterValidRoll(data);
    updateUI();
  }
}

function afterValidRoll(data) {
  diceResultElement.classList.add("hidden");
  rollDiceButton.classList.remove("hidden");
  inputDiceButton.classList.remove("hidden");
  validRollsElement.classList.add("hidden");
  confirmValidRollsButton.classList.add("hidden");
  coverSwitchElement.classList.add("hidden");
  rewindButton.classList.remove("hidden");
  saveGameButton.classList.remove("hidden");

  if (data.gameOver) {
    console.log("Game over!");
    rewindButton.classList.add("hidden");
    saveGameButton.classList.add("hidden");
    rewindButton.classList.add("hidden");
    inputDiceButton.classList.add("hidden");
    rollDiceButton.classList.add("hidden");
    ExitGameButton.classList.remove("hidden");
    playAgainGameButton.classList.remove("hidden");
    helpButton.classList.add("hidden");
    currentTurnElement.classList.add("hidden");
    document.querySelector("#live-game > div.game-board").classList.add("hidden");
    alert("Winner: " + data.winner);
  }
}

function showStartUI() {
  initialUI.classList.remove("hidden");
  regularUI.classList.add("hidden");
}

function showConfigUI(screen) {
  if (screen === "CONFIG") {
    initialUI.classList.add("hidden");
    regularUI.classList.remove("hidden");

    preGameElement.classList.remove("hidden");
    liveGameElement.classList.add("hidden");

    document.querySelector("#live-game > div.game-board").classList.remove("hidden");

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
    if (data.currentPlayer === "player1" && data.player1.type === "computer"
    ||  data.currentPlayer === "player2" && data.player2.type === "computer") {
      validRolls(data.move.combination, data.move.action === "cover")
      // return;
    }

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

    if (data.currentPlayer === "player1" && data.player1.type === "human") {
      helpButton.classList.remove("hidden");
    }

    if (data.currentPlayer === "player2" && data.player2.type === "human") {
      helpButton.classList.remove("hidden");
    }

    if (data.currentPlayer === "player1" && data.player1.type === "computer") {
      helpButton.classList.add("hidden");
    }

    if (data.currentPlayer === "player2" && data.player2.type === "computer") {
      helpButton.classList.add("hidden");
    }

    
    if ((data.currentPlayer === "player1" && data.player1.type === "computer") 
    ||  (data.currentPlayer === "player2" && data.player2.type === "computer")) {
      afterValidRoll(data);
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
    const currentTurn = currentTurnElement.textContent.includes("1") ? "player1" : "player2";

    // Determine the next turn
    const nextTurn = currentTurn === "player1" ? "player2" : "player1";

    // Format the game state as a string
    const gameStateString = `
    Computer:
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
    showStartUI();
  } catch (error) {
    console.error("Error saving the game:", error);
    alert("Failed to save the game. Please try again.");
  }
}

function parseGameState(content) {
  const lines = content.split("\n");
  const gameState = {
    player1: {
      type: "human",
      squares: [],
      score: 0
    },
    player2: {
      type: "computer",
      squares: [],
      score: 0
    },
    currentPlayer: "player1",
    screen: "PLAY",
    advantage: {
      square: null,
      applied: false,
      player: null
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes("Computer:")) {
      // Parse computer squares
      const squaresLine = lines[++i].trim();
      gameState.player2.squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(/\s+/) // Split on any whitespace
        .map(Number);

      // Parse computer score
      const scoreLine = lines[++i].trim();
      gameState.player2.score = parseInt(scoreLine.split("Score:")[1].trim());

    } else if (line.includes("Human:")) {
      // Parse human squares
      const squaresLine = lines[++i].trim();
      gameState.player1.squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(/\s+/) // Split on any whitespace
        .map(Number);

      // Parse human score
      const scoreLine = lines[++i].trim();
      gameState.player1.score = parseInt(scoreLine.split("Score:")[1].trim());

    } else if (line.includes("First Turn:")) {
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
      gameState.firstTurn = gameState.currentPlayer;
      
    } else if (line.includes("Next Turn:")) {
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
    }
  }

  // Set board size based on parsed squares
  gameState.boardSize = gameState.player1.squares.length || gameState.player2.squares.length;

  console.log("Parsed game state:", gameState);
  return gameState;
}

async function canThrowOneDie() {
  try {
    const response = await fetch('http://localhost:3000/api/game/can-throw-one-die');
    if (response.ok) {
      const data = await response.json();
      return data.canThrowOneDie;
    }
    return false; // Default to two dice if API fails
  } catch (error) {
    console.error('Error checking dice rules:', error);
    return false;
  }
}


// Add this function to show the rewind modal
async function showRewindModal() {
  const response = await fetch("http://localhost:3000/api/game/history");
  if (response.ok) {
    const data = await response.json();
    console.log("History response:", data);
    populateHistoryList(data.history);
    rewindModalElement.classList.remove("hidden");
    regularUI.classList.add("hidden");
  }
}

// New functions
function populateMoveHistory(history) {
  const container = document.getElementById("move-history-items");
  container.innerHTML = "";
  
  console.log("History:", history);
  history.forEach((move, index) => {
    const item = document.createElement("div");
    item.className = "move-item";
    item.dataset.index = index;
    
    const moveNumber = document.createElement("div");
    moveNumber.className = "move-number";
    moveNumber.textContent = `Move ${index + 1}`;
    
    const moveSummary = document.createElement("div");
    moveSummary.className = "move-summary";
    moveSummary.textContent = getMoveSummary(move);
    
    item.appendChild(moveNumber);
    item.appendChild(moveSummary);
    
    item.addEventListener("click", () => {
      document.querySelectorAll(".move-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
      updateMoveDetails(history[index]);
    });
    
    container.appendChild(item);
  });
}

function getMoveSummary(move) {
  const player = move.currentPlayer === "player1" ? "P1" : "P2";
  const action = move.lastAction === "cover" ? "covered" : "uncovered";
  const squares = move.lastSquares ? move.lastSquares.join(", ") : "none";
  return `${player} ${action} ${squares}`;
}

function updateMoveDetails(move) {
  // Update move info
  document.getElementById("detail-player").textContent = 
    move.currentPlayer === "player1" ? "Player 1" : "Player 2";
  document.getElementById("detail-action").textContent = 
    move.lastAction || "-";
  document.getElementById("detail-squares").textContent = 
    move.lastSquares ? move.lastSquares.join(", ") : "-";
  document.getElementById("detail-dice").textContent = 
    move.dice ? `${move.dice.dice1} + ${move.dice.dice2} = ${move.dice.total}` : "-";
  
  // Update board states
  renderMoveSquares("detail-player1-squares", move.player1.squares, 
                   move.advantage.player === "player1" ? move.advantage.square : -1);
  renderMoveSquares("detail-player2-squares", move.player2.squares, 
                   move.advantage.player === "player2" ? move.advantage.square : -1);
  
  // Update scores
  document.getElementById("detail-player1-score").textContent = move.player1.score;
  document.getElementById("detail-player2-score").textContent = move.player2.score;
}


function renderMoveSquares(elementId, squares, advantageSquare) {
  const container = document.getElementById(elementId);

  container.innerHTML = squares.map((square, index) => {
    const num = index + 1; // Position number (1-based)
    
    if (square === 0) {
      // Covered square - show as 0 with covered styling
      return `<span class="covered${num === advantageSquare ? ' advantage' : ''}">0</span>`;
    } else {
      // Uncovered square - show the stored value (which should equal the position number)
      return `<span${num === advantageSquare ? ' class="advantage"' : ''}>${square}</span>`;
    }
  }).join(" ");
}

