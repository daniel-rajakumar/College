

# File: ./JS/source/frontend/script.js

```javascript
/**
 * Game UI elements and state management for a board game application.
 * This script handles all frontend interactions with the game backend.
 * 
 * The game involves two players taking turns to cover/uncover squares based on dice rolls.
 * Players can be human or computer-controlled.
 */

// DOM Element References
// These elements represent the different parts of the game interface
const initialUI = document.getElementById("initial-ui");        // Initial screen (start menu)
const regularUI = document.getElementById("regular-ui");        // Main game screen
const loadGameInitialButton = document.getElementById("load-game-initial"); // Load game button
const newGameInitialButton = document.getElementById("new-game-initial");   // New game button
const humanSquaresElement = document.getElementById("human-squares");      // Player 1's board
const computerSquaresElement = document.getElementById("computer-squares"); // Player 2's board
const humanScoreElement = document.getElementById("human-score");           // Player 1 score display
const computerScoreElement = document.getElementById("computer-score");     // Player 2 score display
const diceRollElement = document.getElementById("dice-roll");              // Dice roll result display
const gameMessageElement = document.getElementById("game-message");        // Game status messages
const rollDiceButton = document.getElementById("roll-dice");              // Roll dice button
const helpButton = document.getElementById("help");                        // Help button
const rewindButton = document.getElementById("rewind");                    // Rewind move button
const saveGameButton = document.getElementById("save-game");               // Save game button
const boardSizeSelect = document.getElementById("board-size");             // Board size selector
const applyConfigButton = document.getElementById("apply-config");         // Apply settings button
const preGameElement = document.getElementById("pre-game");                // Pre-game config screen
const liveGameElement = document.getElementById("live-game");              // Main game screen
const inputDiceButton = document.getElementById("input-dice");             // Manual dice input button
const diceModalElement = document.getElementById("dice-modal");            // Dice input modal
const gameUIElement = document.getElementById("game-ui");                  // Main game container
const diceResultElement = document.getElementById("dice-result");          // Dice result display
const submitDiceButton = document.getElementById("submit-dice");           // Submit manual dice button
const closeButton = document.getElementById("close-button");               // Close modal button
const validRollsElement = document.getElementById("valid-rolls");          // Valid moves dropdown
const confirmValidRollsButton = document.getElementById("confirm-valid-rolls"); // Confirm move button
const coverSwitchElement = document.getElementById("cover-switch");        // Cover/uncover toggle
const fileInput = document.getElementById("file-input");                   // File upload input
const computerBoardElement = document.getElementById("computer-board");     // Computer's board container
const humanBoardElement = document.getElementById("human-board");          // Human's board container
const player1TypeElement = document.getElementById("player1-type-select"); // Player 1 type selector
const player2TypeElement = document.getElementById("player2-type-select"); // Player 2 type selector
const toggleSwitchElement = document.getElementById("toggle-switch");      // Board view toggle
const ExitGameButton = document.getElementById("exit-game");               // Exit game button
const playAgainGameButton = document.getElementById("play-again-game");    // Play again button
const roundWinnerElement = document.getElementById("round-winner");        // Round winner display
const roundWinnerTextElement = document.getElementById("round-winner-text"); // Winner text
const currentTurnElement = document.querySelector("#live-game > div.current-turn"); // Turn indicator
const rewindModalElement = document.getElementById("rewind-modal");        // Rewind history modal
const closeRewindButton = document.getElementById("close-rewind-button");  // Close rewind modal button
const confirmRewindButton = document.getElementById("confirm-rewind");     // Confirm rewind button
const historyListElement = document.getElementById("history-list");        // Move history list
const useOneDieElement = document.getElementById("use-one-die");           // Use one die checkbox
const diceToggleContainer = document.getElementById("dice-toggle-container"); // Dice options container
const titleElement = document.getElementById("title-game");                // Game title
const rollDieFirstPlayerElement = document.getElementById("roll-die-first-player"); // First roll button
const gameBoardElement = document.getElementById("game-board");            // Game board container
const playButton = document.getElementById("play-button");                 // Start game button

// Game state variables
let selectedHistoryIndex = -1;  // Track selected move in rewind history
let isNewGame = true;           // Flag for new game vs resumed game

// Event Listeners
loadGameInitialButton.addEventListener("click", handleLoadGame);
newGameInitialButton.addEventListener("click", handleNewGame);
rollDiceButton.addEventListener("click", handleRollDice);
helpButton.addEventListener("click", handleHelp);
rewindButton.addEventListener("click", showRewindModal);
saveGameButton.addEventListener("click", handleSaveGame);
applyConfigButton.addEventListener("click", handleApplyConfig);
rollDieFirstPlayerElement.addEventListener("click", handleFirstTurnRoll);
playButton.addEventListener("click", handleStartGame);
inputDiceButton.addEventListener("click", handleInputDice);
closeButton.addEventListener("click", closeDiceModal);
submitDiceButton.addEventListener("click", handleSubmitDice);
confirmValidRollsButton.addEventListener("click", handleConfirmValidRolls);
fileInput.addEventListener("change", handleFileUpload);
toggleSwitchElement.addEventListener("change", handleToggleSwitch);
ExitGameButton.addEventListener("click", handleExitGame);
playAgainGameButton.addEventListener("click", handlePlayAgain);
confirmRewindButton.addEventListener("click", handleConfirmRewind);
closeRewindButton.addEventListener("click", closeRewindModal);
useOneDieElement.addEventListener("change", handleUseOneDieChange);

/**
 * Shows the regular game UI by hiding the initial UI
 * Used when transitioning from start screen to main game
 */
function showRegularUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");
}

/**
 * Renders squares for a player's board with visual indicators
 * 
 * Handles:
 * - Displaying covered/uncovered squares
 * - Highlighting the advantage square
 * - Showing protection on opponent's advantage square when applicable
 * 
 * @param {HTMLElement} container - DOM element to render into 
 * @param {Array<number>} squares - Current square states (0 = covered)
 * @param {number} advantage - Position of advantage square (1-based) or -1 if none
 */
function renderSquares(container, squares, advantage) {
  container.innerHTML = "";
  const squaresWrapper = document.createElement("div");
  squaresWrapper.classList.add("squares-wrapper");

  // Visual representation as an array: [1 2 3...]
  const openBracket = document.createElement("span");
  openBracket.textContent = "[";
  openBracket.classList.add("square-num");
  squaresWrapper.appendChild(openBracket);

  squares.forEach((square, index) => {
    const squareElement = document.createElement("span");
    squareElement.classList.add("square");
    const position = index + 1;  // Convert to 1-based index
       
    // Check if this is a protected advantage square (on opponent's board)
    const isProtected = position === advantage && 
                       container.id === "computer-squares" && 
                       !canUncoverAdvantageSquare();

    if (isProtected) {
      // Show protected state - can't be uncovered yet
      squareElement.classList.add("protected-advantage");
      squareElement.title = "Cannot uncover until advantaged player takes a turn";
    } else if (position === advantage) {
      // Normal advantage square highlighting
      squareElement.classList.add("advantage");
    }

    squareElement.textContent = square;
    squareElement.classList.add("square-num");
    squaresWrapper.appendChild(squareElement);

    // Add space between numbers but not after last one
    if (index !== squares.length - 1) {
      const comma = document.createElement("span");
      comma.textContent = " ";
      squaresWrapper.appendChild(comma);
    }
  });

  // Close the visual array representation
  const closeBracket = document.createElement("span");
  closeBracket.classList.add("square-num");
  closeBracket.textContent = "]";
  squaresWrapper.appendChild(closeBracket);

  container.appendChild(squaresWrapper);
}

/**
 * Fetches the current game state from the backend
 * @returns {Promise<Object>} The game state object containing:
 * - Player boards
 * - Scores
 * - Current turn
 * - Advantage status
 */
async function fetchGameState() {
  try {
    const response = await fetch("http://localhost:3000/api/game/state");
    if (!response.ok) throw new Error("Failed to fetch game state");
    const data = await response.json();
    console.log("Game state from backend:", data); 
    return data;
  } catch (error) {
    console.error("Error fetching game state:", error);
    gameMessageElement.textContent = "Error loading game state";
    return null;
  }
}

/**
 * Updates all UI elements with current game state
 * 
 * This is the main function that keeps the interface in sync
 * with the backend game state
 */
async function updateUI() {
  try {
    const state = await fetchGameState();
    if (!state) return;

    // Update player boards with advantage indicators
    if (state.advantage.player === "player1") {
      renderSquares(humanSquaresElement, state.player1.squares, state.advantage.square);
    } else {
      renderSquares(humanSquaresElement, state.player1.squares, -1);
    }

    if (state.advantage.player === "player2") {
      renderSquares(computerSquaresElement, state.player2.squares, state.advantage.square);
    } else {
      renderSquares(computerSquaresElement, state.player2.squares, -1);
    }

    // Update scores and game info
    humanScoreElement.textContent = state.player1.score;
    computerScoreElement.textContent = state.player2.score;
    diceRollElement.textContent = state.diceRoll || "No dice rolled yet.";
    gameMessageElement.textContent = state.message || "";
    currentTurnElement.textContent = "Current Turn: " + (state.currentPlayer || "Unknown");
    diceResultElement.textContent = "Dice: " + (state.dice?.total || "No dice rolled yet.");
    
    // Update player type displays
    document.querySelector("#human-board > h2").innerHTML = "Player 1: " + state.player1.type;
    document.querySelector("#computer-board > h2").innerHTML = "Player 2: " + state.player2.type;
  } catch (error) {
    console.error("Error updating UI:", error);
    gameMessageElement.textContent = "Error updating game display";
  }
}

/**
 * Handles loading a saved game from server storage
 */
async function handleLoadGame() {
  try {
    gameMessageElement.textContent = "Loading game...";
    const response = await fetch("http://localhost:3000/api/game/load", {
      method: "POST",
    });
    
    if (!response.ok) throw new Error("Load request failed");
    
    const data = await response.json();
    console.log("Load game response:", data); 

    if (data.screen === "LOAD") {
      showConfigUI(data.screen);
    } else {
      console.error("Unknown screen:", data.screen);
      gameMessageElement.textContent = "Unexpected response from server";
    }
  } catch (error) {
    console.error("Error loading game:", error);
    gameMessageElement.textContent = "Failed to load game";
  }
}

/**
 * Handles starting a new game by showing configuration UI
 */
async function handleNewGame() {
  try {
    isNewGame = true;
    showConfigUI("CONFIG");
    gameMessageElement.textContent = "Configure your new game";
  } catch (error) {
    console.error("Error starting new game:", error);
    gameMessageElement.textContent = "Error setting up new game";
  }
}

/**
 * Handles the dice roll action
 * 
 * This initiates a new turn by:
 * 1. Sending roll request to backend
 * 2. Processing the result
 * 3. Updating UI based on who rolled (human/computer)
 */
async function handleRollDice() {
  try {
    gameMessageElement.textContent = "Rolling dice...";
    rollDiceButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/roll-dice", {
      method: "POST",
    });
    
    if (!response.ok) throw new Error("Roll request failed");
    
    const data = await response.json();
    console.log("Roll dice response:", data);
    afterDieRoll(data);  // Process the roll result
  } catch (error) {
    console.error("Failed to roll dice:", error);
    gameMessageElement.textContent = "Error rolling dice. Please try again.";
  } finally {
    rollDiceButton.disabled = false;
  }
}

/**
 * Handles requesting help from the computer
 * Shows suggested moves for human players
 */
async function handleHelp() {
  try {
    gameMessageElement.textContent = "Getting help...";
    helpButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/help", {
      method: "POST",
    });
    
    if (!response.ok) throw new Error("Help request failed");
    
    const data = await response.json();
    console.log("Help response:", data);
    updateUI();
    gameMessageElement.textContent = data.message || "Here's a suggested move";
  } catch (error) {
    console.error("Error getting help:", error);
    gameMessageElement.textContent = "Failed to get help";
  } finally {
    helpButton.disabled = false;
  }
}

/**
 * Handles saving the current game state to server storage
 */
async function handleSaveGame() {
  try {
    gameMessageElement.textContent = "Saving game...";
    saveGameButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/save", {
      method: "POST",
    });
    
    if (!response.ok) throw new Error("Save request failed");
    
    const data = await response.json();
    console.log("Save game response:", data); 
    saveGame();  // Handle file save to local system
    gameMessageElement.textContent = "Game saved successfully!";
  } catch (error) {
    console.error("Error saving game:", error);
    gameMessageElement.textContent = "Failed to save game";
  } finally {
    saveGameButton.disabled = false;
  }
}

/**
 * Handles applying game configuration settings
 * 
 * Sends board size and player types to backend
 * to initialize a new game
 */
async function handleApplyConfig() {
  try {
    gameMessageElement.textContent = "Applying settings...";
    applyConfigButton.disabled = true;
    
    const boardSize = boardSizeSelect.value;
    const player1Type = player1TypeElement.value;
    const player2Type = player2TypeElement.value;

    const endpoint = isNewGame ? "new" : "play-again";
    const response = await fetch(`http://localhost:3000/api/game/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ boardSize, player1Type, player2Type }),
    });
    
    if (!response.ok) throw new Error("Config request failed");
    
    const data = await response.json();
    console.log("Apply config response:", data); 

    if (data.screen === "PLAY") {
      // Transition to game screen
      preGameElement.classList.add("hidden");
      liveGameElement.classList.remove("hidden");
      rollDieFirstPlayerElement.classList.remove("hidden");
      
      // Set up initial UI state
      rollDiceButton.classList.add("hidden");
      helpButton.classList.add("hidden");
      coverSwitchElement.classList.add("hidden");
      ExitGameButton.classList.add("hidden");
      playAgainGameButton.classList.add("hidden");
      currentTurnElement.classList.add("hidden");
      inputDiceButton.classList.add("hidden");
      rewindButton.classList.add("hidden");
      saveGameButton.classList.add("hidden");  
      gameBoardElement.classList.add("hidden");
      gameMessageElement.classList.remove("hidden");
      playButton.classList.add("hidden");
      
      gameMessageElement.textContent = "Game ready! Roll to determine first turn";
    } else {
      console.error("Unknown screen:", data.screen);
      gameMessageElement.textContent = "Unexpected response from server";
    }
  } catch (error) {
    console.error("Error applying config:", error);
    gameMessageElement.textContent = "Failed to apply settings";
  } finally {
    applyConfigButton.disabled = false;
  }
}

