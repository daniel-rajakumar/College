package com.example.oplcanoga.model;

import java.util.Comparator;
import java.util.List;

/**
 * Represents the computer (AI) player.
 * Contains logic for making decisions about rolling dice and choosing moves.
 */
public class ComputerPlayer extends Player {

    /**
     * Constructs a ComputerPlayer with the specified board size.
     *
     * @param boardSize The number of squares on the player's board.
     */
    public ComputerPlayer(int boardSize) {
        super(PlayerId.COMPUTER, boardSize);
    }

    /**
     * Decides whether to roll one die or two.
     * The strategy is to roll one die whenever allowed (which generally maximizes the chance of covering small numbers needed at the end).
     *
     * @param round The current game round context.
     * @return True to roll one die, false to roll two.
     */
    public boolean decideRollOneDie(GameRound round) {
        return round.canRollOneDie(PlayerId.COMPUTER);
    }

    /**
     * Chooses the best move from the available legal moves.
     * <p>
     * Strategy:
     * 1. If there's a winning move (covers all remaining squares or uncovers all opponent squares), take it.
     * 2. Otherwise, prefer covering moves over uncovering moves.
     * 3. Among the chosen type, maximize the number of squares involved, then the highest square value.
     * </p>
     *
     * @param coverMoves   List of legal moves that cover squares.
     * @param uncoverMoves List of legal moves that uncover squares.
     * @param me           The computer player.
     * @param opponent     The opponent player.
     * @return The chosen Move object, or null if no moves are available.
     */
    public Move chooseMove(List<Move> coverMoves, List<Move> uncoverMoves, Player me, Player opponent) {
        
        // 1. Check for immediate win by covering
        int myUncoveredCount = 0;
        for (int i = 1; i <= me.getBoardSize(); i++) {
            if (!me.isCovered(i)) myUncoveredCount++;
        }
        for (Move m : coverMoves) {
            if (m.getSquareCount() == myUncoveredCount) {
                return m;
            }
        }

        // 2. Check for immediate win by uncovering
        int oppCoveredCount = 0;
        for (int i = 1; i <= opponent.getBoardSize(); i++) {
            if (opponent.isCovered(i)) oppCoveredCount++;
        }
        for (Move m : uncoverMoves) {
            if (m.getSquareCount() == oppCoveredCount) {
                return m;
            }
        }

        // 3. Default strategy: Prefer covering, then maximizing count/value
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
