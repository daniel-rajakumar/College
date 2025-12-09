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

    /**
     * Choose the best move.
     * Takes 'me' and 'opponent' to check for immediate winning conditions.
     */
    public Move chooseMove(List<Move> coverMoves, List<Move> uncoverMoves, Player me, Player opponent) {
        
        // 1. Check strict win by covering own squares
        // If a move covers all remaining uncovered squares, it's a win.
        int myUncoveredCount = 0;
        for (int i = 1; i <= me.getBoardSize(); i++) {
            if (!me.isCovered(i)) myUncoveredCount++;
        }
        for (Move m : coverMoves) {
            if (m.getSquareCount() == myUncoveredCount) {
                return m;
            }
        }

        // 2. Check strict win by uncovering opponent squares
        // If a move uncovers all remaining covered squares of opponent, it's a win.
        int oppCoveredCount = 0;
        for (int i = 1; i <= opponent.getBoardSize(); i++) {
            if (opponent.isCovered(i)) oppCoveredCount++;
        }
        for (Move m : uncoverMoves) {
            if (m.getSquareCount() == oppCoveredCount) {
                return m;
            }
        }

        // 3. Fallback Heuristics
        // Prefer Cover > Uncover
        // Then Max Squares
        // Then Max Value
        
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

    // Overload for backward compatibility if needed, though we will update controller.
    public Move chooseMove(List<Move> coverMoves, List<Move> uncoverMoves) {
        // Warning: This version assumes 'this' is the player and we don't know opponent perfectly
        // better to use the 4-arg version.
        // For safety, we just call heuristic part or return null?
        // Let's just forward with 'this' and a dummy opponent or fail? 
        // Better to force compilation error if I forget to update controller.
        // But for now, to avoid breaking if I miss one call, I'll delegate to the heuristic logic directly.
        
        List<Move> candidates = !coverMoves.isEmpty() ? coverMoves : uncoverMoves;
        if (candidates.isEmpty()) return null;
        
        return candidates.stream()
                .max(Comparator
                        .comparingInt(Move::getSquareCount)
                        .thenComparingInt(Move::getHighestSquare))
                .orElse(null);
    }
}
