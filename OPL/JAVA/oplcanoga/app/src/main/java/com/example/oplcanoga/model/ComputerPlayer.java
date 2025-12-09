package com.example.oplcanoga.model;

import java.util.Comparator;
import java.util.List;

public class ComputerPlayer extends Player {

    public ComputerPlayer(int boardSize) {
        super(PlayerId.COMPUTER, boardSize);
    }

    public boolean decideRollOneDie(GameRound round) {
        return round.canRollOneDie(PlayerId.COMPUTER);
    }

    public Move chooseMove(List<Move> coverMoves, List<Move> uncoverMoves) {
        List<Move> candidates;

        if (!coverMoves.isEmpty()) {
            candidates = coverMoves;
        } else {
            candidates = uncoverMoves;
        }

        if (candidates.isEmpty()) {
            return null;
        }

        return candidates.stream()
                .max(Comparator
                        .comparingInt(Move::getSquareCount)
                        .thenComparingInt(Move::getHighestSquare))
                .orElse(null);
    }
}
