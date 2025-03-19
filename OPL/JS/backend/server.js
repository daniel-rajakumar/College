const express = require("express");
const cors = require("cors");
const path = require("path");

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
  PLAY: 'PLAY',
  END: 'END',
};


// Game state
let gameState = {
  humanSquares: [],
  computerSquares: [],
  humanScore: 0,
  computerScore: 0,
  diceRoll: null,
  message: "",
  screen: null
};

// Initialize the game
function initializeGame(boardSize = 11) {
  gameState.humanSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  gameState.computerSquares = Array.from({ length: boardSize }, (_, i) => i + 1);
  gameState.humanScore = 0;
  gameState.computerScore = 0;
  gameState.diceRoll = null;
  gameState.message = "New game started!";
  gameState.screen = GAME_SCREEN.START;
}

// Roll dice
function rollDice() {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  gameState.diceRoll = `${dice1} + ${dice2} = ${dice1 + dice2}`;
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
  initializeGame();
  res.json(gameState);
});

app.post("/api/game/load", (req, res) => {
  loadGame();
  res.json(gameState);
});

app.post("/api/game/roll-dice", (req, res) => {
  rollDice();
  res.json(gameState);
});

app.post("/api/game/new-round", (req, res) => {
  initializeGame();
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
  saveGame();
  res.json(gameState);
});

app.post("/api/game/config", (req, res) => {
  const { boardSize } = req.body;
  initializeGame(boardSize);
  res.json(gameState);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});