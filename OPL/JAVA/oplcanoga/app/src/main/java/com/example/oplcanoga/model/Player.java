package com.example.oplcanoga.model;

public abstract class Player {

    protected final PlayerId id;
    protected int[] squares;
    protected int boardSize;
    protected int tournamentScore;

    protected Player(PlayerId id, int boardSize) {
        this.id = id;
        this.boardSize = boardSize;
        this.squares = new int[boardSize + 1];
        resetBoard(null);
    }

    public void setBoardSize(int newBoardSize) {
        this.boardSize = newBoardSize;
        this.squares = new int[newBoardSize + 1];
    }


    public PlayerId getId() {
        return id;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public int getTournamentScore() {
        return tournamentScore;
    }

    public void addToTournamentScore(int delta) {
        this.tournamentScore += delta;
    }

    public void resetBoard(Integer advantageSquare) {
        for (int i = 1; i <= boardSize; i++) {
            squares[i] = i;
        }
        if (advantageSquare != null && advantageSquare >= 1 && advantageSquare <= boardSize) {
            coverSquare(advantageSquare);
        }
    }

    public boolean isCovered(int square) {
        checkSquareRange(square);
        return squares[square] == 0;
    }

    public void coverSquare(int square) {
        checkSquareRange(square);
        squares[square] = 0;
    }

    public void uncoverSquare(int square) {
        checkSquareRange(square);
        squares[square] = square;
    }

    public int[] getSquaresCopy() {
        int[] copy = new int[boardSize + 1];
        System.arraycopy(squares, 0, copy, 0, squares.length);
        return copy;
    }

    public boolean allSquaresCovered() {
        for (int i = 1; i <= boardSize; i++) {
            if (!isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    public boolean allSquaresUncovered() {
        for (int i = 1; i <= boardSize; i++) {
            if (isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    public int sumOfCoveredSquares() {
        int sum = 0;
        for (int i = 1; i <= boardSize; i++) {
            if (isCovered(i)) {
                sum += i;
            }
        }
        return sum;
    }

    public int sumOfUncoveredSquares() {
        int sum = 0;
        for (int i = 1; i <= boardSize; i++) {
            if (!isCovered(i)) {
                sum += i;
            }
        }
        return sum;
    }

    private void checkSquareRange(int square) {
        if (square < 1 || square > boardSize) {
            throw new IllegalArgumentException("Square out of range: " + square);
        }
    }
}