/**
 * Handles rolling for first turn determination
 * 
 * Both players roll a die, higher roll goes first
 * Handles tie cases by prompting to roll again
 */
async function handleFirstTurnRoll() {
  try {
    gameMessageElement.textContent = "Determining first turn...";
    rollDieFirstPlayerElement.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/roll-dice-first-turn", {
      method: "POST",
    });

    if (!response.ok) throw new Error("First roll request failed");
    
    const data = await response.json();
    let msg = "";

    // Handle different roll outcomes
    if (data.winner === "tie") {
      msg = `You rolled ${data.p1} & Computer rolled ${data.p2}. It's a tie! Please roll again.`;
    } else if (data.winner === "player1") {
      msg = `You rolled ${data.p1} & Computer rolled ${data.p2}. You win the first turn!`;
    } else if (data.winner === "player2") {
      msg = `You rolled ${data.p1} | Computer rolled ${data.p2}. Computer wins the first turn!`;
    }

    gameMessageElement.textContent = msg;
    rollDieFirstPlayerElement.classList.add("hidden");
    
    // Only show play button if not a tie
    if (data.winner !== "tie") {
      playButton.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error determining first turn:", error);
    gameMessageElement.textContent = "Error determining first turn";
  } finally {
    rollDieFirstPlayerElement.disabled = false;
  }
}

/**
 * Handles starting the game after first turn is determined
 * 
 * Transitions from first roll screen to main game interface
 */
async function handleStartGame() {
  try {
    gameMessageElement.textContent = "Starting game...";
    playButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/start-game", {
      method: "POST",
    });

    if (!response.ok) throw new Error("Start game request failed");
    
    showLiveGameUI();
    updateUI();

    // Set up UI for active game
    liveGameElement.classList.remove("hidden");
    rollDiceButton.classList.remove("hidden");
    helpButton.classList.add("hidden");
    coverSwitchElement.classList.add("hidden");
    ExitGameButton.classList.add("hidden");
    playAgainGameButton.classList.add("hidden");
    currentTurnElement.classList.remove("hidden");
    inputDiceButton.classList.remove("hidden");
    rewindButton.classList.remove("hidden");
    saveGameButton.classList.remove("hidden");  
    gameBoardElement.classList.remove("hidden");
    playButton.classList.add("hidden");
    
    gameMessageElement.textContent = "Game started!";
  } catch (error) {
    console.error("Error starting game:", error);
    gameMessageElement.textContent = "Failed to start game";
  } finally {
    playButton.disabled = false;
  }
}

/**
 * Handles opening the manual dice input modal
 * 
 * Checks if single die mode is allowed before showing options
 */
async function handleInputDice() {
  try {
    const canThrowSingleDie = await canThrowOneDie();

    if (canThrowSingleDie) {
      diceToggleContainer.classList.remove("hidden");
    }

    regularUI.classList.add("hidden");
    diceModalElement.classList.remove("hidden");
    gameMessageElement.textContent = "Enter your dice values";
  } catch (error) {
    console.error("Error opening dice input:", error);
    gameMessageElement.textContent = "Error setting up dice input";
  }
}

/**
 * Closes the dice input modal
 */
function closeDiceModal() {
  regularUI.classList.remove("hidden");
  diceModalElement.classList.add("hidden");
  gameMessageElement.textContent = "";
}

/**
 * Handles submitting manually entered dice values
 * 
 * Validates input before sending to backend
 */
async function handleSubmitDice() {
  try {
    const dice1 = parseInt(document.getElementById("dice1").value);
    const dice2 = parseInt(document.getElementById("dice2").value);
    const inputDice = [dice1, dice2];
    const useOneDie = useOneDieElement.checked;

    // Validate input
    if (!useOneDie && (isNaN(dice1) || isNaN(dice2) || dice1 < 1 || dice1 > 6 || dice2 < 1 || dice2 > 6)) {
      alert("Please enter valid dice values between 1 and 6");
      return;
    }

    gameMessageElement.textContent = "Processing dice...";
    submitDiceButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/roll-dice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputDice }),
    });

    if (!response.ok) throw new Error("Dice submission failed");
    
    const data = await response.json();
    console.log("Input dice response:", data); 
    afterDieRoll(data);
    gameMessageElement.textContent = "Dice accepted!";
  } catch (error) {
    console.error("Error submitting dice:", error);
    gameMessageElement.textContent = "Failed to process dice";
  } finally {
    submitDiceButton.disabled = false;
  }
}

/**
 * Handles confirming selected valid moves
 * 
 * Sends the player's move choice to backend
 */
async function handleConfirmValidRolls() {
  try {
    const validMove = validRollsElement.value;
    const toCover = toggleSwitchElement.checked;
    
    gameMessageElement.textContent = "Processing move...";
    confirmValidRollsButton.disabled = true;
    
    await validRolls(validMove, toCover);
    gameMessageElement.textContent = "Move processed!";
  } catch (error) {
    console.error("Error confirming move:", error);
    gameMessageElement.textContent = "Failed to process move";
  } finally {
    confirmValidRollsButton.disabled = false;
  }
}

