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
            computerSquares[i] = false;
            humanSquares[i] = false;
        }
    }

    // ==== NEW: state helpers and atomic move applier ====

    // Returns true if the given square index (1-based) is covered for the given row.
    public boolean isCovered(boolean isHumanRow, int square1Based) {
        int i = square1Based - 1;
        if (i < 0 || i >= humanSquares.length) throw new IllegalArgumentException("square OOB");
        return isHumanRow ? humanSquares[i] : computerSquares[i];
    }

    // Sets covered/uncovered for a single square (1-based) on the given row.
    public void setCovered(boolean isHumanRow, int square1Based, boolean covered) {
        int i = square1Based - 1;
        if (i < 0 || i >= humanSquares.length) throw new IllegalArgumentException("square OOB");
        if (isHumanRow) humanSquares[i] = covered; else computerSquares[i] = covered;
    }

    /**
     * Atomically applies a move:
     *  - isHumanTurn: whose *action* this is
     *  - coverMode: true = cover own row squares, false = uncover opponent row squares
     *  - squares: 1..n indices, size 1..4, sum must equal diceSum
     *  - diceSum: the dice total used to justify the move
     *
     * Throws IllegalArgumentException if the move is illegal. No partial mutation if illegal.
     */
    public void applyMove(boolean isHumanTurn, boolean coverMode, java.util.List<Integer> squares, int diceSum) {
        if (squares == null || squares.isEmpty() || squares.size() > 4)
            throw new IllegalArgumentException("Must choose 1..4 squares");
        int sum = 0;
        for (int s : squares) {
            if (s < 1 || s > humanSquares.length) throw new IllegalArgumentException("Square OOB: " + s);
            sum += s;
        }
        if (sum != diceSum) throw new IllegalArgumentException("Squares do not sum to dice total");

        // validate states first (no mutation)
        if (coverMode) {
            // Cover own row
            for (int s : squares) {
                if (isCovered(isHumanTurn, s)) {
                    throw new IllegalArgumentException("Cannot cover an already covered square: " + s);
                }
            }
        } else {
            // Uncover opponent row
            for (int s : squares) {
                if (!isCovered(!isHumanTurn, s)) {
                    throw new IllegalArgumentException("Cannot uncover an already uncovered square: " + s);
                }
            }
        }

        // perform mutation only after full validation
        if (coverMode) {
            for (int s : squares) setCovered(isHumanTurn, s, true);
        } else {
            for (int s : squares) setCovered(!isHumanTurn, s, false);
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

    // ---- BEGIN REPLACEMENT: explicit completion/win predicates ----

    /** Helpers */
    private boolean allTrue(boolean[] a) {
        for (boolean b : a) if (!b) return false;
        return a.length > 0;
    }
    private boolean allFalse(boolean[] a) {
        for (boolean b : a) if (b) return false;
        return a.length > 0;
    }

    /**
     * Human has covered all of their own squares (win condition A for Human).
     */
    public boolean hasHumanCoveredAll() {
        return allTrue(humanSquares);
    }

    /**
     * Human has uncovered all of the computer's squares (win condition B for Human).
     */
    public boolean hasHumanUncoveredAllOpponent() {
        return allFalse(computerSquares);
    }

    /**
     * Computer has covered all of their own squares (win condition A for Computer).
     */
    public boolean hasComputerCoveredAll() {
        return allTrue(computerSquares);
    }

    /**
     * Computer has uncovered all of the human's squares (win condition B for Computer).
     */
    public boolean hasComputerUncoveredAllOpponent() {
        return allFalse(humanSquares);
    }

// ---- END REPLACEMENT ----


    public boolean isHumanComplete() {
        return humanCoveredAll() || humanUncoveredAllComputer();
    }

    public boolean isComputerComplete() {
        return computerCoveredAll() || computerUncoveredAllHuman();
    }

    public boolean isRoundComplete() {
        return isHumanComplete() || isComputerComplete();
    }

    public boolean humanCoveredAll() {
        for (boolean b : humanSquares) if (!b) return false;
        return true;
    }
    public boolean humanUncoveredAllComputer() {
        for (boolean b : computerSquares) if (b) return false;
        return true;
    }
    public boolean computerCoveredAll() {
        for (boolean b : computerSquares) if (!b) return false;
        return true;
    }
    public boolean computerUncoveredAllHuman() {
        for (boolean b : humanSquares) if (b) return false;
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
