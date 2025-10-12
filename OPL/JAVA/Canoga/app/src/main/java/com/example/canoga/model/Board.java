package com.example.canoga.model;

/**
 * Represents the game board with two rows of squares: one for the human and one for the computer.
 * Each row contains a number of squares determined by the board size.
 */
public class Board {
    private final int size;
    private final boolean[] humanSquares;    // true = covered, false = uncovered
    private final boolean[] computerSquares; // true = covered, false = uncovered
    // fields
    private int humanCoveredCount = 0;
    private int computerCoveredCount = 0;
    private boolean humanEverCovered = false;     // has human row ever had any covered square this round?
    private boolean computerEverCovered = false;  // has computer row ever had any covered square this round?

    public void recomputeCounts() {
        humanCoveredCount = 0;
        for (boolean c : humanSquares) if (c) humanCoveredCount++;
        computerCoveredCount = 0;
        for (boolean c : computerSquares) if (c) computerCoveredCount++;

        // "ever" flags reflect whether there has been anything to uncover
        humanEverCovered = humanCoveredCount > 0;
        computerEverCovered = computerCoveredCount > 0;
    }


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

        recomputeCounts(); // <— LAST line of the ctor
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
    /**
     * Uncovers a computer square.
     *
     * @param index Square number (1-indexed)
     * @return true if the square was successfully uncovered; false if the index is invalid or already uncovered
     */




    public boolean coverHumanSquare(int index) {
        if (index < 1 || index > size) return false;
        int i = index - 1;
        if (humanSquares[i]) return false;      // already covered
        setHuman(i, true);                      // ★ CHANGED
        return true;
    }

    public boolean uncoverComputerSquare(int index) {
        if (index < 1 || index > size) return false;
        int i = index - 1;
        if (!computerSquares[i]) return false;  // already uncovered
        setComputer(i, false);                  // ★ CHANGED
        return true;
    }

    public boolean uncoverHumanSquare(Integer square) {
        if (square < 1 || square > size) return false;
        int i = square - 1;
        if (!humanSquares[i]) return false;     // already uncovered
        setHuman(i, false);                     // ★ CHANGED
        return true;
    }

    public boolean coverComputerSquare(Integer square) {
        if (square < 1 || square > size) return false;
        int i = square - 1;
        if (computerSquares[i]) return false;   // already covered
        setComputer(i, true);                   // ★ CHANGED
        return true;
    }


    public boolean isHumanComplete() {
        // Human wins if Human covered all OR Human fully UNcovered computer (after it had been covered)
        return isHumanCoveredAll() || isComputerUncoveredAllWin();  // ★ CHANGED
    }

    public boolean isComputerComplete() {
        // Computer wins if Computer covered all OR Computer fully UNcovered human (after it had been covered)
        return isComputerCoveredAll() || isHumanUncoveredAllWin();  // ★ CHANGED
    }


    // Computer wins if the Human has been fully uncovered (all false)
    public boolean isHumanUncoveredAll() {
        for (boolean covered : humanSquares) if (covered) return false;
        return true;
    }


    public boolean isComputerUncoveredAll() {
        for (boolean covered : computerSquares) if (covered) return false;
        return true;
    }

    public boolean isHumanCoveredAll() {
        return humanCoveredCount == humanSquares.length;            // ★ CHANGED
    }

    public boolean isComputerCoveredAll() {
        return computerCoveredCount == computerSquares.length;      // ★ CHANGED
    }

    // ★ ADD: Only count UNcovered-all as a win if that row had been covered at some point
    public boolean isComputerUncoveredAllWin() {
        return computerCoveredCount == 0 && computerEverCovered;
    }

    public boolean isHumanUncoveredAllWin() {
        return humanCoveredCount == 0 && humanEverCovered;
    }


    // ★ ADD: keep counts/flags in sync from one place
    private void setHuman(int zeroBasedIdx, boolean covered) {
        boolean prev = humanSquares[zeroBasedIdx];
        if (prev == covered) return;
        humanSquares[zeroBasedIdx] = covered;
        humanCoveredCount += covered ? 1 : -1;
        if (humanCoveredCount > 0) humanEverCovered = true;
    }

    private void setComputer(int zeroBasedIdx, boolean covered) {
        boolean prev = computerSquares[zeroBasedIdx];
        if (prev == covered) return;
        computerSquares[zeroBasedIdx] = covered;
        computerCoveredCount += covered ? 1 : -1;
        if (computerCoveredCount > 0) computerEverCovered = true;
    }



}
