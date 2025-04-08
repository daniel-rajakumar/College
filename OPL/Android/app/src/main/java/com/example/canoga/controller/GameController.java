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
     * Plays one turn for the computer using the complete strategy,
     * printing out the chosen move and its explanation.
     *
     * @param dice the dice roll sum.
     * @return true if turn executed successfully.
     */
    public boolean playComputerTurnWithStrategy(int dice) {
        String strategyMove = getComputerStrategyMove(dice);
        // Log the decision process with an explanation.
        if (strategyMove.equals("No valid moves")) {
            System.out.println("Computer has no valid moves for dice roll " + dice + ".");
        } else {
            // The strategyMove string is in the format "Cover:2, 4" or "Uncover:3, 1" etc.
            String[] parts = strategyMove.split(":", 2);
            String moveType = parts[0];
            String moveDigits = parts[1];
            String explanation = getExplanation(moveDigits, moveType.equals("Cover"));
            System.out.println("Computer decides to " + (moveType.equals("Cover") ? "cover" : "uncover") +
                    " using move: " + moveDigits);
            System.out.println("Explanation: " + explanation);
        }
        // Execute the move – here we assume gameRound.playComputerTurn(dice) now uses our chosen move.
        boolean turnResult = gameRound.playComputerTurn(dice);
        boardView.invalidate();
        return turnResult;
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

    /**
     * Returns the best move (a string such as "2, 4") among the valid moves based on the evaluation metric.
     * @param validMoves a list of valid move strings.
     * @param isCovering true if evaluating covering moves; false for uncovering.
     * @return the best move as a string.
     */
    public String getBestMove(List<String> validMoves, boolean isCovering) {
        if (validMoves == null || validMoves.isEmpty() ||
                (validMoves.size() == 1 && validMoves.get(0).equals("No valid moves"))) {
            return "No valid moves";
        }
        String bestMove = validMoves.get(0);
        double bestMetric = evaluateMove(parseMove(bestMove), isCovering);
        for (String moveStr : validMoves) {
            List<Integer> moveList = parseMove(moveStr);
            double metric = evaluateMove(moveList, isCovering);
            if (isCovering) {
                // Higher metric is better for covering.
                if (metric > bestMetric) {
                    bestMetric = metric;
                    bestMove = moveStr;
                }
            } else { // For uncovering, lower metric is preferable.
                if (metric < bestMetric) {
                    bestMetric = metric;
                    bestMove = moveStr;
                }
            }
        }
        return bestMove;
    }

    /**
     * Helper method to calculate the sum of squares specified in the move.
     * Expects a move string like "2, 4" and returns 6.
     */
    private int calculateScore(String move) {
        int sum = 0;
        String[] parts = move.split(",\\s*");
        for (String part : parts) {
            try {
                sum += Integer.parseInt(part);
            } catch (NumberFormatException e) {
                // Ignore parts that cannot be parsed as numbers.
            }
        }
        return sum;
    }

    /**
     * Evaluates a move based on its sum and the number of squares used.
     * For covering moves, a higher sum is preferable but moves that use too many squares are slightly penalized.
     * For uncovering moves, a lower sum is preferable, with a slight preference for moves using fewer squares.
     *
     * @param move the move as a list of integers.
     * @param isCovering true for covering moves; false for uncovering.
     * @return a metric score representing the move's desirability.
     */
    private double evaluateMove(List<Integer> move, boolean isCovering) {
        int sum = 0;
        for (int num : move) {
            sum += num;
        }
        int count = move.size();
        if (isCovering) {
            // Reward higher sums but penalize moves that use more squares.
            return sum - count * 0.1;
        } else {
            // For uncovering, a lower sum is desirable (minimizing opponent's benefit) and fewer squares are better.
            return sum + count * 0.1;
        }
    }

    /**
     * Given a dice roll, determines whether the computer should cover its own squares.
     * Here, the ratio of uncovered squares in the computer’s row is examined.
     *
     * @param diceSum the dice sum.
     * @return true if covering is preferred.
     */
    public boolean shouldCover(int diceSum) {
        int boardSize = gameRound.getBoard().getSize();
        boolean[] squares;
        if (gameRound.isHumanTurn()) {
            squares = gameRound.getBoard().getHumanSquares();
        } else {
            squares = gameRound.getBoard().getComputerSquares();
        }
        int uncoveredCount = 0;
        for (boolean square : squares) {
            if (!square) {
                uncoveredCount++;
            }
        }
        double uncoveredRatio = (double) uncoveredCount / boardSize;
        // If more than 50% of the squares are still available, favor covering.
        return uncoveredRatio > 0.5;
    }

    /**
     * Returns an explanation for the chosen best move, based on whether covering or uncovering.
     *
     * @param bestMove the move string.
     * @param isCovering true if the move is for covering.
     * @return an explanation string.
     */
    public String getExplanation(String bestMove, boolean isCovering) {
        if (bestMove.equals("No valid moves")) {
            return "No available moves based on the current dice roll.";
        } else {
            if (isCovering) {
                return "Covering squares " + bestMove + " maximizes your score potential and limits your opponent's options.";
            } else {
                return "Uncovering squares " + bestMove + " minimizes your opponent's scoring opportunities.";
            }
        }
    }

    /**
     * Parses a move string (e.g., "2, 4") into a list of integers.
     *
     * @param move the move string.
     * @return a list of squares involved in the move.
     */
    private List<Integer> parseMove(String move) {
        List<Integer> moveList = new ArrayList<>();
        String[] parts = move.split(",\\s*");
        for (String part : parts) {
            try {
                moveList.add(Integer.parseInt(part));
            } catch (NumberFormatException e) {
                // Skip invalid tokens.
            }
        }
        return moveList;
    }

    /**
     * Determines the complete strategy move for the computer by comparing the best covering and uncovering moves.
     * The return string is in the format "Cover:2, 4" or "Uncover:3, 1" to indicate the desired action and move.
     *
     * @param diceSum the sum of the dice.
     * @return the strategy move as a string.
     */
    public String getComputerStrategyMove(int diceSum) {
        // Generate valid moves for both covering and uncovering.
        List<String> coverMoves = calculateValidMoves(diceSum, true);
        List<String> uncoverMoves = calculateValidMoves(diceSum, false);

        String bestCover = getBestMove(coverMoves, true);
        String bestUncover = getBestMove(uncoverMoves, false);

        // Evaluate the moves; for covering, a higher metric is better; for uncovering, a lower metric is better.
        double coverScore = bestCover.equals("No valid moves") ? Double.NEGATIVE_INFINITY :
                evaluateMove(parseMove(bestCover), true);
        double uncoverScore = bestUncover.equals("No valid moves") ? Double.POSITIVE_INFINITY :
                evaluateMove(parseMove(bestUncover), false);

        // Apply board state heuristic: if many squares are still uncovered then favor covering.
        boolean preferCover = shouldCover(diceSum);

        // Choose move based on preferred strategy and valid move availability.
        if (preferCover && !bestCover.equals("No valid moves")) {
            return "Cover:" + bestCover;
        } else if (!bestUncover.equals("No valid moves")) {
            return "Uncover:" + bestUncover;
        } else if (!bestCover.equals("No valid moves")) {
            // Fallback choice if only covering moves exist.
            return "Cover:" + bestCover;
        } else {
            return "No valid moves";
        }
    }

    /**
     * When allowed, determines whether the computer should roll one die or both dice.
     * If all squares from 7 to n are already covered, the decision is based on how many squares remain.
     *
     * @return 1 if a single die should be rolled; otherwise, 2.
     */
    public int determineDiceRoll() {
        int boardSize = gameRound.getBoard().getSize();
        // Get the current player's squares.
        boolean[] mySquares = gameRound.isHumanTurn() ? gameRound.getBoard().getHumanSquares()
                : gameRound.getBoard().getComputerSquares();
        // Check if all squares 7 through n (indices 6 to boardSize-1) are covered.
        boolean allCoveredFrom7 = true;
        for (int i = 6; i < boardSize; i++) {
            if (!mySquares[i]) {
                allCoveredFrom7 = false;
                break;
            }
        }
        if (allCoveredFrom7) {
            // Count how many squares are still uncovered overall.
            int uncoveredCount = 0;
            for (boolean square : mySquares) {
                if (!square) uncoveredCount++;
            }
            // If fewer squares remain (for example, less than half), opt for a lower-risk single die roll.
            if (uncoveredCount <= boardSize / 2) {
                return 1;
            } else {
                return 2;
            }
        } else {
            return 2;
        }
    }
}
