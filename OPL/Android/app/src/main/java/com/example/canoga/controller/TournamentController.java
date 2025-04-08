package com.example.canoga.controller;

import com.example.canoga.model.GameRound;
import com.example.canoga.model.Tournament;

/**
 * Controller for managing the tournament.
 * Aggregates game rounds and computes overall scores.
 */
public class TournamentController {
    private static Tournament tournament = new Tournament();

    /**
     * Constructs the TournamentController and initializes a new Tournament.
     */
    public TournamentController() {
    }

    /**
     * Adds a completed game round to the tournament.
     * @param round The completed game round.
     */
    public void addRound(GameRound round) {
        tournament.addRound(round);
    }

    /**
     * Determines the tournament winner.
     * @return "Human", "Computer", or "Draw".
     */
    public String getTournamentWinner() {
        return tournament.determineWinner();
    }

    /**
     * Retrieves the human player's cumulative score.
     * @return Human total score.
     */
    public int getHumanTotalScore() {
        return tournament.getHumanTotalScore();
    }

    /**
     * Retrieves the computer player's cumulative score.
     * @return Computer total score.
     */
    public int getComputerTotalScore() {
        return tournament.getComputerTotalScore();
    }

    public String getCurrentGameMode() {
        return tournament.getCurrentGameMode();
    }

    public void setCurrentGameMode(String currentGameMode) {
        tournament.setCurrentGameMode(currentGameMode);
    }

    // A public static method to access the singleton instance.
    public static TournamentController getInstance() {
        return SingletonHolder.INSTANCE;
    }

    private static class SingletonHolder {
        private static final TournamentController INSTANCE = new TournamentController();
    }

}
