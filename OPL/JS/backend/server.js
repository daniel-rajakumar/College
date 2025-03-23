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

app.post("/api/game/new", (req, res) => {
  tournament.game = new Game();
  tournament.game.setScreen("CONFIG"); // Set the screen to CONFIG for a new game
  res.json(tournament.getState());
});

app.post("/api/game/load", (req, res) => {
  const state = req.body;
  // tournament.loadGame(state);
  tournament.game.setScreen("LOAD"); // Set the screen to PLAY after loading the game
  res.json(tournament.getState());
});

app.post("/api/game/roll-dice", (req, res) => {
  const diceResult = tournament.game.rollDice();
  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after rolling dice
  res.json({ ...tournament.getState(), diceResult });
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

app.post("/api/game/config", (req, res) => {
  const { boardSize, player1Type, player2Type } = req.body;
  tournament.game = new Game(boardSize, player1Type, player2Type);
  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after configuration
  res.json(tournament.getState());
});

app.post("/api/game/input-dice", (req, res) => {
  const { inputDice } = req.body;
  res.json({ message: `You entered: ${inputDice}` });
});

app.post("/api/game/valid-move", (req, res) => {
  const { validMove } = req.body;
  res.json({ message: `You selected: ${validMove}` });
});

app.post("/api/game/load-file", (req, res) => {
  const { body } = req;

  console.log("Loading game state: ", body);

  tournament.loadGame(body);

  tournament.game.setScreen("PLAY"); // Set the screen to PLAY after loading the game

  console.log("Loading game state: ", tournament.getState());

  let stats = tournament.getState();
  res.json(stats);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
