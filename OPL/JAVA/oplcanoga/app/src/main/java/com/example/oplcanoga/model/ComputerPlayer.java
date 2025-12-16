package com.example.oplcanoga.model;

import java.util.Comparator;
import java.util.List;

/**
 * Represents the computer (AI) player.
 * Contains logic for making decisions about rolling dice and choosing moves.
 */
public class ComputerPlayer extends Player {

    // Helper field to store the reason for the last decision
    private String lastMoveReason = "";

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
     * Retrieves the explanation for the last chosen move.
     *
     * @return A string explaining the strategy behind the last move.
     */
    public String getLastMoveReason() {
        return lastMoveReason;
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
        lastMoveReason = ""; // Reset reason

        // 1. Check for immediate win by covering
        int myUncoveredCount = 0;
        for (int i = 1; i <= me.getBoardSize(); i++) {
            if (!me.isCovered(i)) myUncoveredCount++;
        }
        for (Move m : coverMoves) {
            if (m.getSquareCount() == myUncoveredCount) {
                lastMoveReason = "I can win immediately by covering all my remaining squares!";
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
                lastMoveReason = "I can win immediately by uncovering all of your covered squares!";
                return m;
            }
        }

        // 3. Default strategy: Prefer covering, then maximizing count/value
        List<Move> candidates;
        boolean preferCover = !coverMoves.isEmpty();
        
        if (preferCover) {
            candidates = coverMoves;
        } else {
            candidates = uncoverMoves;
        }

        if (candidates.isEmpty()) {
            lastMoveReason = "No legal moves available.";
            return null;
        }

        Move bestMove = candidates.stream()
                .max(Comparator
                        .comparingInt(Move::getSquareCount)
                        .thenComparingInt(Move::getHighestSquare))
                .orElse(null);
        
        if (bestMove != null) {
            if (preferCover) {
                lastMoveReason = "Strategy: Covering my squares (" + bestMove.getSquares() + ") reduces your potential score. " +
                        "This option covers the most squares or highest values among available moves.";
            } else {
                lastMoveReason = "Strategy: Uncovering your squares (" + bestMove.getSquares() + ") makes it harder for you to win. " +
                        "This option affects the most squares or highest values.";
            }
        }
        
        return bestMove;
    }
}
