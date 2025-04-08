package com.example.canoga.model;

/**
 * Represents the game board with two rows: one for the human and one for the computer.
 * Each row contains squares numbered 1..n.
 */
public class Board {
    private final int size;
    private final boolean[] humanSquares;    // true = covered, false = uncovered
    private final boolean[] computerSquares; // true = covered, false = uncovered

    /**
     * Constructs the board for a given size.
     * @param size The number of squares per row (9, 10, or 11).
     */
    public Board(int size) {
        if (size < 9 || size > 11) {
            throw new IllegalArgumentException("Board size must be between 9 and 11");
        }
        this.size = size;
        humanSquares = new boolean[size];    // All false by default (uncovered)
        computerSquares = new boolean[size]; // For this game, assume initial state is covered

        for (int i = 0; i < size; i++) {
            computerSquares[i] = false;  // For example, computer starts with all squares covered.
            humanSquares[i] = false; // Human starts with all squares uncovered.
        }
    }

    public int getSize() {
        return size;
    }

    public boolean[] getHumanSquares() {
        return humanSquares;
    }

    public boolean[] getComputerSquares() {
        return computerSquares;
    }

    /**
     * Cover a human square.
     * @param index Square number (1-indexed)
     * @return true if successful, false if already covered or invalid index.
     */
    public boolean coverHumanSquare(int index) {
        if (index < 1 || index > size) return false;
        if (humanSquares[index - 1]) return false; // already covered
        humanSquares[index - 1] = true;
        return true;
    }

    /**
     * Uncover a computer square.
     * @param index Square number (1-indexed)
     * @return true if successful, false if already uncovered or invalid.
     */
    public boolean uncoverComputerSquare(int index) {
        if (index < 1 || index > size) return false;
        if (!computerSquares[index - 1]) return false; // already uncovered
        computerSquares[index - 1] = false;
        return true;
    }

    public boolean isHumanComplete() {
        if (humanSquares.length == 0) return true;  // edge case: empty array considered "complete"
        boolean first = humanSquares[0];
        for (boolean covered : humanSquares) {
            if (covered != first) return false;
        }
        return true;
    }

    public boolean isComputerComplete() {
        // For this game, assume round ends when computer's row is fully uncovered.
        if (computerSquares.length == 0) return true; // edge case: empty array considered "complete"
        boolean first = computerSquares[0];
        for (boolean covered : computerSquares) {
            if (covered != first) return false;
        }
        return true;
    }

    public boolean uncoverHumanSquare(Integer square) {
        if (square < 1 || square > size) {
            return false; // Invalid index
        }
        if (!humanSquares[square - 1]) {
            return false; // Already uncovered
        }
        humanSquares[square - 1] = false; // Uncover the square
        return true;
    }

    public boolean coverComputerSquare(Integer square) {
        if (square < 1 || square > size) {
            return false; // Invalid index
        }
        if (computerSquares[square - 1]) {
            return false; // Already covered
        }
        computerSquares[square - 1] = true; // Cover the square
        return true;
    }
}
