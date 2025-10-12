package com.example.canoga.controller;

import com.example.canoga.model.Board;
import com.example.canoga.model.GameModel;
import com.example.canoga.model.GameRound;

/**
 * Controller for the configuration view.
 * <p>
 * This class handles updating the game model based on user-selected configuration options,
 * such as the board size, and provides a method to create a new game round.
 */
public class ConfigureController {
    private GameModel model;

    /**
     * Constructs the ConfigureController and obtains the singleton GameModel instance.
     */
    public ConfigureController() {
        model = GameModel.getInstance();
    }

    /**
     * Sets the board size in the GameModel.
     *
     * @param boardSize the board size selected by the user (must be 9, 10, or 11)
     * @throws IllegalArgumentException if the board size is out of allowed range
     */
    public void setBoardSize(int boardSize) {
        model.setBoardSize(boardSize);
    }

    /**
     * Creates a new GameRound using the current board size from the GameModel.
     *
     * @return a new instance of GameRound configured with the current board size
     */
    public GameRound getNewGameRound() {
        return new GameRound(model.getBoardSize());
    }

    public GameRound getNewGameRound(Board.AdvantageOwner owner, int advSquare) {
        return new GameRound(model.getBoardSize(), owner, advSquare);
    }
}
