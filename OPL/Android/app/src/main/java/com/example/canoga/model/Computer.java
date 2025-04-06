package com.example.canoga.model;

/**
 * Represents the computer player.
 */
public class Computer extends Player {

    public Computer(Board board) {
        super(board);
    }

    @Override
    public boolean makeMove(int diceSum) {
        // Implement the computer's strategy here:
        // Decide whether to cover its own squares or uncover human squares,
        // update board accordingly.
        // Return true if move is successful.
        return false;
    }

    /**
     * Provides a rationale for the move selected by the computer.
     * @return Strategy explanation.
     */
    public String getStrategyExplanation() {
        return "Computer recommends covering squares X and Y for optimal play.";
    }
}
