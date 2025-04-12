package com.example.canoga.model;

/**
 * Abstract class representing a game player.
 * <p>
 * This class serves as a base for specific player types with common properties like score,
 * associated game board, and whether the player has played in the current round.
 */
public abstract class Player {
    protected int score;
    protected Board board;
    protected boolean hasPlayed;

    /**
     * Constructs a player with a reference to the game board.
     *
     * @param board The game board.
     */
    public Player(Board board) {
        this.board = board;
        this.score = 0;
        this.hasPlayed = false;
    }

    /**
     * Returns the current score of the player.
     *
     * @return the score
     */
    public int getScore() {
        return score;
    }

    /**
     * Returns the game board associated with the player.
     *
     * @return the board
     */
    public Board getBoard() {
        return board;
    }

    /**
     * Adds the specified number of points to the player's score.
     *
     * @param points the points to add
     */
    public void updateScore(int points) {
        score += points;
    }

    /**
     * Checks whether the player has made a move in the current round.
     *
     * @return true if the player has played; false otherwise
     */
    public boolean hasPlayed() {
        return hasPlayed;
    }

    /**
     * Sets whether the player has made a move in the current round.
     *
     * @param hasPlayed true if the player has played; false otherwise
     */
    public void setHasPlayed(boolean hasPlayed) {
        this.hasPlayed = hasPlayed;
    }

    /**
     * Performs a move based on the sum of dice thrown.
     *
     * @param diceSum the total value of dice thrown
     * @return true if the move was successful; false otherwise
     */
    public abstract boolean makeMove(int diceSum);
}

