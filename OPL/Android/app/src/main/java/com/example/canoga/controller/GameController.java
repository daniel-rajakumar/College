package com.example.canoga.controller;

import com.example.canoga.model.Board;
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
     *
     * @return
     */
//    public void playTurn(int dice) {
//        gameRound.playTurn(dice);
//        boardView.invalidate();
//    }

    public boolean playComputerTurn(int dice) {
//        gameRound.playComputerTurn(dice);
//        boardView.invalidate();
        return gameRound.playComputerTurn(dice);
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
        boolean[] squares;
        if (gameRound.isHumanTurn()) {
            squares = isCovering ? gameRound.getBoard().getHumanSquares()
                    : gameRound.getBoard().getComputerSquares();
        } else {
            squares = isCovering ? gameRound.getBoard().getComputerSquares()
                    : gameRound.getBoard().getHumanSquares();
        }
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

    public boolean isRoundOver() {
        // The round is over if the human's row is completely covered
        // or if the computer's row is completely uncovered.
        return gameRound.getBoard().isHumanComplete() || gameRound.getBoard().isComputerComplete();
    }

    public String getWinner() {
        // According to the game rules, if the human's row is fully covered,
        // then the human wins; if the computer's row is fully uncovered, then the human wins as well.
        // (Alternatively, you might decide different outcomes for computer wins.)
        if (gameRound.getBoard().isHumanComplete()) {
            return "Human";
        } else if (gameRound.getBoard().isComputerComplete()) {
            return "Human";
        } else {
            return "None";
        }
    }

    /**
     * Finishes the current round by calculating the round score based on the win condition,
     * updating the winning player's score, and (optionally) updating tournament scores.
     *
     * @param winner a String indicating the winner ("Human" or "Computer")
     */
    public void finishGame(String winner) {
        Board board = gameRound.getBoard();
        int roundScore = 0;

        // Calculate round score based on the win condition.
        if (winner.equalsIgnoreCase("Human")) {
            if (board.isHumanComplete()) {
                // Human wins by covering all of their own squares.
                // Score is the sum of all the opponent's (computer's) uncovered squares.
                boolean[] compSquares = board.getComputerSquares();
                for (int i = 0; i < compSquares.length; i++) {
                    // For computer squares, false means uncovered.
                    if (!compSquares[i]) {
                        roundScore += (i + 1);  // Squares are 1-indexed.
                    }
                }
            } else if (board.isComputerComplete()) {
                // Human wins by uncovering all of the computer's squares.
                // Score is the sum of all the player's (human's) covered squares.
                boolean[] humanSquares = board.getHumanSquares();
                for (int i = 0; i < humanSquares.length; i++) {
                    // For human squares, true means covered.
                    if (humanSquares[i]) {
                        roundScore += (i + 1);
                    }
                }
            }
            // Update the human player's score.
            gameRound.getHuman().updateScore(roundScore);
        } else if (winner.equalsIgnoreCase("Computer")) {
            if (board.isComputerComplete()) {
                // Computer wins by covering its own squares.
                // Score is the sum of the human's uncovered squares.
                boolean[] humanSquares = board.getHumanSquares();
                for (int i = 0; i < humanSquares.length; i++) {
                    if (!humanSquares[i]) {
                        roundScore += (i + 1);
                    }
                }
            } else if (board.isHumanComplete()) {
                // Computer wins by uncovering all of the human's squares.
                // Score is the sum of the computer's covered squares.
                boolean[] compSquares = board.getComputerSquares();
                for (int i = 0; i < compSquares.length; i++) {
                    if (compSquares[i]) {
                        roundScore += (i + 1);
                    }
                }
            }
            // Update the computer player's score.
            gameRound.getComputer().updateScore(roundScore);
        }

        // Optionally, add this round to the tournament scores.
        // For example, if using a TournamentController:
        // tournamentController.addRound(gameRound);

        // Optionally log or display the round score.
        System.out.println("Round Score: " + roundScore);
    }

    /**
     * Restarts the game by creating a new GameRound with the same board size as the previous round
     * and carries over the players' scores.
     *
     * @param previousRound the GameRound that just finished.
     * @return a new GameRound with the same board configuration and updated player scores.
     */
    public GameRound restartGame(GameRound previousRound) {
        // Retrieve the board size from the previous round.
        int boardSize = previousRound.getBoard().getSize();

        // Create a new round with the same board size.
        GameRound newRound = new GameRound(boardSize);

        // Carry over the player's scores.
        // Since new players start at 0, call updateScore() to add the previous round's score.
        int humanPrevScore = previousRound.getHuman().getScore();
        int computerPrevScore = previousRound.getComputer().getScore();
        newRound.getHuman().updateScore(humanPrevScore);
        newRound.getComputer().updateScore(computerPrevScore);

        // Optionally, decide who should start the new round (if you have a rule for that)
        // For example, you could set the next turn based on the previous round outcome.

        return newRound;
    }
}

