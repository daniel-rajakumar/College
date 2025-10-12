package com.example.canoga.model;

import java.util.*;

/**
 * Heuristic Computer player:
 *   1) Prefer COVER moves over UNCOVER (if both exist).
 *   2) Within a mode, prefer MORE squares (size 4 > 3 > 2 > 1).
 *   3) Tie-break by HIGHER numbers first (desc lexicographic).
 *   4) Cap combinations to 1..4 squares.
 * Uses Board.applyMove(...) for atomic, validated mutation.
 */
public class Computer extends Player {

    private String lastExplanation = "";

    public Computer(Board board) {
        super(board);
    }

    /** Shown in Help mode after the last move. */
    public String getStrategyExplanation() {
        return lastExplanation == null ? "" : lastExplanation;
    }

    /**
     * Decide and apply a move for the given dice sum.
     * @param diceSum total rolled
     * @return true if a move was applied; false if no legal move exists
     */
    @Override
    public boolean makeMove(int diceSum) {
        // Generate legal candidates for both modes
        List<Move> coverMoves   = enumerateLegalMoves(/*cover*/true,  diceSum);
        List<Move> uncoverMoves = enumerateLegalMoves(/*cover*/false, diceSum);

        // Prefer cover if available; else uncover
        List<Move> pool = !coverMoves.isEmpty() ? coverMoves : uncoverMoves;
        if (pool.isEmpty()) {
            lastExplanation = "No legal move available for " + diceSum + ".";
            return false;
        }

        // Rank: bigger size first, then higher tiles first
        pool.sort(this::compareMoves);
        Move best = pool.get(0);

        // Apply atomically
        board.applyMove(/*isHumanTurn=*/false, best.coverMode, best.squares, diceSum);
//        for (int s : best.squares) {
//            if (best.coverMode) board.coverComputerSquare(s);
//            else board.uncoverHumanSquare(s);
//        }




        // Explain
        lastExplanation = buildExplanation(best, !coverMoves.isEmpty());
        return true;
    }

    // ===== helpers =====

    /** Produce all legal combinations (1..4 squares) summing to diceSum under the given mode. */
    private List<Move> enumerateLegalMoves(boolean coverMode, int diceSum) {
        int n = board.getHumanSquares().length;
        List<Integer> candidates = new ArrayList<>();

        if (coverMode) {
            // Cover the computer row: choose squares that are currently NOT covered on computer row
            boolean[] comp = board.getComputerSquares();
            for (int i = 0; i < n; i++) if (!comp[i]) candidates.add(i + 1);
        } else {
            // Uncover human row: choose squares that ARE currently covered on human row
            boolean[] hum = board.getHumanSquares();
            for (int i = 0; i < n; i++) if (hum[i]) candidates.add(i + 1);
        }

        // sort ascending for pruning; we’ll sort chosen sets desc later for ranking
        Collections.sort(candidates);

        List<Move> out = new ArrayList<>();
        backtrackCombos(candidates, 0, new ArrayList<>(), 0, diceSum, out, coverMode);
        return out;
    }

    /** Backtracking generator: combinations of size ≤ 4 that sum exactly to target. */
    private void backtrackCombos(List<Integer> src, int start, List<Integer> acc, int accSum,
                                 int target, List<Move> out, boolean coverMode) {
        if (accSum == target && !acc.isEmpty() && acc.size() <= 4) {
            List<Integer> copy = new ArrayList<>(acc);
            // Sort DESC for consistent lexicographic ranking (e.g., [9,4] > [8,5])
            copy.sort(Comparator.reverseOrder());
            out.add(new Move(coverMode, copy));
            return;
        }
        if (accSum >= target || acc.size() == 4) return;

        for (int i = start; i < src.size(); i++) {
            int v = src.get(i);
            if (accSum + v > target) break; // ascending src => prune
            acc.add(v);
            backtrackCombos(src, i + 1, acc, accSum + v, target, out, coverMode);
            acc.remove(acc.size() - 1);
        }
    }

    /** Rank by: (1) more squares first, (2) lexicographic by descending values. */
    private int compareMoves(Move a, Move b) {
        if (a.squares.size() != b.squares.size()) {
            return Integer.compare(b.squares.size(), a.squares.size());
        }
        // same size → compare element-wise (they are already desc-sorted)
        for (int i = 0; i < a.squares.size(); i++) {
            int cmp = Integer.compare(b.squares.get(i), a.squares.get(i));
            if (cmp != 0) return cmp;
        }
        return 0;
    }

    private String buildExplanation(Move m, boolean coverWasAvailable) {
        String mode = m.coverMode ? "cover" : "uncover";
        String squares = m.squares.toString();
        String why = m.coverMode
                ? "Covering advances my own row and reduces your uncover path."
                : (coverWasAvailable
                ? "No safe cover existed; uncovering increases your score liability and may stall your path."
                : "Cover unavailable; uncovering is the only legal option.");
        return "Computer chose to " + mode + " " + squares + ". " + why;
    }

    private static class Move {
        final boolean coverMode;
        final List<Integer> squares; // DESC-sorted for ranking
        Move(boolean coverMode, List<Integer> squares) {
            this.coverMode = coverMode;
            this.squares = squares;
        }
    }
}
