package com.example.oplcanoga.model;

/**
 * Abstract class representing a player in the OPL Canoga game.
 * Maintains the state of the player's board (covered/uncovered squares) and tournament score.
 */
public abstract class Player {

    protected final PlayerId id;
    protected int[] squares;
    protected int boardSize;
    protected int tournamentScore;

    /**
     * Constructs a Player with the specified ID and board size.
     *
     * @param id        The unique identifier for the player.
     * @param boardSize The number of squares on the player's board.
     */
    protected Player(PlayerId id, int boardSize) {
        this.id = id;
        this.boardSize = boardSize;
        this.squares = new int[boardSize + 1];
        resetBoard(null);
    }

    /**
     * Sets a new board size for the player and resets the squares array.
     *
     * @param newBoardSize The new size of the board.
     */
    public void setBoardSize(int newBoardSize) {
        this.boardSize = newBoardSize;
        this.squares = new int[newBoardSize + 1];
    }

    /**
     * Gets the player's ID.
     *
     * @return The PlayerId.
     */
    public PlayerId getId() {
        return id;
    }

    /**
     * Gets the current board size.
     *
     * @return The size of the board.
     */
    public int getBoardSize() {
        return boardSize;
    }

    /**
     * Gets the player's total tournament score.
     *
     * @return The tournament score.
     */
    public int getTournamentScore() {
        return tournamentScore;
    }

    /**
     * Adds a delta to the player's tournament score.
     *
     * @param delta The amount to add (can be negative).
     */
    public void addToTournamentScore(int delta) {
        this.tournamentScore += delta;
    }

    /**
     * Resets the board to the initial state where all squares are uncovered (value equals index),
     * unless an advantage square is provided which will be covered.
     *
     * @param advantageSquare The square to cover initially as a handicap/advantage, or null if none.
     */
    public void resetBoard(Integer advantageSquare) {
        for (int i = 1; i <= boardSize; i++) {
            squares[i] = i;
        }
        if (advantageSquare != null && advantageSquare >= 1 && advantageSquare <= boardSize) {
            coverSquare(advantageSquare);
        }
    }

    /**
     * Checks if a specific square is covered.
     *
     * @param square The square number to check.
     * @return True if the square is covered (value is 0), false otherwise.
     */
    public boolean isCovered(int square) {
        checkSquareRange(square);
        return squares[square] == 0;
    }

    /**
     * Covers a specific square.
     *
     * @param square The square number to cover.
     */
    public void coverSquare(int square) {
        checkSquareRange(square);
        squares[square] = 0;
    }

    /**
     * Uncovers a specific square.
     *
     * @param square The square number to uncover.
     */
    public void uncoverSquare(int square) {
        checkSquareRange(square);
        squares[square] = square;
    }

    /**
     * Creates a copy of the current squares array.
     *
     * @return A copy of the squares array.
     */
    public int[] getSquaresCopy() {
        int[] copy = new int[boardSize + 1];
        System.arraycopy(squares, 0, copy, 0, squares.length);
        return copy;
    }

    /**
     * Checks if all squares on the board are covered.
     *
     * @return True if all squares are covered, false otherwise.
     */
    public boolean allSquaresCovered() {
        for (int i = 1; i <= boardSize; i++) {
            if (!isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if all squares on the board are uncovered.
     *
     * @return True if all squares are uncovered, false otherwise.
     */
    public boolean allSquaresUncovered() {
        for (int i = 1; i <= boardSize; i++) {
            if (isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Calculates the sum of the values of all covered squares.
     * Note: Since covered squares have value 0 in the array, we sum the indices.
     *
     * @return The sum of indices of covered squares.
     */
    public int sumOfCoveredSquares() {
        int sum = 0;
        for (int i = 1; i <= boardSize; i++) {
            if (isCovered(i)) {
                sum += i;
            }
        }
        return sum;
    }

    /**
     * Calculates the sum of the values of all uncovered squares.
     *
     * @return The sum of values of uncovered squares.
     */
    public int sumOfUncoveredSquares() {
        int sum = 0;
        for (int i = 1; i <= boardSize; i++) {
            if (!isCovered(i)) {
                sum += i;
            }
        }
        return sum;
    }

    /**
     * Validates that the square index is within the valid range [1, boardSize].
     *
     * @param square The square number to check.
     * @throws IllegalArgumentException if the square is out of range.
     */
    private void checkSquareRange(int square) {
        if (square < 1 || square > boardSize) {
            throw new IllegalArgumentException("Square out of range: " + square);
        }
    }
}