/**
 * Handles uploading a saved game file
 * 
 * Parses the file and sends to backend to load game state
 * @param {Event} event - The file input change event
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    gameMessageElement.textContent = "Loading game file...";
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        const gameState = parseGameState(content);
        gameState.player1Type = "human";
        gameState.player2Type = "computer";

        const response = await fetch("http://localhost:3000/api/game/load-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gameState),
        });

        if (!response.ok) throw new Error("File load request failed");
        
        const data = await response.json();
        console.log("File load response:", data);

        showLiveGameUI();
        updateUI();

        // Set up UI for loaded game
        rollDiceButton.classList.remove("hidden");
        helpButton.classList.add("hidden");
        coverSwitchElement.classList.add("hidden");
        ExitGameButton.classList.add("hidden");
        playAgainGameButton.classList.add("hidden");
        currentTurnElement.classList.remove("hidden");
        fileInput.classList.add("hidden");
        rollDieFirstPlayerElement.classList.add("hidden");
        playButton.classList.add("hidden");
        
        gameMessageElement.textContent = "Game loaded successfully!";
      } catch (parseError) {
        console.error("Error parsing or loading game state:", parseError);
        gameMessageElement.textContent = "Invalid game file format";
      }
    };
    
    reader.readAsText(file);
  } catch (error) {
    console.error("Error handling file upload:", error);
    gameMessageElement.textContent = "Failed to load game file";
  }
}

/**
 * Handles toggle switch changes between cover/uncover modes
 */
async function handleToggleSwitch() {
  try {
    const checked = toggleSwitchElement.checked;
    gameMessageElement.textContent = "Updating mode...";
    toggleSwitchElement.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checked }),
    });
    
    if (!response.ok) throw new Error("Toggle request failed");
    
    const data = await response.json();
    console.log("Toggle response:", data); 
    populateStringSelect(data);
    updateUI();
    gameMessageElement.textContent = checked ? "Now in cover mode" : "Now in uncover mode";
  } catch (error) {
    console.error("Error toggling mode:", error);
    gameMessageElement.textContent = "Failed to change mode";
  } finally {
    toggleSwitchElement.disabled = false;
  }
}

/**
 * Handles exiting the game and showing winner
 */
async function handleExitGame() {
  try {
    gameMessageElement.textContent = "Finalizing game...";
    ExitGameButton.disabled = true;
    
    const response = await fetch("http://localhost:3000/api/game/winner", {
      method: "POST",
    });
    
    if (!response.ok) throw new Error("Exit request failed");
    
    const data = await response.json();
    console.log("Exit game response:", data);
    showStartUI();
    loadGameInitialButton.classList.add("hidden");
    newGameInitialButton.classList.add("hidden");
    titleElement.textContent = "Winner is: " + data.winner;
  } catch (error) {
    console.error("Error exiting game:", error);
    gameMessageElement.textContent = "Failed to exit game";
  } finally {
    ExitGameButton.disabled = false;
  }
}

/**
 * Handles playing the game again with same settings
 * 
 * Preserves previous game configuration
 */
async function handlePlayAgain() {
  try {
    console.log("Playing again");
    player1TypeElement.disabled = true;
    player2TypeElement.disabled = true;
    isNewGame = false;

    // Get previous state to maintain settings
    const previousState = await fetchGameState();
    console.log("Previous state:", previousState);

    if (previousState) {
      boardSizeSelect.value = previousState.BOARD_SIZE;
      player1TypeElement.value = previousState.fullGame.player1.type;
      player2TypeElement.value = previousState.fullGame.player2.type;
    }
    
    showConfigUI("CONFIG");
    gameMessageElement.textContent = "Setting up new game with same settings...";
  } catch (error) {
    console.error("Error setting up play again:", error);
    gameMessageElement.textContent = "Failed to set up new game";
  }
}

/**
 * Handles confirming rewind to selected move
 */
async function handleConfirmRewind() {
  try {
    const selectedItem = document.querySelector(".move-item.selected");
    if (!selectedItem) {
      alert("Please select a move to rewind to");
      return;
    }

    gameMessageElement.textContent = "Rewinding move...";
    confirmRewindButton.disabled = true;
    
    const index = parseInt(selectedItem.dataset.index);
    const response = await fetch("http://localhost:3000/api/game/rewind-move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ index }),
    });
    
    if (!response.ok) throw new Error("Rewind request failed");
    
    const data = await response.json();
    updateUI();
    rewindModalElement.classList.add("hidden");
    regularUI.classList.remove("hidden");
    gameMessageElement.textContent = "Game rewound to selected move";
  } catch (error) {
    console.error("Error rewinding move:", error);
    gameMessageElement.textContent = "Failed to rewind move";
  } finally {
    confirmRewindButton.disabled = false;
  }
}

/**
 * Closes the rewind history modal
 */
function closeRewindModal() {
  rewindModalElement.classList.add("hidden");
  regularUI.classList.remove("hidden");
}

/**
 * Handles changes to the "use one die" checkbox
 * 
 * Disables/enables the second die input accordingly
 */
function handleUseOneDieChange() {
  const dice2Input = document.getElementById("dice2");
  
  if (useOneDieElement.checked) {
    dice2Input.disabled = true;
    dice2Input.value = 0;
  } else {
    dice2Input.disabled = false;
  }
}

/**
 * Processes valid rolls selection
 * 
 * Sends the selected move to backend for validation and processing
 * @param {string} validMove - The selected valid move
 * @param {boolean} toCover - Whether to cover or uncover squares
 */
async function validRolls(validMove = validRollsElement.value, toCover = toggleSwitchElement.checked) {
  try {
    console.log("Processing move:", validMove, toCover ? "cover" : "uncover");
    
    const response = await fetch("http://localhost:3000/api/game/valid-move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ validMove, toCover }),
    });

    if (!response.ok) throw new Error("Move validation failed");
    
    const data = await response.json();
    console.log("Move response:", data); 
    afterValidRoll(data);
    updateUI();
  } catch (error) {
    console.error("Error processing move:", error);
    gameMessageElement.textContent = "Failed to process move";
  }
}

/**
 * Updates UI after valid rolls are processed
 * 
 * Handles transition between move phases and game over state
 * @param {Object} data - Game state data after processing valid rolls
 */
function afterValidRoll(data) {
  // Reset UI elements for next turn
  diceResultElement.classList.add("hidden");
  rollDiceButton.classList.remove("hidden");
  inputDiceButton.classList.remove("hidden");
  validRollsElement.classList.add("hidden");
  confirmValidRollsButton.classList.add("hidden");
  coverSwitchElement.classList.add("hidden");
  rewindButton.classList.remove("hidden");
  saveGameButton.classList.remove("hidden");
  helpButton.classList.add("hidden");

  // Handle game over state
  if (data.gameOver) {
    console.log("Game over! Winner:", data.winner);
    
    // Disable game controls
    rewindButton.classList.add("hidden");
    saveGameButton.classList.add("hidden");
    inputDiceButton.classList.add("hidden");
    rollDiceButton.classList.add("hidden");
    
    // Show game over options
    ExitGameButton.classList.remove("hidden");
    playAgainGameButton.classList.remove("hidden");
    helpButton.classList.add("hidden");
    currentTurnElement.classList.add("hidden");
    document.querySelector("#live-game > div.game-board").classList.add("hidden");

    // Highlight winner
    gameUIElement.classList.add("hidden");
    alert(`Game Over! Winner: ${data.winner}`);
    gameUIElement.classList.remove("hidden");
  }
}

/**
 * Shows the start UI screen with game title and options
 */
function showStartUI() {
  initialUI.classList.remove("hidden");
  regularUI.classList.add("hidden");
  gameMessageElement.textContent = "Welcome to the game!";
}

/**
 * Shows the configuration UI screen
 * @param {string} screen - The screen to show ("CONFIG" or "LOAD")
 */
function showConfigUI(screen) {
  if (screen === "CONFIG") {
    // Show new game configuration
    initialUI.classList.add("hidden");
    regularUI.classList.remove("hidden");
    preGameElement.classList.remove("hidden");
    liveGameElement.classList.add("hidden");
    document.querySelector("#live-game > div.game-board").classList.remove("hidden");
    diceResultElement.classList.add("hidden");
    gameMessageElement.textContent = "Configure your game settings";
  } else if (screen === "LOAD") {
    // Show load game interface
    initialUI.classList.add("hidden");
    fileInput.classList.remove("hidden");
    gameMessageElement.textContent = "Select a saved game file";
  }
}

/**
 * Shows the live game UI screen with all game controls
 */
function showLiveGameUI() {
  initialUI.classList.add("hidden");
  regularUI.classList.remove("hidden");
  preGameElement.classList.add("hidden");
  liveGameElement.classList.remove("hidden");
  gameMessageElement.textContent = "Game in progress";
}

/**
 * Processes the game state after dice are rolled
 * 
 * Handles:
 * - Computer moves automatically
 * - Shows valid moves for human players
 * - Updates UI elements accordingly
 * @param {Object} data - Game state from backend after rolling
 */
function afterDieRoll(data) {
  // Computer players make their move immediately
  if ((data.currentPlayer === "player1" && data.player1.type === "computer") ||
      (data.currentPlayer === "player2" && data.player2.type === "computer")) {
    validRolls(data.move.combination, data.move.action === "cover");
  }

  // Show dice result and available moves
  regularUI.classList.remove("hidden");
  diceModalElement.classList.add("hidden");
  diceResultElement.classList.remove("hidden");
  diceResultElement.textContent = `Dice: ${data.dice.total}`;
  
  // Set up UI for player's turn
  rollDiceButton.classList.add("hidden");
  inputDiceButton.classList.add("hidden");
  validRollsElement.classList.remove("hidden");
  confirmValidRollsButton.classList.remove("hidden");
  coverSwitchElement.classList.remove("hidden");
  rewindButton.classList.add("hidden");
  saveGameButton.classList.add("hidden");

  // Populate valid moves dropdown
  populateStringSelect(data.validCoverCombinations || []);

  // Enable help for human players
  if ((data.currentPlayer === "player1" && data.player1.type === "human") ||
      (data.currentPlayer === "player2" && data.player2.type === "human")) {
    helpButton.classList.remove("hidden");
  } else {
    helpButton.classList.add("hidden");
  }

  updateUI();  // Refresh all game displays
}

