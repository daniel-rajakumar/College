package com.example.canoga.controller;

import com.example.canoga.model.GameRound;
import com.example.canoga.model.Tournament;

/**
 * Controller for managing the tournament.
 * Aggregates game rounds and computes overall scores.
 */
public class TournamentController {
    private Tournament tournament;

    /**
     * Constructs the TournamentController and initializes a new Tournament.
     */
    public TournamentController() {
        tournament = new Tournament();
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
}
