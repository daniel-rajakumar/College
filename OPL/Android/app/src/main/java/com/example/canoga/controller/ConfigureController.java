package com.example.canoga.controller;

import com.example.canoga.model.GameModel;

/**
 * Controller for the configuration view.
 * This class handles updating the game model with user-selected configuration options,
 * such as the board size.
 */
public class ConfigureController {
    private GameModel model;

    /**
     * Constructs the ConfigureController and obtains the singleton GameModel.
     */
    public ConfigureController() {
        model = GameModel.getInstance();
    }

    /**
     * Sets the board size in the GameModel.
     * @param boardSize The board size selected by the user (must be 9, 10, or 11).
     * @throws IllegalArgumentException if the board size is out of range.
     */
    public void setBoardSize(int boardSize) {
        model.setBoardSize(boardSize);
    }
}
