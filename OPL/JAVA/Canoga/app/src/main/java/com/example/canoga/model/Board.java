package com.example.canoga.model;

/**
 * Represents the game board with two rows of squares: one for the human and one for the computer.
 * Each row contains a number of squares determined by the board size.
 */
public class Board {
    private final int size;
    private final boolean[] humanSquares;    // true = covered, false = uncovered
    private final boolean[] computerSquares; // true = covered, false = uncovered

    /**
     * Constructs a Board with the specified size.
     * The board size must be between 9 and 11, and initializes the squares for both human and computer.
     *
     * @param size the number of squares per row (must be between 9 and 11)
     * @throws IllegalArgumentException if the size is not within the valid range
     */
    public Board(int size) {
        if (size < 9 || size > 11) {
            throw new IllegalArgumentException("Board size must be between 9 and 11");
        }
        this.size = size;
        humanSquares = new boolean[size];    // false by default (uncovered)
        computerSquares = new boolean[size]; // initialization below

        // Initialize computer squares as covered (true) and human squares as uncovered (false)
        for (int i = 0; i < size; i++) {
            computerSquares[i] = true;
            humanSquares[i] = false;
        }
    }

    /**
     * Returns the size of the board.
     *
     * @return the number of squares per row
     */
    public int getSize() {
        return size;
    }

    /**
     * Returns the state of the human's squares.
     *
     * @return an array of booleans where true indicates a covered square
     */
    public boolean[] getHumanSquares() {
        return humanSquares;
    }

    /**
     * Returns the state of the computer's squares.
     *
     * @return an array of booleans where true indicates a covered square
     */
    public boolean[] getComputerSquares() {
        return computerSquares;
    }

    /**
     * Covers a human square.
     *
     * @param index Square number (1-indexed)
     * @return true if the square was successfully covered; false if the index is invalid or already covered
     */
    public boolean coverHumanSquare(int index) {
        if (index < 1 || index > size) return false;
        if (humanSquares[index - 1]) return false; // square already covered
        humanSquares[index - 1] = true;
        return true;
    }

    /**
     * Uncovers a computer square.
     *
     * @param index Square number (1-indexed)
     * @return true if the square was successfully uncovered; false if the index is invalid or already uncovered
     */
    public boolean uncoverComputerSquare(int index) {
        if (index < 1 || index > size) return false;
        if (!computerSquares[index - 1]) return false; // square already uncovered
        computerSquares[index - 1] = false;
        return true;
    }

    /**
     * Checks if all human squares are in the same state.
     * Typically used to determine if the human row is complete.
     *
     * @return true if all human squares are either all covered or all uncovered; false otherwise
     */
    public boolean isHumanComplete() {
        if (humanSquares.length == 0) return true;
        boolean first = humanSquares[0];
        for (boolean covered : humanSquares) {
            if (covered != first) {
                return false;
            }
        }
        return true;
    }

    /**
     * Checks if all computer squares are in the same state.
     * For this game, the round ends when the computer's row is fully uncovered.
     *
     * @return true if all computer squares are in the same state; false otherwise
     */
    public boolean isComputerComplete() {
        if (computerSquares.length == 0) return true;
        boolean first = computerSquares[0];
        for (boolean covered : computerSquares) {
            if (covered != first) {
                return false;
            }
        }
        return true;
    }

    /**
     * Uncovers a human square.
     *
     * @param square Square number (1-indexed)
     * @return true if the square was uncovered successfully; false if the square is invalid or already uncovered
     */
    public boolean uncoverHumanSquare(Integer square) {
        if (square < 1 || square > size) {
            return false;
        }
        if (!humanSquares[square - 1]) {
            return false; // square already uncovered
        }
        humanSquares[square - 1] = false;
        return true;
    }

    /**
     * Covers a computer square.
     *
     * @param square Square number (1-indexed)
     * @return true if the square was covered successfully; false if the square is invalid or already covered
     */
    public boolean coverComputerSquare(Integer square) {
        if (square < 1 || square > size) {
            return false;
        }
        if (computerSquares[square - 1]) {
            return false; // square already covered
        }
        computerSquares[square - 1] = true;
        return true;
    }
}
