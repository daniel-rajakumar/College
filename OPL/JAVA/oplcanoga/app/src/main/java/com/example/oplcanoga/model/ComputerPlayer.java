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

    public Move chooseMove(List<Move> coverMoves, List<Move> uncoverMoves, Player me, Player opponent) {
        
        int myUncoveredCount = 0;
        for (int i = 1; i <= me.getBoardSize(); i++) {
            if (!me.isCovered(i)) myUncoveredCount++;
        }
        for (Move m : coverMoves) {
            if (m.getSquareCount() == myUncoveredCount) {
                return m;
            }
        }

        int oppCoveredCount = 0;
        for (int i = 1; i <= opponent.getBoardSize(); i++) {
            if (opponent.isCovered(i)) oppCoveredCount++;
        }
        for (Move m : uncoverMoves) {
            if (m.getSquareCount() == oppCoveredCount) {
                return m;
            }
        }

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
