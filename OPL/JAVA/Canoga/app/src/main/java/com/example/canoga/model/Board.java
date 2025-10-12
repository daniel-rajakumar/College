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

    public enum AdvantageOwner { NONE, HUMAN, COMPUTER }

    private AdvantageOwner advantageOwner = AdvantageOwner.NONE;
    private int advantageSquare = 0;          // 1..size, or 0 = none
    private boolean advantageLockActive = false; // true until advantaged player has taken one turn


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

    public boolean uncoverHumanSquare(Integer square) {
        if (square < 1 || square > size) return false;

        // If HUMAN owns advantage, their square is protected from uncover by Computer until lock released
        if (advantageLockActive && advantageOwner == AdvantageOwner.HUMAN && square == advantageSquare) {
            return false; // locked
        }
        if (!humanSquares[square - 1]) return false;
        setHuman(square - 1, false);  // (your counter-aware setter)
        return true;
    }

    public boolean uncoverHumanSquare(int square) {
        if (square < 1 || square > size) return false;
        // Computer tries to uncover Human's square; block if it's the locked advantage square
        if (advantageLockActive && advantageOwner == AdvantageOwner.HUMAN && square == advantageSquare) return false;
        if (!humanSquares[square - 1]) return false;
        humanSquares[square - 1] = false;
        return true;
    }

    public boolean uncoverComputerSquare(int index) {
        if (index < 1 || index > size) return false;

        // If COMPUTER owns advantage, their square is protected from uncover by Human until lock released
        if (advantageLockActive && advantageOwner == AdvantageOwner.COMPUTER && index == advantageSquare) {
            return false; // locked
        }
        if (!computerSquares[index - 1]) return false;
        setComputer(index - 1, false); // (your counter-aware setter)
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
        // Human wins by covering all human squares OR fully uncovering the computer row
        // If you have "ever-covered" guards, call them here; otherwise, keep only covered-all:
        return isHumanCoveredAll(); // + (guarded) isComputerUncoveredAll
    }
    public boolean isComputerComplete() {
        // Computer wins by covering all computer squares OR fully uncovering the human row
        return isComputerCoveredAll(); // + (guarded) isHumanUncoveredAll
    }


    public boolean isHumanCoveredAll() {
        for (boolean c : humanSquares) if (!c) return false;
        return true;
    }
    public boolean isComputerCoveredAll() {
        for (boolean c : computerSquares) if (!c) return false;
        return true;
    }
    public boolean isHumanUncoveredAll() {
        for (boolean c : humanSquares) if (c) return false;
        return true;
    }
    public boolean isComputerUncoveredAll() {
        for (boolean c : computerSquares) if (c) return false;
        return true;
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

    public void refreshCountsFromState() {
        recomputeCounts();
    }

    public void applyAdvantage(AdvantageOwner owner, int square1Indexed) {
        advantageOwner = owner;
        advantageSquare = (square1Indexed >= 1 && square1Indexed <= size) ? square1Indexed : 0;
        advantageLockActive = (advantageOwner != AdvantageOwner.NONE && advantageSquare != 0);

        if (advantageOwner == AdvantageOwner.HUMAN && advantageSquare != 0) {
            coverHumanSquare(advantageSquare);
        } else if (advantageOwner == AdvantageOwner.COMPUTER && advantageSquare != 0) {
            coverComputerSquare(advantageSquare);
        }
        recomputeCounts(); // keep your counters/flags correct
    }

    public void releaseAdvantageLock() {
        advantageLockActive = false;
    }

    public AdvantageOwner getAdvantageOwner() { return advantageOwner; }
    public int getAdvantageSquare() { return advantageSquare; }
    public boolean isAdvantageLockActive() { return advantageLockActive; }



}
