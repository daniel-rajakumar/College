package com.example.canoga.model;

import java.io.Serializable;
import java.util.Random;

/**
 * Manages a single game round.
 */
public class GameRound implements Serializable {
    private Board board;
    private Human human;
    private Computer computer;
    private boolean isHumanTurn;
    private Random random;

    private Player winner;
    private int winnerScore;

    /**
     * Constructs a game round with a chosen board size.
     * @param boardSize The board size (9, 10, or 11).
     */
    public GameRound(int boardSize) {
        board = new Board(boardSize);
        human = new Human(board);
        computer = new Computer(board);
        random = new Random();
        // Default turn (this may be overridden by loaded data)
//        isHumanTurn = decideFirstPlayer();
        isHumanTurn = true;
        winner = null;
        winnerScore = 0;
    }

    private boolean decideFirstPlayer() {
        int humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        int computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        while (humanRoll == computerRoll) {
            humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
            computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        }
        return humanRoll > computerRoll;
    }

    public boolean playComputerTurn(int diceSum) {
        isHumanTurn = !computer.makeMove(diceSum);
        return !isHumanTurn;
    }

    private int throwDice() {
        int die1 = random.nextInt(6) + 1;
        int die2 = random.nextInt(6) + 1;
        return die1 + die2;
    }

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
        sb.append("\nNext Turn: ").append(isHumanTurn ? "Human" : "Computer");
        return sb.toString();
    }

    // Setters used by the parser:
    public void setBoard(Board board) {
        this.board = board;
    }

    public void setHuman(Human human) {
        this.human = human;
    }

    public void setComputer(Computer computer) {
        this.computer = computer;
    }

    public void setHumanTurn(boolean isHumanTurn) {
        this.isHumanTurn = isHumanTurn;
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

    public boolean isHumanTurn() {
        return isHumanTurn;
    }

    public Player getCurrentPlayer() {
        return isHumanTurn ? human : computer;
    }

    public String getWinner() {
        if (human.getScore() > computer.getScore()) {
            return "human";
        } else if (computer.getScore() > human.getScore()) {
            return "computer";
        }
        return "draw"; // Draw
    }

    public void setWinner(Player winner) {
        this.winner = winner;
    }

    public Player getWinnerPlayer() {
        return winner;
    }
    public String getWinnerName() {
        if (winner == human) {
            return "Human";
        } else if (winner == computer) {
            return "Computer";
        }
        return "Draw";
    }

    public void setWinnerScore(int winnerScore) {
        this.winnerScore = winnerScore;
    }

    public int getWinnerScore() {
        return winnerScore;
    }
}
