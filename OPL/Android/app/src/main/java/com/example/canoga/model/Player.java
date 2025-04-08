package com.example.canoga.model;

/**
 * Abstract class for a game player.
 */
public abstract class Player {
    protected int score;
    protected Board board;
    protected boolean hasPlayed;

    /**
     * Constructs a player with a reference to the game board.
     * @param board The game board.
     */
    public Player(Board board) {
        this.board = board;
        this.score = 0;
        this.hasPlayed = false;
    }

    public int getScore() {
        return score;
    }

    public Board getBoard() {
        return board;
    }

    public void updateScore(int points) {
        score += points;
    }

    public boolean hasPlayed() {return hasPlayed;}

    public void setHasPlayed(boolean hasPlayed) {this.hasPlayed = hasPlayed;}

    /**
     * Perform a move given the dice sum.
     * @param diceSum The total value of dice thrown.
     * @return true if the move was successful.
     */
    public abstract boolean makeMove(int diceSum);
}