/**
 * Populates the valid moves dropdown with available options
 * 
 * Filters out invalid moves based on advantage square rules
 * @param {Array<string>} strings - Array of valid move strings
 */
async function populateStringSelect(strings) {
  const validRollsElement = document.getElementById("valid-rolls");
  validRollsElement.innerHTML = "";
  
  // Get current game state for advantage rules
  const state = await fetchGameState();
  const advantageSquare = state.advantage?.square;
  const advantageApplied = state.advantage?.applied;
  const isOpponentBoard = !toggleSwitchElement.checked; 
  const currentPlayer = state.currentPlayer;
  const advantagePlayer = state.advantage?.player;
  
  // Check if advantage square can be uncovered
  const canUncover = advantageApplied ? 
    (currentPlayer === advantagePlayer || state.advantage?.hasTakenTurn) : true;

  // Add each valid move option
  strings.forEach(str => {
    // Skip moves involving protected advantage square
    if (advantageApplied && isOpponentBoard && str.includes(advantageSquare) && !canUncover) {
      return;
    }
    
    const option = document.createElement("option");
    option.value = str;
    option.textContent = str;
    validRollsElement.appendChild(option);
  });
}

/**
 * Saves the current game state to a local file
 * 
 * Creates a text file containing all game state information
 */
async function saveGame() {
  try {
    gameMessageElement.textContent = "Preparing save file...";
    
    // Gather current game state from UI
    const humanSquares = Array.from(humanSquaresElement.querySelectorAll('.square'))
                           .map(square => square.textContent).join(' ');
    const computerSquares = Array.from(computerSquaresElement.querySelectorAll('.square'))
                             .map(square => square.textContent).join(' ');
    const humanScore = humanScoreElement.textContent;
    const computerScore = computerScoreElement.textContent;
    const currentTurn = currentTurnElement.textContent.includes("1") ? "player1" : "player2";

    // Format game state as human-readable text
    const gameStateString = `
Computer:
  Squares: ${computerSquares}
  Score: ${computerScore}

Human:
  Squares: ${humanSquares}
  Score: ${humanScore}

First Turn: ${currentTurn}
Next Turn: ${currentTurn === "player1" ? "player2" : "player1"}`;

    // Create file and prompt user to save
    const blob = new Blob([gameStateString], { type: "text/plain;charset=utf-8" });
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: "savegame.txt",
      types: [{
        description: "Text Files",
        accept: { "text/plain": [".txt"] },
      }],
    });

    // Write file
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();

    console.log("Game saved successfully!");
    showStartUI();
    gameMessageElement.textContent = "Game saved successfully!";
  } catch (error) {
    console.error("Error saving the game:", error);
    gameMessageElement.textContent = "Failed to save game. Please try again.";
  }
}

/**
 * Parses game state from file content
 * 
 * Extracts:
 * - Player board states
 * - Scores
 * - Turn information
 * @param {string} content - The file content to parse
 * @returns {Object} The parsed game state object
 */
function parseGameState(content) {
  const lines = content.split("\n");
  const gameState = {
    player1: { type: "human", squares: [], score: 0 },
    player2: { type: "computer", squares: [], score: 0 },
    currentPlayer: "player1",
    screen: "PLAY",
    advantage: { square: null, applied: false, player: null }
  };

  // Parse each line of the save file
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.includes("Computer:")) {
      // Parse computer player data
      const squaresLine = lines[++i].trim();
      gameState.player2.squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(/\s+/) 
        .map(Number);

      const scoreLine = lines[++i].trim();
      gameState.player2.score = parseInt(scoreLine.split("Score:")[1].trim());
    } else if (line.includes("Human:")) {
      // Parse human player data
      const squaresLine = lines[++i].trim();
      gameState.player1.squares = squaresLine
        .split("Squares:")[1]
        .trim()
        .split(/\s+/) 
        .map(Number);

      const scoreLine = lines[++i].trim();
      gameState.player1.score = parseInt(scoreLine.split("Score:")[1].trim());
    } else if (line.includes("First Turn:")) {
      // Parse starting player
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
      gameState.firstTurn = gameState.currentPlayer;
    } else if (line.includes("Next Turn:")) {
      // Parse current player
      gameState.currentPlayer = line.includes("Human") ? "player1" : "player2";
    }
  }

  // Set board size based on parsed squares
  gameState.boardSize = gameState.player1.squares.length || gameState.player2.squares.length;
  console.log("Parsed game state:", gameState);
  return gameState;
}

/**
 * Checks if one die can be thrown according to game rules
 * @returns {Promise<boolean>} Whether one die can be thrown
 */
async function canThrowOneDie() {
  try {
    const response = await fetch('http://localhost:3000/api/game/can-throw-one-die');
    if (response.ok) {
      const data = await response.json();
      return data.canThrowOneDie;
    }
    return false; 
  } catch (error) {
    console.error('Error checking dice rules:', error);
    return false;
  }
}

/**
 * Shows the rewind modal with move history
 */
async function showRewindModal() {
  try {
    gameMessageElement.textContent = "Loading move history...";
    
    const response = await fetch("http://localhost:3000/api/game/history");
    if (!response.ok) throw new Error("History request failed");
    
    const data = await response.json();
    console.log("History response:", data);
    
    populateHistoryList(data.history);
    rewindModalElement.classList.remove("hidden");
    regularUI.classList.add("hidden");
    gameMessageElement.textContent = "Select a move to rewind to";
  } catch (error) {
    console.error("Error loading history:", error);
    gameMessageElement.textContent = "Failed to load move history";
  }
}

/**
 * Populates the move history list in the rewind modal
 * @param {Array<Object>} history - Array of move history objects
 */
function populateMoveHistory(history) {
  const container = document.getElementById("move-history-items");
  container.innerHTML = "";
  
  console.log("History:", history);
  history.forEach((move, index) => {
    const item = document.createElement("div");
    item.className = "move-item";
    item.dataset.index = index;
    
    // Create move number display
    const moveNumber = document.createElement("div");
    moveNumber.className = "move-number";
    moveNumber.textContent = `Move ${index + 1}`;
    
    // Create move summary
    const moveSummary = document.createElement("div");
    moveSummary.className = "move-summary";
    moveSummary.textContent = getMoveSummary(move);
    
    // Add click handler to select move
    item.addEventListener("click", () => {
      document.querySelectorAll(".move-item").forEach(el => el.classList.remove("selected"));
      item.classList.add("selected");
      updateMoveDetails(history[index]);
    });
    
    // Assemble item
    item.appendChild(moveNumber);
    item.appendChild(moveSummary);
    container.appendChild(item);
  });
}

/**
 * Generates a summary string for a move
 * @param {Object} move - The move object
 * @returns {string} The move summary string
 */
function getMoveSummary(move) {
  const player = move.currentPlayer === "player1" ? "P1" : "P2";
  const action = move.lastAction === "cover" ? "covered" : "uncovered";
  const squares = move.lastSquares ? move.lastSquares.join(", ") : "none";
  return `${player} ${action} ${squares}`;
}

/**
 * Updates move details in the rewind modal
 * @param {Object} move - The move object to display details for
 */
function updateMoveDetails(move) {
  // Update basic move info
  document.getElementById("detail-player").textContent = 
    move.currentPlayer === "player1" ? "Player 1" : "Player 2";
  document.getElementById("detail-action").textContent = move.lastAction || "-";
  document.getElementById("detail-squares").textContent = 
    move.lastSquares ? move.lastSquares.join(", ") : "-";
  document.getElementById("detail-dice").textContent = 
    move.dice ? `${move.dice.dice1} + ${move.dice.dice2} = ${move.dice.total}` : "-";
  
  // Render board states
  renderMoveSquares("detail-player1-squares", 
                   move.player1.squares, 
                   move.advantage.player === "player1" ? move.advantage.square : -1);
  renderMoveSquares("detail-player2-squares", 
                   move.player2.squares, 
                   move.advantage.player === "player2" ? move.advantage.square : -1);
  
  // Update scores
  document.getElementById("detail-player1-score").textContent = move.player1.score;
  document.getElementById("detail-player2-score").textContent = move.player2.score;
}

/**
 * Renders squares for a move detail view
 * @param {string} elementId - The ID of the element to render squares in
 * @param {Array<number>} squares - Array of square values
 * @param {number} advantageSquare - The advantage square position (1-based index)
 */
function renderMoveSquares(elementId, squares, advantageSquare) {
  const container = document.getElementById(elementId);

  container.innerHTML = squares.map((square, index) => {
    const num = index + 1; 

    if (square === 0) {
      // Covered square
      return `<span class="covered${num === advantageSquare ? ' advantage' : ''}">0</span>`;
    } else {
      // Uncovered square
      return `<span${num === advantageSquare ? ' class="advantage"' : ''}>${square}</span>`;
    }
  }).join(" ");
}

/**
 * Checks if the advantage square can be uncovered
 * 
 * Determines if the current player is allowed to uncover
 * the opponent's advantage square
 * @returns {Promise<boolean>} Whether the advantage square can be uncovered
 */
async function canUncoverAdvantageSquare() {
  try {
    const response = await fetch('http://localhost:3000/api/game/can-uncover-advantage');
    if (response.ok) {
      const data = await response.json();
      return data.canUncover;
    }
    return true; // Default to allowing if check fails
  } catch (error) {
    console.error('Error checking advantage status:', error);
    return true;
  }
}
```


# File: ./JS/source/backend/server.js

```javascript
/**
 * Server-side implementation for the board game application.
 * 
 * This file handles:
 * - Game state management
 * - API endpoints for frontend interactions
 * - Game logic and rules enforcement
 * - Tournament management
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const Tournament = require("./models/Tournament");
const Game = require("./models/Game");

// Initialize Express application
const app = express();
const PORT = 3000;

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve static frontend files

// Initialize tournament instance
const tournament = new Tournament();

// Test advantage square calculation (debug)
const n = 6; 
console.log(tournament.getAdvantageSquare("4 4"));

// Utility function for rolling dice
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * API Endpoint: Get current game state
 * Returns complete game state including players, scores, and board status
 */
