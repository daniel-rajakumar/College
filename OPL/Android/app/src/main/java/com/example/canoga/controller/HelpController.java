package com.example.canoga.controller;

import com.example.canoga.model.Computer;

/**
 * Controller for the help mode.
 * <p>
 * This controller retrieves the computer's recommended move strategy to assist the human player.
 */
public class HelpController {
    private final Computer computer;

    /**
     * Constructs a HelpController with the specified computer player.
     *
     * @param computer the computer player from which to retrieve move recommendations
     */
    public HelpController(Computer computer) {
        this.computer = computer;
    }

    /**
     * Retrieves a recommended move strategy from the computer player.
     *
     * @return a String explanation of the computer's move strategy
     */
    public String getComputerRecommendation() {
        return computer.getStrategyExplanation();
    }
}
