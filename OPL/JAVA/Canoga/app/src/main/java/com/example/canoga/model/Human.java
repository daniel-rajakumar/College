package com.example.canoga.model;

import java.util.List;

/**
 * Represents the human player in the game.
 * <p>
 * The Human player makes moves based on user input.
 */
public class Human extends Player {

    /**
     * Constructs a Human player associated with the given board.
     *
     * @param board the game board associated with the player
     */
    public Human(Board board) {
        super(board);
    }

    /**
     * Processes the human player's move.
     * <p>
     * This method should validate the input move and perform either a covering or uncovering action
     * on the board based on the game rules. The actual move processing is expected to be triggered
     * by the user interface and then passed to this method for validation.
     *
     * @param diceSum the total value of the dice thrown
     * @return true if the move is successful; false otherwise
     */
    @Override
    public boolean makeMove(int diceSum) {
        // TODO: Implement move validation and execution logic based on user input.
        // For now, return false as a placeholder.
        return false;
    }
}