app.get("/api/game/state", (req, res) => {
  res.json(tournament.getState());
});

/**
 * API Endpoint: Load game
 * Initializes the game in load state for file upload
 */
app.post("/api/game/load", (req, res) => {
  const state = req.body;
  tournament.game.setScreen("LOAD"); 
  res.json(tournament.getState());
});

/**
 * API Endpoint: Roll for first turn
 * Determines which player goes first by comparing dice rolls
 * Handles tie cases by returning special response
 */
app.post("/api/game/roll-dice-first-turn", (req, res) => {
  // Each player rolls two dice
  const a = rollDice() + rollDice(); // Player 1 roll
  const b = rollDice() + rollDice(); // Player 2 roll

  if (a === b) {
    // Tie - players must roll again
    res.json({ winner: "tie", p1: a, p2: b, total: a + b });
  } 
  if (a > b) {
    // Player 1 wins first turn
    tournament.advantage.firstPlayer = "player1";
    res.json({ winner: "player1", p1: a, p2: b, total: a + b });
  }
  if (a < b) {
    // Player 2 wins first turn
    tournament.advantage.firstPlayer = "player2";
    res.json({ winner: "player2", p1: a, p2: b, total: a + b });
  }
});

/**
 * API Endpoint: Start game
 * Begins the game with the player who won first turn
 * Applies any initial advantage from tournament rules
 */
app.post("/api/game/start-game", (req, res) => {
  tournament.game.currentPlayer = tournament.advantage.firstPlayer;
  tournament.applyAdvantage(tournament.advantage.winner, tournament.advantage.winnerScore);
  res.json({ message: "Game started!" });
});

/**
 * API Endpoint: Roll dice
 * Handles both random and manual dice input
 * Calculates valid moves based on dice result
 */
app.post("/api/game/roll-dice", (req, res) => {
  const { inputDice } = req.body;

  // Handle manual dice input if provided
  if (inputDice != null) {
    tournament.game.setDice(inputDice[0], inputDice[1]);
  } else {
    tournament.game.rollDice(); // Random roll
  }

  tournament.game.setScreen("PLAY"); 
  tournament.game.message = "";
  
  const currentPlayer = tournament.game.currentPlayer;
  let currentPlayerBoard, opponentBoard;
  let validCoverCombinations, validUncoverCombinations;

  // Determine which boards to use based on current player
  if (currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.board;
    opponentBoard = tournament.game.players.player2.board;
  } else {
    currentPlayerBoard = tournament.game.players.player2.board;
    opponentBoard = tournament.game.players.player1.board;
  }

  // Find all valid moves for current dice roll
  validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
  validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);

  // If current player is computer, choose move automatically
  let move;
  if (currentPlayer === "player1" && tournament.game.players.player1.type === "computer") {
    move = tournament.game.players.player1.chooseMove(tournament.game.getDice().total, opponentBoard);
  } else if (currentPlayer === "player2" && tournament.game.players.player2.type === "computer") {
    move = tournament.game.players.player2.chooseMove(tournament.game.getDice().total, opponentBoard);
  }

  // Return game state with valid moves and computer decision (if applicable)
  const response = {
    ...tournament.getState(), 
    validCoverCombinations, 
    validUncoverCombinations, 
    move,
  };

  res.json(response);
});

/**
 * API Endpoint: Get help
 * Provides suggested move for human players with explanation
 */
app.post("/api/game/help", (req, res) => {
  let move;
  // Provide help for human players
  if (tournament.game.players.player1.type === "human") {
    move = tournament.game.players.player1.requestHelp(tournament.game.getDice().total, tournament.game.players.player2.board);
  } 
  if (tournament.game.players.player2.type === "human") {
    move = tournament.game.players.player2.requestHelp(tournament.game.getDice().total, tournament.game.players.player1.board);
  }

  // Format help message with reasoning
  tournament.game.message = `Computer suggests to ${move.action} ${move.combination} because ${move.reason.toLowerCase().replaceAll("my", "your")}`;
  res.json({ message: "Help: Try to cover your squares or uncover the opponent's squares!", move });
});

/**
 * API Endpoint: Rewind state
 * Returns current game state (placeholder for actual rewind functionality)
 */
app.post("/api/game/rewind", (req, res) => {
  res.json(tournament.getState());
});

/**
 * API Endpoint: Save game
 * Returns current game state for saving
 */
app.post("/api/game/save", (req, res) => {
  res.json(tournament.getState());
});

/**
 * API Endpoint: New game
 * Initializes a fresh game with specified parameters
 */
app.post("/api/game/new", (req, res) => {
  const { boardSize, player1Type, player2Type } = req.body;

  console.log("new game: " + tournament)
  tournament.game = new Game(tournament, boardSize, player1Type, player2Type);
  tournament.game.players.player1.score = 0;  
  tournament.game.players.player2.score = 0;

  tournament.game.setScreen("PLAY"); 
  res.json(tournament.getState());
});

/**
 * API Endpoint: Play again
 * Starts new game while preserving some state from previous game
 */
app.post("/api/game/play-again", (req, res) => {
  const { boardSize, player1Type, player2Type } = req.body;
  const player1Score = tournament.game.players.player1.score;
  const player2Score = tournament.game.players.player2.score;

  tournament.game = new Game(tournament, boardSize, player1Type, player2Type);
  tournament.game.players.player1.score = player1Score;  
  tournament.game.players.player2.score = player2Score;

  tournament.game.setScreen("PLAY");
  res.json(tournament.getState());
});

/**
 * API Endpoint: Validate move
 * Processes player's move and updates game state accordingly
 */
app.post("/api/game/valid-move", (req, res) => {
  const { validMove, toCover } = req.body;
  console.log("Valid move: ", validMove, toCover);

  // Handle case where no valid moves exist
  if (validMove.length === 0) {
    console.log("No valid move found. Switching turn.");
    tournament.game.message = `${tournament.game.currentPlayer} chooses ${tournament.game.dice.total} (${!toCover ? "cover" : "uncover"}) and No valid move found. Switching turn.`;
    tournament.game.switchTurn();
    res.json({ message: "No valid move found. Switching turn." });
    return;
  }

  // Save current state for potential rewind
  tournament.saveMoveSnapshot();

  const currentPlayer = tournament.game.currentPlayer;
  let currentPlayerBoard, opponentBoard;

  // Mark that first turn has been played
  if (currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.hasFirstTurnBeenPlayed = true;
  } else {
    currentPlayerBoard = tournament.game.players.player2.hasFirstTurnBeenPlayed = true;
  }

  // Determine which board to modify based on move type
  if (toCover) {
    if (currentPlayer === "player1") {
      currentPlayerBoard = tournament.game.players.player1.board;
    } else {
      currentPlayerBoard = tournament.game.players.player2.board;
    }
  } else {
    if (currentPlayer === "player1") {
      opponentBoard = tournament.game.players.player2.board;
    } else {
      opponentBoard = tournament.game.players.player1.board;
    }
  }

  tournament.game.message = `${currentPlayer} selected ${validMove} and choose to ${toCover ? "cover" : "uncover"}`;

  // Add reasoning for computer moves
  if (tournament.game.players[currentPlayer].type !== "human") {
    const opponentBoard = currentPlayer === "player1" 
      ? tournament.game.players.player2.board 
      : tournament.game.players.player1.board;

    const move = tournament.game.players[currentPlayer].suggestMove(tournament.game.getDice().total, opponentBoard);
    tournament.game.message = `${currentPlayer} selected ${validMove} and choose to ${toCover ? "cover" : "uncover"} because ${move.reason.toLowerCase()}`;
  }
    
  // Execute the move
  if (toCover) {
    for (const square of validMove) {
      currentPlayerBoard.coverSquare(square);
    }
  } else {
    for (const square of validMove) {
      opponentBoard.uncoverSquare(square);
    }
  }

  // Check for game over condition
  let winner = tournament.game.isGameOver();
  if (winner !== null) {
    tournament.game.declareWinner();
    tournament.game.message = `Game over! Score (Player 1, Player 2) : (${tournament.game.players.player1.getScore()}, ${tournament.game.players.player2.getScore()}). ${winner} gained ${tournament.advantage.winnerScore}!`;
    res.json({ winner, gameOver: true, message: "Game over!" });
    return;
  }

  res.json({ message: `You selected: ${validMove}` });
});

/**
 * API Endpoint: Load game from file
 * Restores game state from uploaded file
 */
app.post("/api/game/load-file", (req, res) => {
  const { body } = req;

  tournament.loadGame(tournament, body);
  tournament.game.setScreen("PLAY"); 

  console.log("Loading game state: ", tournament.getState());
  let stats = tournament.getState();
  res.json(stats);
});

/**
 * API Endpoint: Toggle cover/uncover mode
 * Returns valid moves for current mode
 */
app.post("/api/game/toggle", (req, res) => {
  const { checked } = req.body;
  let currentPlayerBoard, opponentBoard;
  let validCoverCombinations, validUncoverCombinations;

  // Determine current and opponent boards
  if (tournament.game.currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.board;
    opponentBoard = tournament.game.players.player2.board;
  } else {
    currentPlayerBoard = tournament.game.players.player2.board;
    opponentBoard = tournament.game.players.player1.board;
  }

  // Get valid moves for current mode
  validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
  validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);

  if (checked)
    res.json(validCoverCombinations); // Cover mode moves
  else 
    res.json(validUncoverCombinations); // Uncover mode moves
});

/**
 * API Endpoint: Get move history
 * Returns list of all previous moves for rewind functionality
 */
app.get('/api/game/move-history', (req, res) => {
  res.json({
    history: tournament.moveHistory.map((state, index) => ({
      moveNumber: index + 1,
      currentPlayer: state.currentPlayer,
      player1: state.player1,
      player2: state.player2,
      dice: state.dice,
      advantage: state.advantage,
      lastAction: state.lastAction,    
      lastSquares: state.lastSquares   
    }))
  });
});

