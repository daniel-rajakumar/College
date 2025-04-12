package com.example.canoga.controller;

import com.example.canoga.model.GameRound;
import com.example.canoga.model.Tournament;

/**
 * Controller for managing the tournament across multiple game rounds.
 * <p>
 * Aggregates completed game rounds, computes overall scores, and determines the tournament winner.
 * It also manages the current game mode.
 */
public class TournamentController {
    private static Tournament tournament = new Tournament();

    /**
     * Constructs the TournamentController.
     * <p>
     * This constructor initializes a new Tournament instance.
     */
    public TournamentController() {
        // The tournament instance is statically initialized.
    }

    /**
     * Adds a completed game round to the tournament.
     *
     * @param round The completed game round.
     */
    public void addRound(GameRound round) {
        tournament.addRound(round);
    }

    /**
     * Determines the overall tournament winner.
     *
     * @return "Human", "Computer", or "Both" if there is a tie.
     */
    public String getTournamentWinner() {
        return tournament.determineWinner();
    }

    /**
     * Retrieves the cumulative score of the human player.
     *
     * @return The human player's total score.
     */
    public int getHumanTotalScore() {
        return tournament.getHumanTotalScore();
    }

    /**
     * Retrieves the cumulative score of the computer player.
     *
     * @return The computer player's total score.
     */
    public int getComputerTotalScore() {
        return tournament.getComputerTotalScore();
    }

    /**
     * Returns the current game mode.
     *
     * @return the current game mode as a String.
     */
    public String getCurrentGameMode() {
        return tournament.getCurrentGameMode();
    }

    /**
     * Sets the current game mode.
     *
     * @param currentGameMode the new game mode.
     */
    public void setCurrentGameMode(String currentGameMode) {
        tournament.setCurrentGameMode(currentGameMode);
    }

    /**
     * Retrieves the singleton instance of TournamentController.
     *
     * @return the TournamentController instance.
     */
    public static TournamentController getInstance() {
        return SingletonHolder.INSTANCE;
    }

    /**
     * Holder class for lazy-loaded singleton instance.
     */
    private static class SingletonHolder {
        private static final TournamentController INSTANCE = new TournamentController();
    }
}
