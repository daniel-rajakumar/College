package com.example.canoga.controller;

import com.example.canoga.model.GameRound;
import com.example.canoga.view.BoardView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class GameController {
    private GameRound gameRound;
    private BoardView boardView;

    /**
     * Constructs the controller with a game round and a view.
     * @param gameRound The current game round.
     * @param boardView The view that displays the board.
     */
    public GameController(GameRound gameRound, BoardView boardView) {
        this.gameRound = gameRound;
        this.boardView = boardView;
        boardView.setBoard(gameRound.getBoard());
    }

    /**
     * Plays one turn and updates the view.
     */
    public void playTurn() {
        gameRound.playTurn();
        boardView.invalidate();
    }

    /**
     * Returns a serialized representation of the game state.
     * @return Serialized game state.
     */
    public String getSerializedGameState() {
        return gameRound.serialize();
    }

    /**
     * Calculates the valid moves based on the dice sum and move type.
     * @param diceSum the sum of the dice.
     * @param isCovering true if the move is for covering the player's own squares; false for uncovering opponent's squares.
     * @return a list of string representations of valid moves.
     */
    public List<String> calculateValidMoves(int diceSum, boolean isCovering) {
        // Get the board squares based on move type:
        // For covering moves, use human squares; for uncovering moves, use computer squares.
        boolean[] squares = isCovering ? gameRound.getBoard().getHumanSquares()
                : gameRound.getBoard().getComputerSquares();
        List<Integer> availableSquares = new ArrayList<>();
        for (int i = 0; i < squares.length; i++) {
            // For covering, the square is available if it is NOT covered (false)
            // For uncovering, available if it IS covered (true)
            if (isCovering && !squares[i]) {
                availableSquares.add(i + 1); // converting to 1-indexed numbering.
            } else if (!isCovering && squares[i]) {
                availableSquares.add(i + 1);
            }
        }
        Collections.sort(availableSquares);

        // Generate valid move combinations using backtracking.
        List<List<Integer>> validMoves = new ArrayList<>();
        findCombinations(availableSquares, diceSum, 0, new ArrayList<>(), validMoves);

        // Convert each move combination into a string (e.g., "2, 4" for a combination [2, 4]).
        List<String> moveOptions = new ArrayList<>();
        for (List<Integer> move : validMoves) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < move.size(); i++) {
                sb.append(move.get(i));
                if (i < move.size() - 1) {
                    sb.append(", ");
                }
            }
            moveOptions.add(sb.toString());
        }

        // If no valid moves exist, provide a placeholder.
        if (moveOptions.isEmpty()) {
            moveOptions.add("No valid moves");
        }

        return moveOptions;
    }

    /**
     * Helper method using backtracking to find all combinations that sum to the target.
     */
    private void findCombinations(List<Integer> availableSquares, int target, int start,
                                  List<Integer> current, List<List<Integer>> result) {
        if (target == 0) {
            result.add(new ArrayList<>(current));
            return;
        }
        for (int i = start; i < availableSquares.size(); i++) {
            int val = availableSquares.get(i);
            if (val > target) {
                // Since the list is sorted, no further values will fit.
                break;
            }
            current.add(val);
            findCombinations(availableSquares, target - val, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }
}