/**
 * API Endpoint: Rewind to specific move
 * Restores game state to a previous point in history
 */
app.post('/api/game/rewind-move', (req, res) => {
  const { index } = req.body;
  if (tournament.rewindToMove(index)) {
    res.json({ success: true, state: tournament.getState() });
  } else {
    res.status(400).json({ error: "Invalid move index" });
  }
});

/**
 * API Endpoint: Check if one die can be thrown
 * Determines if game rules allow throwing just one die
 */
app.get('/api/game/can-throw-one-die', (req, res) => {
  const currentPlayer = tournament.game.currentPlayer;
  const currentPlayerBoard = currentPlayer === 'player1' 
    ? tournament.game.players.player1.board 
    : tournament.game.players.player2.board;
  
  // Check if all squares beyond 6 are covered
  const canThrowOneDie = () => {
    for (let i = 6; i < currentPlayerBoard.squares.length; i++) {
      if (currentPlayerBoard.squares[i] !== 0) {
        return false;
      }
    }
    return true;
  };

  res.json({ canThrowOneDie: canThrowOneDie() });
});

/**
 * API Endpoint: Declare winner
 * Finalizes tournament results when game ends
 */
app.post('/api/game/winner', (req, res) => {
  const { player } = req.body;
  const winner = tournament.game.declareTournamentWinner(player);
  res.json({ winner });
});

/**
 * API Endpoint: Check if advantage square can be uncovered
 * Verifies game rules regarding uncovering protected squares
 */
app.get('/api/game/can-uncover-advantage', (req, res) => {
  if (!tournament) {
    return res.json({ canUncover: true });
  }
  
  const canUncover = tournament.canUncoverAdvantage(tournament.game.currentPlayer);
  res.json({ canUncover });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```


# File: ./JS/source/backend/models/Game.js

```javascript
const Board = require("./Board");
const Human = require("./Human");
const Computer = require("./Computer");
const Tournament = require("./Tournament");

/**
 * Represents a single game round within a tournament.
 */
class Game {
  /**
   * Initializes a new Game instance.
   * @param {Tournament} tournament - The tournament context.
   * @param {number} [boardSize=11] - The number of squares on the board.
   * @param {string} [player1Type="human"] - The type for player1 ("human" or "computer").
   * @param {string} [player2Type="computer"] - The type for player2 ("human" or "computer").
   */
  constructor(tournament, boardSize = 11, player1Type = "human", player2Type = "computer") {
    this.tournament = tournament;
    this.BOARD_SIZE = boardSize;
    this.dice = { dice1: 0, dice2: 0, total: 0 };
    this.message = "";
    this.hasFirstTurnBeenPlayed = false;
    this.gameOver = false;
    this.screen = "START";
    this.currentPlayer = "player1";

    // Initialize boards for both players
    let player1Board = new Board(boardSize);
    let player2Board = new Board(boardSize);

    // Create players based on given type
    this.players = {
      player1: player1Type === "human" 
        ? new Human(player1Board, this) 
        : new Computer(player1Board, this),
      player2: player2Type === "human" 
        ? new Human(player2Board, this) 
        : new Computer(player2Board, this)
    };
  }

  /**
   * Rolls two dice and updates the dice property.
   */
  rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  /**
   * Switches the current player after a turn.
   * Also records that the player has taken their first turn.
   */
  switchTurn() {
    if (this.currentPlayer === "player1") {
      this.players.player1.hasFirstTurnBeenPlayed = true;
      this.currentPlayer = "player2";
    } else {
      this.players.player2.hasFirstTurnBeenPlayed = true;
      this.currentPlayer = "player1";
    }

    if (this.tournament) {
      this.tournament.recordTurn(this.currentPlayer);
    }
  }

  /**
   * Sets the current screen of the game.
   * @param {string} screen - The screen value ("START", "PLAY", etc.).
   */
  setScreen(screen) {
    this.screen = screen;
  }

  /**
   * Retrieves the current dice object.
   * @returns {{dice1: number, dice2: number, total: number}} The dice values.
   */
  getDice() {
    return this.dice;
  }

  /**
   * Sets the dice values with given numbers.
   * @param {number} [dice1=0] - The value for dice1.
   * @param {number} [dice2=0] - The value for dice2.
   */
  setDice(dice1 = 0, dice2 = 0) {
    this.dice = { dice1, dice2, total: dice1 + dice2 };
  }

  /**
   * Checks if the game is over by examining both player's boards.
   * The game is not considered over if either player has not taken a turn.
   *
   * @returns {string|null} Returns "player1" or "player2" if that player wins; otherwise, returns null.
   */
  isGameOver() {
    const player1 = this.players.player1;
    const player2 = this.players.player2;
    const player1Board = player1.board;
    const player2Board = player2.board;

    // Do not check for a winner if either player hasn't played a turn.
    if (!player1.hasFirstTurnBeenPlayed || !player2.hasFirstTurnBeenPlayed) 
      return null;

    // Determine winner based on board state
    if (player1Board.allCovered()) {
      this.gameOver = true;
      return "player1"; 
    }

    if (player2Board.allUncovered()) {
      this.gameOver = true;
      return "player1"; 
    }

    if (player2Board.allCovered()) {
      this.gameOver = true;
      return "player2";
    }

    if (player1Board.allUncovered()) {
      this.gameOver = true;
      return "player2"; 
    }

    return null;
  }

  /**
   * Declares the tournament winner based on player scores.
   * @returns {string} Returns "player1", "player2", or "draw".
   */
  declareTournamentWinner() {
    const player1 = this.players.player1;
    const player2 = this.players.player2;

    if (player1.score > player2.score) {
      console.log(`Tournament over! Player 1 wins with ${player1.score} points!`);
      return "player1";
    } else if (player2.score > player1.score) {
      console.log(`Tournament over! Player 2 wins with ${player2.score} points!`);
      return "player2";
    } else {
      console.log("Tournament ended in a draw!");
      return "draw";
    }
  }

  /**
   * Declares the winner of the current game round, updates scores, and resets the game.
   * Also records advantage data if part of a tournament.
   *
   * @returns {string|null} Returns the winner ("player1" or "player2") or null if the game continues.
   */
  declareWinner() {
    const winner = this.isGameOver();

    if (winner) {
      const player1Board = this.players.player1.board;
      const player2Board = this.players.player2.board;
      let winnerPoints = 0;

      if (winner === "player1") {
        if (player1Board.allCovered()) {
          winnerPoints = player2Board.getUncoveredSum(); 
        } else if (player2Board.allUncovered()) {
          winnerPoints = player1Board.getCoveredSum(); 
        }
        this.players.player1.score += winnerPoints;
      } else if (winner === "player2") {
        if (player2Board.allCovered()) {
          winnerPoints = player1Board.getUncoveredSum(); 
        } else if (player1Board.allUncovered()) {
          winnerPoints = player2Board.getCoveredSum(); 
        }
        this.players.player2.score += winnerPoints;
      }

      if (this.tournament) {
        this.tournament.advantage.winner = winner;
        this.tournament.advantage.winnerScore = winnerPoints;
      }

      console.log(`Game over! ${winner} wins with ${winnerPoints} points!`);
      this.resetGame();
      return winner;
    } else {
      console.log("The game continues...");
      return null;
    }
  }

  /**
   * Resets the game state for a new round.
   * Creates new boards for both players, resets turn and game over status.
   */
  resetGame() {
    this.players.player1.board = new Board(this.BOARD_SIZE);
    this.players.player2.board = new Board(this.BOARD_SIZE);
    this.currentPlayer = "player1";
    this.screen = "START";
    this.gameOver = false;
    console.log("Game has been reset. Starting a new round...");
  }

  /**
   * Retrieves the current state of the game.
   * @returns {Object} An object containing player details, current turn, dice, screen, advantage, and board size.
   */
  getState() {
    return {
      player1: {
        type: this.players.player1.type,
        squares: this.players.player1.board.squares,
        score: this.players.player1.score,
      },
      player2: {
        type: this.players.player2.type,
        squares: this.players.player2.board.squares,
        score: this.players.player2.score,
      },
      currentPlayer: this.currentPlayer,
      dice: this.dice,
      screen: this.screen,
      advantage: this.tournament.advantage,
      message: this.message,
      fullGame: this.players,
      BOARD_SIZE: this.BOARD_SIZE,
    };
  }
}

module.exports = Game;
```


# File: ./JS/source/backend/models/Computer.js

```javascript
const Player = require("./Player");
const Tournament = require("./Tournament");
const Board = require("./Board");

/**
 * Represents a computer-controlled player.
 * Extends the Player class with AI logic for deciding dice throws and moves.
 */
class Computer extends Player {
  /**
   * Initializes a new instance of the Computer class.
   * @param {Board} board - The board assigned to this computer player.
   */
  constructor(board) {
    super(board);
    this.type = "computer";
  }

  /**
   * Decides whether to throw one die or two dice.
   * Examines squares 7 to N on the board; if all are covered, returns 1, otherwise 2.
   * @returns {number} 1 if using one die, 2 otherwise.
   */
  decideDiceThrow() {
    const squares7toN = this.board.squares.slice(6);
    const allCovered = squares7toN.every((_, index) => this.board.isSquareCovered(index + 7));
    return allCovered ? 1 : 2;
  }

  /**
   * Chooses a move based on the dice sum and the current state of the opponent's board.
   * Prioritizes winning by uncovering, then covering own squares, then uncovering opponent's squares.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board object.
   * @returns {Object} An object describing the chosen move.
   *                   { action: string, combination: number[], reason: string }.
   */
  chooseMove(diceSum, opponentBoard) {
    // Attempt to find combinations that can win by uncovering the opponent's board.
    const uncoverWinOptions = this.findBestCombination(opponentBoard, diceSum, false);
    const canWinByUncovering = uncoverWinOptions.some(combo => {
      const tempBoard = new Board(opponentBoard.size);
      tempBoard.setSquareValues([...opponentBoard.squares]);
      combo.forEach(sq => tempBoard.uncoverSquare(sq));
      return tempBoard.allUncovered();
    });

    if (canWinByUncovering) {
      return {
        action: 'uncover',
        combination: this.selectWinningCombination(uncoverWinOptions, opponentBoard),
        reason: "Winning by uncovering all opponent's squares"
      };
    }

    // Try covering own squares.
    const coverOptions = this.findBestCombination(this.board, diceSum, true);
    if (coverOptions.length > 0) {
      return {
        action: 'cover',
        combination: this.selectBestCombination(coverOptions),
        reason: "Covering my squares to maximize my advantage"
      };
    }

    // Try uncovering opponent's squares.
    const uncoverOptions = this.findBestCombination(opponentBoard, diceSum, false);
    if (uncoverOptions.length > 0) {
      return {
        action: 'uncover',
        combination: this.selectBestCombination(uncoverOptions),
        reason: "Uncovering opponent's squares to minimize their advantage"
      };
    }

    // If no valid moves are available.
    return {
      action: 'none',
      combination: [],
      reason: "No valid moves available"
    };
  }

  /**
   * Suggests a move for help by delegating to chooseMove.
   * This is useful for a hint feature.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board.
   * @returns {Object} A suggested move object.
   */
  suggestMove(diceSum, opponentBoard) {
    return this.chooseMove(diceSum, opponentBoard);
  }

  /**
   * Finds all valid combinations of squares on the given board that sum to the given value.
   * Uses a backtracking approach and considers advantage constraints if applicable.
   *
   * @param {Board} board - The board on which to find combinations.
   * @param {number} sum - The target sum for the combination.
   * @param {boolean} forCovering - True if finding combinations for covering squares, false for uncovering.
   * @returns {number[][]} An array of square combinations.
   */
  findBestCombination(board, sum, forCovering) {
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(currentPlayer);

    /**
     * Backtracking helper to generate combinations.
     * @param {number} start - Starting square number.
     * @param {number[]} path - Current combination being built.
     * @param {number} remaining - Remaining sum needed.
     */
    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.board.isValidCombination(path, forCovering)) {
          if (!(advantageApplied && isOpponentBoard && path.includes(advantageSquare) && !canUncover)) {
            combinations.push([...path]);
          }
        }
        return;
      }

      for (let i = start; i <= board.size; i++) {
        if (advantageApplied && isOpponentBoard && i === advantageSquare && !canUncover) {
          continue;
        }
        if ((forCovering && !board.isSquareCovered(i)) || (!forCovering && board.isSquareCovered(i))) {
          if (i <= remaining) {
            path.push(i);
            backtrack(i + 1, path, remaining - i);
            path.pop();
          }
        }
      }
    };

    backtrack(1, [], sum);
    return combinations;
  }

  /**
   * Selects the best combination from an array of valid combinations.
   * Criteria: the combination with the highest length,
   * and if equal, the one with the highest total sum.
   *
   * @param {number[][]} combinations - An array of valid square combinations.
   * @returns {number[]} The selected best combination.
   */
  selectBestCombination(combinations) {
    return combinations.reduce((best, current) => {
      if (current.length > best.length) return current;
      if (current.length === best.length) {
        return current.reduce((a, b) => a + b, 0) > best.reduce((a, b) => a + b, 0) ? current : best;
      }
      return best;
    }, []);
  }

  /**
   * Executes this computer player's turn.
   * Decides on a move and applies it to the board accordingly.
   *
   * @param {number} diceSum - The sum of the dice.
   * @param {Board} opponentBoard - The opponent's board.
   * @returns {Object} The move object that was executed.
   */
  takeTurn(diceSum, opponentBoard) {
    const move = this.chooseMove(diceSum, opponentBoard);
    
    if (move.action === 'cover') {
      move.combination.forEach(square => this.board.coverSquare(square));
    } else if (move.action === 'uncover') {
      move.combination.forEach(square => opponentBoard.uncoverSquare(square));
    }
    
    return move;
  }

  /**
   * From a list of combinations, selects a winning combination if it exists.
   * A winning combination is one which, when applied, results in the opponent's board being fully uncovered.
   *
   * @param {number[][]} combinations - The array of possible combinations.
   * @param {Board} opponentBoard - The opponent's board object.
   * @returns {number[]} The winning combination if available, otherwise the best combination.
   */
  selectWinningCombination(combinations, opponentBoard) {
    const winningCombos = combinations.filter(combo => {
      const tempBoard = new Board(opponentBoard.size);
      tempBoard.setSquareValues([...opponentBoard.squares]);
      combo.forEach(sq => tempBoard.uncoverSquare(sq));
      return tempBoard.allUncovered();
    });

    if (winningCombos.length > 0) {
      return this.selectBestCombination(winningCombos);
    }
    
    return this.selectBestCombination(combinations);
  }
}

