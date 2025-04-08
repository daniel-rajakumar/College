package com.example.canoga.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the tournament across multiple rounds.
 */
public class Tournament {
    private List<GameRound> rounds;
    private int humanTotalScore;
    private int computerTotalScore;
    private String currentGameMode = "NEW";


    public Tournament() {
        rounds = new ArrayList<>();
        humanTotalScore = 0;
        computerTotalScore = 0;
    }

    public void addRound(GameRound round) {
        rounds.add(round);
        humanTotalScore += round.getHuman().getScore();
        computerTotalScore += round.getComputer().getScore();
    }

    public String determineWinner() {
        if (humanTotalScore > computerTotalScore) {
            return "Human";
        } else if (computerTotalScore > humanTotalScore) {
            return "Computer";
        } else {
            return "Draw";
        }
    }

    public int getHumanTotalScore() {
        return humanTotalScore;
    }

    public int getComputerTotalScore() {
        return computerTotalScore;
    }

    public String getCurrentGameMode() {
        return currentGameMode;
    }

    public void setCurrentGameMode(String currentGameMode) {
        this.currentGameMode = currentGameMode;
    }
}
