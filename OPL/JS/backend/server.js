const express = require("express");
const cors = require("cors");
const path = require("path");
const Tournament = require("./models/Tournament");
const Game = require("./models/Game");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

const tournament = new Tournament();

// API endpoints
app.get("/api/game/state", (req, res) => {
  res.json(tournament.getState());
});

app.post("/api/game/load", (req, res) => {
  const state = req.body;
  // tournament.loadGame(state);
  tournament.game.setScreen("LOAD"); // Set the screen to PLAY after loading the game
  res.json(tournament.getState());
});

app.post("/api/game/roll-dice", (req, res) => {
    const { inputDice } = req.body;

    // Roll the dice
    if (inputDice != null) {
      tournament.game.setDice(inputDice[0], inputDice[1]);
    } else {
      tournament.game.rollDice();
    }
    tournament.game.setScreen("PLAY"); // Set the screen to PLAY after rolling dice
  
    // Get the current player's board and the opponent's board
    const currentPlayer = tournament.game.currentPlayer;
    let currentPlayerBoard, opponentBoard;
    let validCoverCombinations, validUncoverCombinations;

    if (currentPlayer === "player1") {
      currentPlayerBoard = tournament.game.players.player1.squares;
      opponentBoard = tournament.game.players.player2.squares;
    } else {
      currentPlayerBoard = tournament.game.players.player2.squares;
      opponentBoard = tournament.game.players.player1.squares;
    }

    validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
    validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);

    // Find valid combinations for covering and uncovering
  
    // Prepare the response
    const response = {
      ...tournament.getState(), // Current game state
      validCoverCombinations, // Valid combinations for covering
      validUncoverCombinations, // Valid combinations for uncovering
    };
  
    // Send the response
    res.json(response);
});

app.post("/api/game/help", (req, res) => {
  res.json({ message: "Help: Try to cover your squares or uncover the opponent's squares!" });
});

app.post("/api/game/rewind", (req, res) => {
  // Implement rewind logic here
  res.json(tournament.getState());
});

app.post("/api/game/save", (req, res) => {
  // Implement save logic here
  res.json(tournament.getState());
});

app.post("/api/game/new", (req, res) => {
  const { boardSize, player1Type, player2Type } = req.body;
  tournament.game = new Game(boardSize, player1Type, player2Type);
  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after configuration
  res.json(tournament.getState());
});

app.post("/api/game/valid-move", (req, res) => {
  const { validMove, toCover } = req.body;
  console.log("Valid move: ", validMove, toCover);

  if (validMove.length === 0) {
    tournament.game.switchTurn();
    console.log("No valid move found. Switching turn.");
    res.json({ message: "No valid move found. Switching turn." });
    return;
  }

  const currentPlayer = tournament.game.currentPlayer;
  let currentPlayerBoard, opponentBoard;

  if (currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.hasFirstTurnBeenPlayed = true;
  } else {
    currentPlayerBoard = tournament.game.players.player2.hasFirstTurnBeenPlayed = true;
  }

  if (toCover) {
    if (currentPlayer === "player1") {
      currentPlayerBoard = tournament.game.players.player1.squares;
    } else {
      currentPlayerBoard = tournament.game.players.player2.squares;
    }

  } else {
    if (currentPlayer === "player1") {
      opponentBoard = tournament.game.players.player2.squares;
    } else {
      opponentBoard = tournament.game.players.player1.squares;
    }
  }
    



  if (toCover) {
    for (const square of validMove) {
      currentPlayerBoard.coverSquare(square);
    }
  } else {
    for (const square of validMove) {
      opponentBoard.uncoverSquare(square);
    }
  }

  if (tournament.game.isGameOver()) {
    tournament.game.declareWinner();
    res.json({ gameOver: true, message: "Game over!" });
    return;
  }

  res.json({ message: `You selected: ${validMove}` });
});

app.post("/api/game/load-file", (req, res) => {
  const { body } = req;

  tournament.loadGame(body);

  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after loading the game

  console.log("Loading game state: ", tournament.getState());

  let stats = tournament.getState();
  res.json(stats);
});

app.post("/api/game/toggle", (req, res) => {
  const { checked } = req.body;
  let currentPlayerBoard, opponentBoard;
  let validCoverCombinations, validUncoverCombinations;

  if (tournament.game.currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.squares;
    opponentBoard = tournament.game.players.player2.squares;

  } else {
    currentPlayerBoard = tournament.game.players.player2.squares;
    opponentBoard = tournament.game.players.player1.squares
  }

  validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
  validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);

  if (checked)
    res.json(validCoverCombinations);
  else 
    res.json(validUncoverCombinations);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
