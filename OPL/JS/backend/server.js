const express = require("express");
const cors = require("cors");
const path = require("path");
const { log } = require("console");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

const GAME_SCREEN = {
  START: 'START',
  CONFIG: 'CONFIG',
  LOAD: 'LOAD',
  PLAY: 'PLAY',
  END: 'END',
};

const GAME_TURN = {
  HUMAN: 'HUMAN',
  COMPUTER: 'COMPUTER',
}

// Game state
let gameState = {
  humanSquares: [],
  computerSquares: [],
  humanScore: 0,
  computerScore: 0,
  diceRoll: [0, 0],
  message: "",
  screen: null,
  GAME_TURN: null,
};

// Initialize the game
function initializeGame(boardSize = 11, isHumanTurn = true) {
  gameState.humanSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  gameState.computerSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  gameState.humanScore = 0;
  gameState.computerScore = 0;
  gameState.diceRoll = [0, 0];
  gameState.message = "New game started!";
  gameState.screen = GAME_SCREEN.START;
  gameState.GAME_TURN = isHumanTurn ? GAME_TURN.HUMAN : GAME_TURN.COMPUTER;
  gameState.GAME_TURN = checkWhoGoesFirst();
}

function checkWhoGoesFirst() {
  const random = Math.floor(Math.random() * 2);
  return random === 0 ? GAME_TURN.HUMAN : GAME_TURN.COMPUTER;
}

// Roll dice
function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  gameState.diceRoll = [dice1, dice2];
  gameState.message = `You rolled a ${dice1 + dice2}.`;
}

// Save game state
function saveGame() {
  localStorage.setItem("savedGameState", JSON.stringify(gameState));
  gameState.message = "Game saved!";
}

// Load game state
function loadGame() {
  const savedState = localStorage.getItem("savedGameState");
  if (savedState) {
    gameState = JSON.parse(savedState);
    gameState.message = "Game loaded!";
  } else {
    gameState.message = "No saved game found.";
  }
}

// API endpoints
app.get("/api/game/state", (req, res) => {
  res.json(gameState);
});

app.post("/api/game/new", (req, res) => {
  // initializeGame();
  gameState.screen = GAME_SCREEN.CONFIG;
  res.json(gameState);
});

app.post("/api/game/load", (req, res) => {
  // loadGame();
  gameState.screen = GAME_SCREEN.LOAD;
  console.log(gameState);
  res.json(gameState);
});

app.post("/api/game/roll-dice", (req, res) => {
  rollDice();
  res.json(gameState);
});

app.post("/api/game/help", (req, res) => {
  gameState.message = "Help: Try to cover your squares or uncover the opponent's squares!";
  res.json(gameState);
});

app.post("/api/game/rewind", (req, res) => {
  // Implement rewind logic here
  res.json(gameState);
});

app.post("/api/game/save", (req, res) => {
  // saveGame();

  res.json(gameState);
});

app.post("/api/game/config", (req, res) => {
  const { boardSize } = req.body;
  initializeGame(boardSize);

  gameState.screen = GAME_SCREEN.PLAY;
  res.json(gameState);
});

app.post("/api/game/input-dice", (req, res) => {
  const { inputDice } = req.body;
  gameState.message = `You entered: ${inputDice}`;
  gameState.diceRoll = inputDice;
  log(gameState.message);
  res.json(gameState);
});

app.post("/api/game/valid-move", (req, res) => {
  const { validMove } = req.body;
  gameState.message = `You selected: ${validMove}`;
  log(gameState.message);
  res.json(gameState);
});

app.post('/api/game/load-file', (req, res) => {
  const body = req.body;


  gameState.humanSquares = body.humanSquares.map(Number);
  gameState.computerSquares = body.computerSquares.map(Number);
  gameState.humanScore = Number(body.humanScore);
  gameState.computerScore = Number(body.computerScore);
  gameState.GAME_TURN = body.GAME_TURN;

  console.log(gameState);


  // Update the game state in your backend logic
  // ...

  // Return the updated game state
  res.json({
    humanSquares: gameState.humanSquares,
    computerSquares: gameState.computerSquares,
    humanScore: gameState.humanScore,
    computerScore: gameState.computerScore,
    GAME_TURN: gameState.GAME_TURN,
    message: "Game state loaded from file."
  });
});

app.post("/api/game/config", (req, res) => {
  const { boardSize } = req.body;
  initializeGame(boardSize);

  gameState.screen = GAME_SCREEN.PLAY;
  res.json(gameState);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});