module.exports = Computer;
```


# File: ./JS/source/backend/models/Human.js

```javascript
const Player = require("./Player");
const Computer = require("./Computer");

/**
 * The Human class represents a human-controlled player.
 * Extends the base Player class by providing the ability to request help from a temporary Computer instance.
 */
class Human extends Player {
  /**
   * Initializes a new instance of the Human class.
   * @param {Board} board - The board assigned to this human player.
   */
  constructor(board) {
    super(board);
    /**
     * Identifies the type of this player as "human".
     * @type {string}
     */
    this.type = "human";
  }

  /**
   * Requests a suggested move from a Computer instance.
   * Useful as a "hint" or "help" feature for the human player.
   * @param {number} diceSum - The sum of dice values rolled.
   * @param {Board} opponentBoard - The opponent’s board object.
   * @returns {Object} A suggested action object (cover/uncover, squares, and reason).
   */
  requestHelp(diceSum, opponentBoard) {
    const computer = new Computer(this.board);
    return computer.suggestMove(diceSum, opponentBoard);
  }
}

module.exports = Human;
```


# File: ./JS/source/backend/models/Board.js

```javascript
/**
 * Represents a game board with a set of numbered squares.
 */
class Board {
  /**
   * Creates a new Board instance.
   * @param {number} size - The number of squares on the board.
   */
  constructor(size) {
    this.size = size;
    this.squares = Array.from({ length: size }, (_, i) => i + 1);
  }

  /**
   * Covers the specified square, marking it as 0.
   * @param {number} index - The square number to cover (1-indexed).
   */
  coverSquare(index) {
    index = parseInt(index, 10);
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = 0;
    }
  }

  /**
   * Uncovers the specified square, restoring its original number.
   * @param {number} index - The square number to uncover (1-indexed).
   */
  uncoverSquare(index) {
    if (index >= 1 && index <= this.size) {
      this.squares[index - 1] = index;
    }
  }

  /**
   * Retrieves the current values of the board squares.
   * @returns {number[]} An array representing the board squares.
   */
  getSquares() {
    return this.squares;
  }

  /**
   * Sets the board squares to the provided values.
   * @param {number[]} values - An array of values; its length must equal the board size.
   * @throws {Error} If the length of values does not match the board size.
   */
  setSquareValues(values) {
    if (values.length === this.size) {
      this.squares = values;
    } else {
      throw new Error("Invalid input: The number of values must match the board size.");
    }
  }

  /**
   * Determines if a specific square is covered.
   * @param {number} index - The square number to check (1-indexed).
   * @returns {boolean} True if the square is covered (i.e. value is 0), false otherwise.
   */
  isSquareCovered(index) {
    if (index >= 1 && index <= this.size) {
      return this.squares[index - 1] === 0;
    }
    return false;
  }

  /**
   * Checks if all squares on the board are covered.
   * @returns {boolean} True if every square is 0, false otherwise.
   */
  allCovered() {
    return this.squares.every((square) => square === 0);
  }

  /**
   * Checks if all squares on the board are uncovered.
   * @returns {boolean} True if every square is not 0, false otherwise.
   */
  allUncovered() {
    return this.squares.every((square) => square !== 0);
  }

  /**
   * Calculates the sum of indices for all covered squares.
   * @returns {number} The total sum of the positions of covered squares.
   */
  getCoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square === 0 ? sum + (index + 1) : sum; 
    }, 0);
  }

  /**
   * Calculates the sum of indices for all uncovered squares.
   * @returns {number} The total sum of the positions of uncovered squares.
   */
  getUncoveredSum() {
    return this.squares.reduce((sum, square, index) => {
      return square !== 0 ? sum + (index + 1) : sum; 
    }, 0);
  }

  /**
   * Finds all valid combinations of square numbers that sum to a given target.
   * Takes into account board state and advantage restrictions.
   *
   * @param {number} sum - The target sum for the combination.
   * @param {boolean} forCovering - True if finding combinations for covering squares,
   *                                false if for uncovering squares.
   * @returns {number[][]} An array of valid square combinations.
   */
  findValidCombinations(sum, forCovering) {
    const combinations = [];
    const advantageSquare = this.game?.tournament?.getAdvantageSquare();
    const advantageApplied = this.game?.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(currentPlayer);

    /**
     * Backtracking helper to generate combinations.
     * @param {number} start - The starting square number.
     * @param {number[]} path - The current combination being built.
     * @param {number} remaining - The remaining sum required.
     */
    const backtrack = (start, path, remaining) => {
      if (remaining === 0) {
        if (this.isValidCombination(path, forCovering)) {
          if (!(advantageApplied && isOpponentBoard && path.includes(advantageSquare) && !canUncover)) {
            combinations.push([...path]);
          }
        }
        return;
      }
  
      for (let i = start; i <= this.size; i++) {
        if (advantageApplied && isOpponentBoard && i === advantageSquare && !canUncover) {
          continue;
        }
  
        if ((forCovering && !this.isSquareCovered(i)) || (!forCovering && this.isSquareCovered(i))) {
          if (i <= remaining) {
            path.push(i);
            backtrack(i + 1, path, remaining - i);
            path.pop();
          }
        }
      }
    };

    backtrack(1, [], sum);
    return combinations;
  }

  /**
   * Validates whether a given combination of squares is allowed.
   * Checks both covering logic and advantage rules.
   *
   * @param {number[]} combination - The combination of square numbers.
   * @param {boolean} forCovering - True if the combination is for covering squares,
   *                                false if for uncovering squares.
   * @returns {boolean} True if the combination is valid, false otherwise.
   */
  isValidCombination(combination, forCovering) {
    const advantageSquare = this.tournament?.getAdvantageSquare();
    const advantageApplied = this.tournament?.getAdvantageApplied();
    const isOpponentBoard = !forCovering;
    const currentPlayer = this.game?.currentPlayer;
    const canUncover = this.game?.tournament?.canUncoverAdvantage(this.game.currentPlayer);

    // Prevent uncovering the advantage square if not allowed
    if (advantageApplied && isOpponentBoard && combination.includes(advantageSquare) && !canUncover) {
      return false;
    }
    
    // For each square in the combination, ensure it is not already covered (for covering) or is covered (for uncovering)
    for (const square of combination) {
      if ((forCovering && this.isSquareCovered(square)) || (!forCovering && !this.isSquareCovered(square))) {
        return false;
      }
    }
    return true;
  }
}

