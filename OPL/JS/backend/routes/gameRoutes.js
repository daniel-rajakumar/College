const express = require("express");
const CanogaGame = require("../gameLogic");
const router = express.Router();

const game = new CanogaGame();

// Roll dice
router.post("/roll-dice", (req, res) => {
  const { dice1, dice2, total } = game.rollDice();
  res.json({ dice1, dice2, total });
});

// Start a new round
router.post("/new-round", (req, res) => {
  const { humanSquares, computerSquares } = game.newRound();
  res.json({ humanSquares, computerSquares });
});

module.exports = router;