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