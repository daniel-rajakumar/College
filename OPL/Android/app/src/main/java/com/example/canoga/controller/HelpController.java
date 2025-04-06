package com.example.canoga.controller;

import com.example.canoga.model.Computer;

/**
 * Controller for the help mode.
 * Retrieves a recommended move strategy from the computer player.
 */
public class HelpController {
    private Computer computer;

    /**
     * Constructs the HelpController with a reference to the computer player.
     * @param computer The computer player.
     */
    public HelpController(Computer computer) {
        this.computer = computer;
    }

    /**
     * Returns the computer's move recommendation.
     * @return Explanation of the computer's strategy.
     */
    public String getComputerRecommendation() {
        return computer.getStrategyExplanation();
    }
}
