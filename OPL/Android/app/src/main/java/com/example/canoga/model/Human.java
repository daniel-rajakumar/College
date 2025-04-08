package com.example.canoga.model;

import java.util.List;

/**
 * Represents the human player.
 */
public class Human extends Player {

    public Human(Board board) {
        super(board);
    }

    @Override
    public boolean makeMove(int diceSum) {
        // Actual move logic must validate input and allow covering or uncovering.
        // This should be triggered by UI input in the Controller.
        // For now, return false as a placeholder.
        return false;
    }

}
