package com.example.canoga.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents the computer player.
 */
public class Computer extends Player {

    public Computer(Board board) {
        super(board);
    }

    /**
     * Provides a rationale for the move selected by the computer.
     * @return Strategy explanation.
     */
    public String getStrategyExplanation() {
        return "Computer recommends covering squares X and Y for optimal play.";
    }


    /**
     * Implements the computer’s move strategy.
     * The method tries to find valid moves (covering or uncovering) that sum to diceSum.
     * For covering moves, it uses computer's own row; for uncovering moves, it uses human's row.
     * The heuristic selects the combination with the highest valued square.
     *
     * @param diceSum the total value of the dice thrown.
     * @return true if a move is made; false if no valid move exists.
     */
    @Override
    public boolean makeMove(int diceSum) {
        // First try for a covering move on computer's row.
        List<Integer> availableCovering = new ArrayList<>();
        boolean[] compSquares = board.getComputerSquares();
        for (int i = 0; i < compSquares.length; i++) {
            // For covering, a square is available if it is not already covered (false).
            if (!compSquares[i]) {
                availableCovering.add(i + 1); // Convert from 0-indexed to 1-indexed
            }
        }
        // Sort the available squares in ascending order (optional but helps pruning in backtracking).
        Collections.sort(availableCovering);
        List<List<Integer>> validCoverMoves = new ArrayList<>();
        findCombinations(availableCovering, diceSum, 0, new ArrayList<>(), validCoverMoves);

        if (!validCoverMoves.isEmpty()) {
            // Select the best covering move.
            List<Integer> bestMove = selectBestMove(validCoverMoves);
            // Execute the covering move by marking the chosen squares.
            for (Integer square : bestMove) {
                board.coverComputerSquare(square);
            }
            return true;
        }

        // If no covering move exists, try an uncovering move on the human's row.
        List<Integer> availableUncovering = new ArrayList<>();
        boolean[] humanSquares = board.getHumanSquares();
        for (int i = 0; i < humanSquares.length; i++) {
            // For uncovering move, a square is available if it is covered (true).
            if (humanSquares[i]) {
                availableUncovering.add(i + 1); // Convert to 1-indexed
            }
        }
        // Sort the available squares.
        Collections.sort(availableUncovering);
        List<List<Integer>> validUncoverMoves = new ArrayList<>();
        findCombinations(availableUncovering, diceSum, 0, new ArrayList<>(), validUncoverMoves);

        if (!validUncoverMoves.isEmpty()) {
            // Select the best uncover move.
            List<Integer> bestMove = selectBestMove(validUncoverMoves);
            // Execute the uncover move by unmarking the chosen human squares.
            for (Integer square : bestMove) {
                board.uncoverHumanSquare(square);
            }
            return true;
        }

        // If no valid move is found, return false.
        return false;
    }

    /**
     * Backtracking helper method to find all combinations of numbers in 'available'
     * that sum to the target value.
     *
     * @param available a sorted list of available square numbers.
     * @param target    the remaining sum to achieve.
     * @param start     the start index in 'available'.
     * @param current   the current combination.
     * @param result    the list of valid combinations.
     */
    private void findCombinations(List<Integer> available, int target, int start,
                                  List<Integer> current, List<List<Integer>> result) {
        if (target == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < available.size(); i++) {
            int val = available.get(i);
            if (val > target) {
                break;  // As the list is sorted, no need to check further.
            }
            current.add(val);
            findCombinations(available, target - val, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    /**
     * Selects the "best" move from the list of valid moves.
     * The heuristic used here is to pick the combination that contains the highest numbered square.
     *
     * @param validMoves a list of valid move combinations.
     * @return the best move combination.
     */
    private List<Integer> selectBestMove(List<List<Integer>> validMoves) {
        List<Integer> bestMove = validMoves.get(0);
        int bestMax = Collections.max(bestMove);
        for (List<Integer> move : validMoves) {
            int currentMax = Collections.max(move);
            if (currentMax > bestMax) {
                bestMax = currentMax;
                bestMove = move;
            }
        }
        return bestMove;
    }

}
