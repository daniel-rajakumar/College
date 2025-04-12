package com.example.canoga.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents the computer player and implements its move strategy.
 */
public class Computer extends Player {

    /**
     * Constructs a Computer player with the specified board.
     *
     * @param board the game board associated with this player
     */
    public Computer(Board board) {
        super(board);
    }

    /**
     * Provides a rationale for the move selected by the computer.
     *
     * @return a string explaining the strategy behind the move
     */
    public String getStrategyExplanation() {
        return "Computer recommends covering squares X and Y for optimal play.";
    }

    /**
     * Implements the computer's move strategy based on the dice sum.
     * <p>
     * First, it attempts a covering move on the computer's row. If no valid covering move
     * is found, it then attempts an uncovering move on the human's row.
     * <p>
     * The heuristic selects the move combination containing the highest numbered square.
     *
     * @param diceSum the total value of the dice thrown
     * @return true if a move is successfully made; false if no valid move exists
     */
    @Override
    public boolean makeMove(int diceSum) {
        // Attempt a covering move on the computer's row.
        List<Integer> availableCovering = new ArrayList<>();
        boolean[] compSquares = board.getComputerSquares();
        for (int i = 0; i < compSquares.length; i++) {
            if (!compSquares[i]) { // Available if not covered.
                availableCovering.add(i + 1); // Convert 0-indexed to 1-indexed.
            }
        }
        Collections.sort(availableCovering);
        List<List<Integer>> validCoverMoves = new ArrayList<>();
        findCombinations(availableCovering, diceSum, 0, new ArrayList<>(), validCoverMoves);

        if (!validCoverMoves.isEmpty()) {
            List<Integer> bestMove = selectBestMove(validCoverMoves);
            for (Integer square : bestMove) {
                board.coverComputerSquare(square);
            }
            return true;
        }

        // If no covering move exists, attempt an uncovering move on the human's row.
        List<Integer> availableUncovering = new ArrayList<>();
        boolean[] humanSquares = board.getHumanSquares();
        for (int i = 0; i < humanSquares.length; i++) {
            if (humanSquares[i]) { // Available if covered.
                availableUncovering.add(i + 1);
            }
        }
        Collections.sort(availableUncovering);
        List<List<Integer>> validUncoverMoves = new ArrayList<>();
        findCombinations(availableUncovering, diceSum, 0, new ArrayList<>(), validUncoverMoves);

        if (!validUncoverMoves.isEmpty()) {
            List<Integer> bestMove = selectBestMove(validUncoverMoves);
            for (Integer square : bestMove) {
                board.uncoverHumanSquare(square);
            }
            return true;
        }

        // No valid move found.
        return false;
    }

    /**
     * Recursively finds all combinations of numbers from the available list that sum up to the target value.
     *
     * @param available a sorted list of available square numbers
     * @param target    the remaining sum to achieve
     * @param start     the start index in the available list
     * @param current   the current combination being built
     * @param result    the list to store all valid combinations
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
                break;  // No need to continue since the list is sorted.
            }
            current.add(val);
            findCombinations(available, target - val, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    /**
     * Selects the "best" move from the list of valid move combinations.
     * The heuristic is to choose the combination that contains the highest numbered square.
     *
     * @param validMoves a list of valid move combinations
     * @return the selected best move combination
     */
    public List<Integer> selectBestMove(List<List<Integer>> validMoves) {
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
