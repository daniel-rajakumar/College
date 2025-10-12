package com.example.canoga.model;

/**
 * Singleton class for storing independent game state.
 * <p>
 * Currently, it only stores the board size chosen by the human player (9, 10, or 11).
 */
public class GameModel {
    private static GameModel instance;
    private int boardSize;

    /**
     * Private constructor to ensure singleton pattern.
     * Initializes the board size to the default value 9.
     */
    private GameModel() {
        this.boardSize = 9;
    }



    /**
     * Returns the singleton instance of GameModel.
     *
     * @return the single instance of GameModel
     */
    public static GameModel getInstance() {
        if (instance == null) {
            instance = new GameModel();
        }
        return instance;
    }

    /**
     * Sets the board size.
     * Valid board sizes are 9, 10, or 11.
     *
     * @param boardSize the new board size
     * @throws IllegalArgumentException if the board size is not 9, 10, or 11
     */
    public void setBoardSize(int boardSize) {
        if (boardSize < 9 || boardSize > 11) {
            throw new IllegalArgumentException("Board size must be 9, 10, or 11.");
        }
        this.boardSize = boardSize;
    }

    /**
     * Returns the current board size.
     *
     * @return the board size
     */
    public int getBoardSize() {
        return boardSize;
    }

}

