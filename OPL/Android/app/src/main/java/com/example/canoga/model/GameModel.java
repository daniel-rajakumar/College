package com.example.canoga.model;

/**
 * Singleton class for storing independent game state.
 */
public class GameModel {
    private static GameModel instance;
    private int boardSize; // Chosen by the human (9, 10, or 11)

    private GameModel() {
        boardSize = 9; // default value
    }

    public static GameModel getInstance() {
        if (instance == null) {
            instance = new GameModel();
        }
        return instance;
    }

    public void setBoardSize(int boardSize) {
        if (boardSize < 9 || boardSize > 11) {
            throw new IllegalArgumentException("Board size must be 9, 10, or 11.");
        }
        this.boardSize = boardSize;
    }

    public int getBoardSize() {
        return boardSize;
    }
}

