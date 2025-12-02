package com.example.oplcanoga.model;

import java.util.Comparator;
import java.util.List;

/**
 * Computer player with a very simple strategy:
 * - Prefer COVER over UNCOVER if any cover move exists.
 * - Among moves, choose the one that:
 *   - uses the most squares,
 *   - and if tie, uses the highest-numbered square.
 */
public class ComputerPlayer extends Player {

    public ComputerPlayer(int boardSize) {
        super(PlayerId.COMPUTER, boardSize);
    }

    /**
     * Decide whether to roll one die (if allowed).
     * For now: if allowed (7..n covered), return true; else false.
     */
    public boolean decideRollOneDie(GameRound round) {
        return round.canRollOneDie(PlayerId.COMPUTER);
    }

    /**
     * Choose a move, given all legal COVER and UNCOVER moves.
     */
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
