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
      currentPlayerBoard = tournament.game.players.player1.board;
      opponentBoard = tournament.game.players.player2.board;
    } else {
      currentPlayerBoard = tournament.game.players.player2.board;
      opponentBoard = tournament.game.players.player1.board;
    }

    validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
    validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);



    let move;

    if (currentPlayer === "player1" && tournament.game.players.player1.type === "computer") {
      move = tournament.game.players.player1.chooseMove(tournament.game.getDice().total, opponentBoard);
    } else if (currentPlayer === "player2" && tournament.game.players.player2.type === "computer") {
      move = tournament.game.players.player2.chooseMove(tournament.game.getDice().total, opponentBoard);
    }


    // Prepare the response
    const response = {
      ...tournament.getState(), // Current game state
      validCoverCombinations, // Valid combinations for covering
      validUncoverCombinations, // Valid combinations for uncovering
      move,
    };
  
    // Send the response
    res.json(response);
});

app.post("/api/game/help", (req, res) => {
  let move;
  if (tournament.game.players.player1.type === "human") {
    move = tournament.game.players.player1.requestHelp(tournament.game.getDice().total, tournament.game.players.player2.board);
  } 

  if (tournament.game.players.player2.type === "human") {
    move = tournament.game.players.player2.requestHelp(tournament.game.getDice().total, tournament.game.players.player1.board);
  }

  tournament.game.message = `Computer suggests to ${move.action} ${move.combination}`;
  res.json({ message: "Help: Try to cover your squares or uncover the opponent's squares!", move });
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

  console.log("new game: " + tournament)
  tournament.game = new Game(tournament, boardSize, player1Type, player2Type);
  tournament.game.players.player1.score = 0;  // Explicitly reset scores
  tournament.game.players.player2.score = 0;

  const firstPlayer = tournament.game.determineFirstPlayer();
  tournament.game.currentPlayer = firstPlayer;

  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after configuration
  res.json(tournament.getState());
});

app.post("/api/game/play-again", (req, res) => {
  const { boardSize, player1Type, player2Type } = req.body;
  const player1Score = tournament.game.players.player1.score;
  const player2Score = tournament.game.players.player2.score;


  tournament.game = new Game(tournament, boardSize, player1Type, player2Type);
  tournament.game.players.player1.score = player1Score;  // Preserve scores
  tournament.game.players.player2.score = player2Score;

  tournament.game.currentPlayer = tournament.advantage.firstPlayer;

  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after configuration
  res.json(tournament.getState());
});

app.post("/api/game/valid-move", (req, res) => {
  const { validMove, toCover } = req.body;
  console.log("Valid move: ", validMove, toCover);

  if (validMove.length === 0) {
    console.log("No valid move found. Switching turn.");
    tournament.game.message = `${tournament.game.currentPlayer} chooses ${tournament.game.dice.total} (${!toCover ? "cover" : "uncover"}) and No valid move found. Switching turn.`;
    tournament.game.switchTurn();
    res.json({ message: "No valid move found. Switching turn." });
    return;
  }

  // Save snapshot after move
  tournament.saveMoveSnapshot();

  const currentPlayer = tournament.game.currentPlayer;
  let currentPlayerBoard, opponentBoard;

  if (currentPlayer === "player1") {
    currentPlayerBoard = tournament.game.players.player1.hasFirstTurnBeenPlayed = true;
  } else {
    currentPlayerBoard = tournament.game.players.player2.hasFirstTurnBeenPlayed = true;
  }

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
    
  if (toCover) {
    for (const square of validMove) {
      currentPlayerBoard.coverSquare(square);
    }
  } else {
    for (const square of validMove) {
      opponentBoard.uncoverSquare(square);
    }
  }

  let winner = tournament.game.isGameOver();
  if (winner !== null) {
    tournament.game.declareWinner();

    tournament.game.message = "Game over!"
    res.json({ winner, gameOver: true, message: "Game over!" });
    return;
  }

  tournament.game.message = `${currentPlayer} selected ${validMove} and choose to ${toCover ? "cover" : "uncover"}`;
  res.json({ message: `You selected: ${validMove}` });
});

app.post("/api/game/load-file", (req, res) => {
  const { body } = req;

  tournament.loadGame(tournament, body);

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
    currentPlayerBoard = tournament.game.players.player1.board;
    opponentBoard = tournament.game.players.player2.board;

  } else {
    currentPlayerBoard = tournament.game.players.player2.board;
    opponentBoard = tournament.game.players.player1.board;
  }

  validCoverCombinations = currentPlayerBoard.findValidCombinations(tournament.game.getDice().total, true);
  validUncoverCombinations = opponentBoard.findValidCombinations(tournament.game.getDice().total, false);

  if (checked)
    res.json(validCoverCombinations);
  else 
    res.json(validUncoverCombinations);
});

// In your server.js or routes file
app.get('/api/game/move-history', (req, res) => {
  res.json({
    history: tournament.moveHistory.map((state, index) => ({
      moveNumber: index + 1,
      currentPlayer: state.currentPlayer,
      player1: state.player1,
      player2: state.player2,
      dice: state.dice,
      advantage: state.advantage,
      lastAction: state.lastAction,    // Add these to your state object
      lastSquares: state.lastSquares   // Add these to your state object
    }))
  });
});

app.post('/api/game/rewind-move', (req, res) => {
  const { index } = req.body;
  if (tournament.rewindToMove(index)) {
    res.json({ success: true, state: tournament.getState() });
  } else {
    res.status(400).json({ error: "Invalid move index" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
