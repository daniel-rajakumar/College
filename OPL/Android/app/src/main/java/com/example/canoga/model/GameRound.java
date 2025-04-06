package com.example.canoga.model;

import java.util.Random;

/**
 * Manages a single game round.
 */
public class GameRound {
    private Board board;
    private Human human;
    private Computer computer;
    private boolean isHumanTurn;
    private Random random;

    /**
     * Constructs a game round with a chosen board size.
     * @param boardSize The board size (9, 10, or 11).
     */
    public GameRound(int boardSize) {
        board = new Board(boardSize);
        human = new Human(board);
        computer = new Computer(board);
        random = new Random();
        isHumanTurn = decideFirstPlayer();
    }

    /**
     * Determines the first player by rolling dice.
     * @return true if human goes first.
     */
    private boolean decideFirstPlayer() {
        int humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        int computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        while (humanRoll == computerRoll) {
            humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
            computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        }
        return humanRoll > computerRoll;
    }

    /**
     * Plays one turn of the game.
     */
    public void playTurn() {
        int diceSum = throwDice();
        if (isHumanTurn) {
            human.makeMove(diceSum);
        } else {
            computer.makeMove(diceSum);
        }
        // For simplicity, alternate turn after each move.
        isHumanTurn = !isHumanTurn;
    }

    /**
     * Simulates dice throws.
     * @return Sum of dice values.
     */
    private int throwDice() {
        int die1 = random.nextInt(6) + 1;
        int die2 = random.nextInt(6) + 1;
        return die1 + die2;
    }

    /**
     * Serializes the game round state into a text format.
     * @return Serialized game state.
     */
    public String serialize() {
        StringBuilder sb = new StringBuilder();
        sb.append("Board Size: ").append(board.getSize()).append("\n");
        sb.append("Human Score: ").append(human.getScore()).append("\n");
        sb.append("Computer Score: ").append(computer.getScore()).append("\n");
        sb.append("Human Squares: ");
        for (boolean covered : board.getHumanSquares()) {
            sb.append(covered ? "1 " : "0 ");
        }
        sb.append("\nComputer Squares: ");
        for (boolean covered : board.getComputerSquares()) {
            sb.append(covered ? "1 " : "0 ");
        }
        return sb.toString();
    }

    public Human getHuman() {
        return human;
    }

    public Computer getComputer() {
        return computer;
    }

    public Board getBoard() {
        return board;
    }
}
