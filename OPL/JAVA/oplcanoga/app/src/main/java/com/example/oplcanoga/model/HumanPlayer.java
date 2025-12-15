package com.example.oplcanoga.model;

/**
 * Represents the human player in the game.
 * Inherits from the abstract Player class.
 */
public class HumanPlayer extends Player {

    /**
     * Constructs a HumanPlayer with the specified board size.
     *
     * @param boardSize The number of squares on the player's board.
     */
    public HumanPlayer(int boardSize) {
        super(PlayerId.HUMAN, boardSize);
    }
}
