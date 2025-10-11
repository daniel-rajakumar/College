package com.example.canoga.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the tournament across multiple game rounds.
 * <p>
 * Aggregates rounds and calculates total scores for both human and computer players.
 * It also maintains the current game mode.
 */
public class Tournament {
    private List<GameRound> rounds; // List of game rounds played
    private int humanTotalScore;    // Aggregated score for the human player
    private int computerTotalScore; // Aggregated score for the computer player
    private String currentGameMode = "NEW"; // Current game mode ("NEW", "LOADED", "RESTART", etc.)

    /**
     * Constructs a new Tournament instance.
     * Initializes an empty list for rounds and sets total scores to zero.
     */
    public Tournament() {
        rounds = new ArrayList<>();
        humanTotalScore = 0;
        computerTotalScore = 0;
    }

    /**
     * Adds a completed game round to the tournament.
     * Updates total scores for the human and computer based on the round results.
     *
     * @param round the game round to add
     */
    public void addRound(GameRound round) {
        rounds.add(round);
        humanTotalScore += round.getHuman().getScore();
        computerTotalScore += round.getComputer().getScore();
    }

    /**
     * Determines the overall winner based on total scores.
     *
     * @return "Human" if the human player's total score is higher,
     *         "Computer" if the computer player's total score is higher,
     *         or "Both" if there is a tie.
     */
    public String determineWinner() {
        if (humanTotalScore > computerTotalScore) {
            return "Human";
        } else if (computerTotalScore > humanTotalScore) {
            return "Computer";
        } else {
            return "Both";
        }
    }

    /**
     * Returns the total score accumulated by the human player across all rounds.
     *
     * @return the human player's total score
     */
    public int getHumanTotalScore() {
        return humanTotalScore;
    }

    /**
     * Returns the total score accumulated by the computer player across all rounds.
     *
     * @return the computer player's total score
     */
    public int getComputerTotalScore() {
        return computerTotalScore;
    }

    /**
     * Returns the current game mode.
     *
     * @return the current game mode
     */
    public String getCurrentGameMode() {
        return currentGameMode;
    }

    /**
     * Sets the current game mode.
     *
     * @param currentGameMode the new game mode
     */
    public void setCurrentGameMode(String currentGameMode) {
        this.currentGameMode = currentGameMode;
    }
}