module.exports = Board;
```


# File: ./JS/source/backend/models/Tournament.js

```javascript
const Game = require("./Game");
const Board = require("./Board");
const Human = require("./Human");
const Computer = require("./Computer");

/**
 * Represents a multi-round tournament for the board game.
 * Manages applied advantages, move history, and transitions between game states.
 */
class Tournament {
  /**
   * Initializes the Tournament with a new Game instance
   * and default advantage properties.
   */
  constructor() {
    this.game = new Game(this);
    this.isANewGame = true;
    this.advantage = {
      square: null,
      applied: false,
      player: null,
      firstPlayer: null,
      winner: null,
      winnerScore: null,
      hasTakenTurn: false
    };
    this.moveHistory = [];
    this.currentHistoryIndex = -1;
    this.BOARD_SIZE = 0;
  }

  /**
   * Sets which player started first in this tournament.
   * @param {string} player - "player1" or "player2" indicating the first player.
   */
  setFirstPlayer(player) {
    this.advantage.firstPlayer = player;
  }

  /**
   * Loads a previously saved or newly created game into the tournament.
   * @param {Tournament} tournament - The current tournament context.
   * @param {Object} state - The saved state for loading.
   */
  loadGame(tournament, state) {
    let n = state.player1.squares.length;
    this.game = new Game(tournament, n);

    this.game.players.player1 = state.player1Type === "human"
      ? new Human(new Board(n), this.game)
      : new Computer(new Board(n), this.game);
  
    this.game.players.player2 = state.player2Type === "human"
      ? new Human(new Board(n), this.game)
      : new Computer(new Board(n), this.game);
  
    if (n !== 0) {
      this.game.players.player1.board.setSquareValues(state.player1.squares);
      this.game.players.player2.board.setSquareValues(state.player2.squares);
    }

    this.game.players.player1.score = state.player1.score;
    this.game.players.player2.score = state.player2.score;
    this.game.players.player1.hasFirstTurnBeenPlayed = true;
    this.game.players.player2.hasFirstTurnBeenPlayed = true;
    this.game.currentPlayer = state.currentPlayer;
    this.game.setScreen(state.screen);

    this.isANewGame = false;
    this.advantage.firstPlayer = state.firstTurn;
    this.advantage.player = state.currentPlayer;

    this.history = [];
    this.currentHistoryIndex = -1;
    this.saveMoveSnapshot();

    this.BOARD_SIZE = n;
    console.log("Game loaded successfully!", this.game.getState());
  }

  /**
   * Retrieves the currently assigned advantage square number.
   * @returns {number|null} The advantage square number or null if not set.
   */
  getAdvantageSquare() {
    return this.advantage.square;
  }

  /**
   * Determines whether advantage is currently applied.
   * @returns {boolean} True if advantage is applied, false otherwise.
   */
  getAdvantageApplied() {
    return this.advantage.applied;
  }

  /**
   * Retrieves the player who has the advantage.
   * @returns {string|null} "player1" or "player2" if advantage is active, null otherwise.
   */
  getAdvantagePlayer() {
    return this.advantage.player;
  }

  /**
   * Calculates which square should be advantaged based on a score.
   * Sums the digits of the player's score; if 0, returns 1.
   * @param {number} score - The player's current score.
   * @returns {number} The calculated square number.
   */
  calculateAdvantageSquare(score) {
    if (score <= 0) return 1;
    const sum = String(score)
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
    return sum === 0 ? 1 : sum;
  }

  /**
   * Applies advantage to the opponent if the winner is the same as the first player,
   * otherwise applies advantage to the winner itself.
   * Covers the advantage square on the opponent's board.
   *
   * @param {string} winner - "player1" or "player2" who won the round.
   * @param {number} winnerScore - Score of the round winner.
   */
  applyAdvantage(winner, winnerScore) {
    if (!winner) return;
    this.advantage.square = this.calculateAdvantageSquare(winnerScore);
    this.advantage.applied = true;

    if (winner === this.advantage.firstPlayer) {
      this.advantage.player = winner === "player1" ? "player2" : "player1";
    } else {
      this.advantage.player = winner;
    }

    const advantagedPlayer = this.advantage.player;
    const opponent = advantagedPlayer === "player1" ? "player2" : "player1";

    // Cover the advantage square on the opponent's board
    this.game.players[opponent].board.coverSquare(this.advantage.square);
    this.advantage.hasTakenTurn = false;

    console.log(`Advantage applied! Square ${this.advantage.square} covered for ${opponent}`);
  }

  /**
   * Determines if the advantage square can be uncovered based on the current player
   * and whether they have already taken a turn since advantage was applied.
   * @param {string} currentPlayer - The active player ("player1" or "player2").
   * @returns {boolean} True if uncovered is allowed, false otherwise.
   */
  canUncoverAdvantage(currentPlayer) {
    if (!this.advantage.applied) return true;
    if (currentPlayer !== this.advantage.player) {
      return this.advantage.hasTakenTurn;
    }
    return true;
  }

  /**
   * Records that the advantage-holding player has taken a turn.
   * @param {string} player - "player1" or "player2" who took the turn.
   */
  recordTurn(player) {
    if (this.advantage.applied && player === this.advantage.player) {
      this.advantage.hasTakenTurn = true;
    }
  }

  /**
   * Completely clears the advantage state.
   */
  clearAdvantage() {
    this.advantage.square = null;
    this.advantage.applied = false;
    this.advantage.player = null;
  }

  /**
   * Returns the full state of the current game along with advantage info.
   * @returns {Object} Combined state of game and advantage.
   */
  getState() {
    const gameState = this.game.getState();
    return {
      ...gameState,
      advantage: { ...this.advantage }
    };
  }

  /**
   * Rewinds the game to a specific move index in the history, if valid.
   * @param {number} index - Index of the move to rewind to.
   * @returns {boolean} True if successfully rewound, else false.
   */
  rewindToMove(index) {
    if (index >= 0 && index < this.moveHistory.length) {
      const state = this.moveHistory[index];
      this.loadGame(this, state);
      this.currentMoveIndex = index;
      return true;
    }
    return false;
  }

  /**
   * Records the current game state into the move history stack.
   */
  saveMoveSnapshot() {
    const state = this.game.getState();
    this.moveHistory.push(JSON.parse(JSON.stringify(state)));
    this.currentMoveIndex = this.moveHistory.length - 1;
  }
}

module.exports = Tournament;
```


# File: ./JS/source/backend/models/Player.js

```javascript
/**
 * Represents a single player within the game.
 * Maintains the player's board, score, and methods to determine the best move.
 */
class Player {
  /**
   * Initializes a new Player instance.
   * @param {Board} board - The board belonging to this player.
   * @param {Tournament} tournament - The tournament context or controller.
   */
  constructor(board, tournament) {
    /**
     * Reference to the tournament controlling this game.
     * @type {Tournament}
     */
    this.tournament = tournament;

    /**
     * The board owned by this player.
     * @type {Board}
     */
    this.board = board;

    /**
     * The player's current score.
     * @type {number}
     */
    this.score = 0;

    /**
     * Flag indicating whether the player has taken at least one turn.
     * @type {boolean}
     */
    this.hasFirstTurnBeenPlayed = false;
  }

  /**
   * Retrieves the current score of this player.
   * @returns {number} The player's current score.
   */
  getScore() {
    return this.score;
  }

  /**
   * Increment the player's score by a specified number of points.
   * @param {number} points - Number of points to add to the current score.
   */
  updateScore(points) {
    this.score += points;
  }

  /**
   * Chooses the best move based on the dice sum and the opponent's board state.
   * Attempts to cover the player's own squares first if beneficial; otherwise,
   * tries to uncover the opponent's squares. If no moves are available, returns "none."
   *
   * @param {number} diceSum - The sum of the dice rolled.
   * @param {Board} opponentBoard - The board object belonging to the opponent.
   * @returns {{ action: string, combination: number[], reason: string }} 
   * An object describing the chosen action, the squares combination, and the reason.
   */
  chooseMove(diceSum, opponentBoard) {
    // Attempt to cover the player's own squares
    const coverOptions = this.findBestCombination(this.board, diceSum, true);
    if (coverOptions.length > 0) {
      return {
        action: 'cover',
        combination: this.selectBestCombination(coverOptions),
        reason: 'Covering my squares to maximize my advantage'
      };
    }

    // If no cover options, attempt to uncover the opponent's squares
    const uncoverOptions = this.findBestCombination(opponentBoard, diceSum, false);
    if (uncoverOptions.length > 0) {
      return {
        action: 'uncover',
        combination: this.selectBestCombination(uncoverOptions),
        reason: 'Uncovering opponent\'s squares to minimize their advantage'
      };
    }

    // If neither covering nor uncovering is viable, do nothing
    return {
      action: 'none',
      combination: [],
      reason: 'No valid moves available'
    };
  }
}

module.exports = Player;
```
