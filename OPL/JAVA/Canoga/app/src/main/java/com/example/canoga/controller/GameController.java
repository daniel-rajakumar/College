package com.example.canoga.controller;

import com.example.canoga.model.Board;
import com.example.canoga.model.GameRound;
import com.example.canoga.view.BoardView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Controls game logic for a single game round.
 * <p>
 * This controller handles turn execution (for the computer player), move validation,
 * move combination generation via backtracking, move evaluation, and game round finalization.
 * It communicates with the BoardView to update the UI.
 */
public class GameController {
    private GameRound gameRound;
    private BoardView boardView;


    /**
     * Constructs the GameController with the provided game round and board view.
     *
     * @param gameRound the current game round.
     * @param boardView the view responsible for displaying the board.
     */
    public GameController(GameRound gameRound, BoardView boardView) {
        this.gameRound = gameRound;
        this.boardView = boardView;
        boardView.setBoard(gameRound.getBoard());
    }

    /**
     * Executes the computer's turn using its complete move strategy.
     * <p>
     * It determines the best move along with an explanation, executes the move,
     * and then redraws the board.
     *
     * @param dice the sum of the dice roll.
     * @return true if the computer's turn was executed successfully; false otherwise.
     */
    public boolean playComputerTurnWithStrategy(int dice) {
        String strategyMove = getComputerStrategyMove(dice);
        if (strategyMove.equals("No valid moves")) {
            System.out.println("Computer has no valid moves for dice roll " + dice + ".");
        } else {
            // The strategyMove format is "Cover:2, 4" or "Uncover:3, 1"
            String[] parts = strategyMove.split(":", 2);
            String moveType = parts[0];
            String moveDigits = parts[1];
            String explanation = getExplanation(moveDigits, moveType.equals("Cover"));
            System.out.println("Computer decides to " + (moveType.equals("Cover") ? "cover" : "uncover") +
                    " using move: " + moveDigits);
            System.out.println("Explanation: " + explanation);
        }
        // Execute the move and refresh the board view.
        boolean turnResult = gameRound.playComputerTurn(dice);
        boardView.invalidate();
        return turnResult;
    }

    /**
     * Returns a serialized representation of the current game state.
     *
     * @return the serialized game state as a String.
     */
    public String getSerializedGameState() {
        return gameRound.serialize();
    }

    /**
     * Calculates the valid move combinations based on the dice sum and move type.
     * <p>
     * For covering moves, squares that are not covered are considered;
     * for uncovering moves, squares that are covered are considered.
     *
     * @param diceSum    the sum of the dice.
     * @param isCovering true if evaluating covering moves; false for uncovering.
     * @return a list of valid move combinations represented as strings.
     */
    public List<String> calculateValidMoves(int diceSum, boolean isCovering) {
        // Determine available squares based on current turn and move type.
        boolean[] squares;
        if (gameRound.isHumanTurn()) {
            squares = isCovering ? gameRound.getBoard().getHumanSquares() :
                                   gameRound.getBoard().getComputerSquares();
        } else {
            squares = isCovering ? gameRound.getBoard().getComputerSquares() :
                                   gameRound.getBoard().getHumanSquares();
        }
        List<Integer> availableSquares = new ArrayList<>();
        for (int i = 0; i < squares.length; i++) {
            // For covering moves: square available if not covered.
            // For uncovering moves: square available if covered.
            if (isCovering && !squares[i]) {
                availableSquares.add(i + 1); // Using 1-indexed numbering.
            } else if (!isCovering && squares[i]) {
                availableSquares.add(i + 1);
            }
        }
        Collections.sort(availableSquares);

        // Generate valid move combinations using backtracking.
        List<List<Integer>> validMoves = new ArrayList<>();
        findCombinations(availableSquares, diceSum, 0, new ArrayList<>(), validMoves);

        // Convert each move combination to a comma-separated string.
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

        // Provide a placeholder if no valid moves exist.
        if (moveOptions.isEmpty()) {
            moveOptions.add("No valid moves");
        }
        return moveOptions;
    }

    /**
     * Uses backtracking to find all combinations of available squares that sum up to the target value.
     *
     * @param availableSquares the list of available squares (1-indexed).
     * @param target           the remaining sum to match.
     * @param start            the starting index in availableSquares.
     * @param current          the current combination being built.
     * @param result           the list to store all valid combinations.
     */
    private void findCombinations(List<Integer> availableSquares, int target, int start,
                                  List<Integer> current, List<List<Integer>> result) {
        if (target == 0) {
            if (!current.isEmpty() && current.size() <= 4) result.add(new ArrayList<>(current));
            return;
        }
        if (current.size() == 4) return; // prune: max 4 tiles
        for (int i = start; i < availableSquares.size(); i++) {
            int val = availableSquares.get(i);
            if (val > target) break; // list is sorted
            current.add(val);
            findCombinations(availableSquares, target - val, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    // --- simulation helpers (no board copies; we revert via API) ---
    private static class SimTouch { // +X = computer covered X, -X = human uncovered X
        int tag;
        SimTouch(int tag) { this.tag = tag; }
    }
    private void simApply(boolean isCovering, List<Integer> move, List<SimTouch> touched) {
        if (isCovering) {
            for (int sq : move) {
                gameRound.getBoard().coverComputerSquare(sq);
                touched.add(new SimTouch(+sq));
            }
        } else {
            for (int sq : move) {
                gameRound.getBoard().uncoverHumanSquare(sq);
                touched.add(new SimTouch(-sq));
            }
        }
    }
    private void simRevert(List<SimTouch> touched) {
        // revert in reverse order just to be neat
        for (int i = touched.size() - 1; i >= 0; i--) {
            int tag = touched.get(i).tag;
            int sq = Math.abs(tag);
            if (tag > 0) {
                gameRound.getBoard().uncoverComputerSquare(sq); // undo cover
            } else {
                gameRound.getBoard().coverHumanSquare(sq);      // undo uncover
            }
        }
        // if your Board tracks counts/flags, nothing else needed because we used the public APIs
    }

    private boolean winsForComputerNow() {
        Board b = gameRound.getBoard();
        // use your guarded complete checks via Board “complete” methods
        return b.isComputerComplete();
    }

    // score from the Computer's point of view (higher = better for Computer)
    private int evaluateBoardAfterMove(List<Integer> move, boolean isCovering) {
        Board b = gameRound.getBoard();
        // immediate terminal checks (should be handled earlier, but safe):
        if (b.isComputerComplete()) return 1_000_000;
        if (b.isHumanComplete())    return -1_000_000;

        int score = 0;

        // 1-die territory: good if computer has it, bad if human has it
        if (sevenToNAllCovered(b.getComputerSquares())) score += 5000;
        if (sevenToNAllCovered(b.getHumanSquares()))    score -= 5000;

        // material: more computer covers, fewer human covers
        score += 10 * coveredCount(b.getComputerSquares());
        score -= 10 * coveredCount(b.getHumanSquares());

        // prefer higher single tile in the chosen move
        score += Collections.max(move);

        // tiny nudge: covering is usually safer than exposing (break ties)
        if (isCovering) score += 5;

        return score;
    }



    /**
     * Checks whether the current round is over.
     * <p>
     * The round is considered over if the human row is completely covered or the computer row is completely uncovered.
     *
     * @return true if the round is over; false otherwise.
     */
    public boolean isRoundOver() {
        return gameRound.getBoard().isHumanComplete() || gameRound.getBoard().isComputerComplete();
    }

    /**
     * Determines the winner for the current round.
     * <p>
     * Returns "Human" if the human row is complete,
     * otherwise it also returns "Human" if the computer row is complete.
     * (Adjust game rules as needed.)
     *
     * @return a String indicating the winner.
     */
    public String getWinner() {
        Board b = gameRound.getBoard();
        if (b.isHumanComplete()) return "Human";
        if (b.isComputerComplete()) return "Computer";
        return "None";
    }

    /**
     * Finishes the current game round by calculating the round score,
     * updating the winning player's score, and returning the round score.
     *
     * @param winner a String indicating the winner ("Human" or "Computer")
     * @return the calculated round score.
     */
    public int finishGame(String winner) {
        Board board = gameRound.getBoard();
        int roundScore = 0;

        if (winner.equalsIgnoreCase("Human")) {
            if (board.isHumanComplete()) {
                // Human won by COVERING own row → score = sum of Computer’s UNcovered squares.
                boolean[] comp = board.getComputerSquares();
                for (int i = 0; i < comp.length; i++) if (!comp[i]) roundScore += (i + 1);
            } else if (board.isComputerComplete()) {
                // Human won by UNcovering Computer’s row → score = sum of Human’s COVERED squares.
                boolean[] hum = board.getHumanSquares();
                for (int i = 0; i < hum.length; i++) if (hum[i]) roundScore += (i + 1);
            }
            gameRound.getHuman().updateScore(roundScore);
        } else if (winner.equalsIgnoreCase("Computer")) {
            if (board.isComputerCoveredAll()) {
                // Computer won by COVERING own row → score = sum of Human’s UNcovered squares.
                boolean[] hum = board.getHumanSquares();
                for (int i = 0; i < hum.length; i++) if (!hum[i]) roundScore += (i + 1);
            } else if (board.isHumanUncoveredAll()) {
                // Computer won by UNcovering Human’s row → score = sum of Computer’s COVERED squares.
                boolean[] comp = board.getComputerSquares();
                for (int i = 0; i < comp.length; i++) if (comp[i]) roundScore += (i + 1);
            }
            gameRound.getComputer().updateScore(roundScore);
        }

        // at the very end, before return roundScore;
        int advSquareNext = digitRoot(roundScore); // 0..9
        Board.AdvantageOwner nextOwner = (advSquareNext == 0) ? Board.AdvantageOwner.NONE
                : ("Human".equalsIgnoreCase(winner) ? Board.AdvantageOwner.HUMAN : Board.AdvantageOwner.COMPUTER);

// stash on GameRound so the UI / restart can read it
        gameRound.setNextRoundAdvantage(nextOwner, advSquareNext);


        return roundScore;
    }


    public GameRound restartGame(GameRound previousRound) {
        int boardSize = previousRound.getBoard().getSize();
        GameRound nextRound = new GameRound(
                boardSize,
                previousRound.getNextAdvantageOwner(),
                previousRound.getNextAdvantageSquare()
        );
        nextRound.getHuman().updateScore(previousRound.getHuman().getScore());
        nextRound.getComputer().updateScore(previousRound.getComputer().getScore());
        return nextRound;
    }




    /**
     * Restarts the game round using the same board size and carries over the players' scores.
     *
     * @param previousRound the finished GameRound.
     * @return a new GameRound with updated player scores.
     */
    // === CLONE & EVAL HELPERS (ADD THESE INSIDE GameController) ===
    private Board cloneBoard(Board src) {
        Board copy = new Board(src.getSize());
        boolean[] hs = src.getHumanSquares();
        boolean[] cs = src.getComputerSquares();
        for (int i = 0; i < hs.length; i++) {
            if (hs[i]) copy.coverHumanSquare(i + 1);
            if (cs[i]) copy.coverComputerSquare(i + 1);
        }
        return copy;
    }

    private boolean isForcedWinOnClone(List<Integer> move, boolean isCovering) {
        Board sim = cloneBoard(gameRound.getBoard());
        if (isCovering) for (int sq : move) sim.coverComputerSquare(sq);
        else            for (int sq : move) sim.uncoverHumanSquare(sq);
        return sim.isComputerComplete();
    }

    private int evalOnClone(List<Integer> move, boolean isCovering) {
        Board sim = cloneBoard(gameRound.getBoard());
        if (isCovering) for (int sq : move) sim.coverComputerSquare(sq);
        else            for (int sq : move) sim.uncoverHumanSquare(sq);
        if (sim.isComputerComplete()) return 1_000_000;
        if (sim.isHumanComplete())    return -1_000_000;
        int score = 0;
        if (sevenToNAllCovered(sim.getComputerSquares())) score += 5000;
        if (sevenToNAllCovered(sim.getHumanSquares()))    score -= 5000;
        score += 10 * coveredCount(sim.getComputerSquares());
        score -= 10 * coveredCount(sim.getHumanSquares());
        score += Collections.max(move);
        if (isCovering) score += 5;
        return score;
    }

    private int coveredCount(boolean[] row) { int c=0; for (boolean v: row) if (v) c++; return c; }
    private boolean sevenToNAllCovered(boolean[] row) { for (int i=6;i<row.length;i++) if(!row[i]) return false; return true; }

    // === REPLACE getBestMove(...) to use the clone helpers ===
    public String getBestMove(List<String> validMoves, boolean isCovering) {
        if (validMoves == null || validMoves.isEmpty() ||
                (validMoves.size() == 1 && "No valid moves".equals(validMoves.get(0)))) {
            return "No valid moves";
        }
        // forced win?
        for (String mvStr : validMoves) {
            if ("No valid moves".equals(mvStr)) continue;
            List<Integer> mv = parseMove(mvStr);
            if (isForcedWinOnClone(mv, isCovering)) return mvStr;
        }
        // best eval
        String bestStr = validMoves.get(0);
        int bestScore = Integer.MIN_VALUE;
        for (String mvStr : validMoves) {
            if ("No valid moves".equals(mvStr)) continue;
            List<Integer> mv = parseMove(mvStr);
            int score = evalOnClone(mv, isCovering);
            if (score > bestScore) { bestScore = score; bestStr = mvStr; }
            else if (score == bestScore) {
                int curMax  = Collections.max(mv);
                int bestMax = Collections.max(parseMove(bestStr));
                if (curMax > bestMax || (curMax == bestMax && mv.size() < parseMove(bestStr).size())) {
                    bestStr = mvStr;
                }
            }
        }
        return bestStr;
    }



    /**
     * Calculates the sum of square values specified in the move string.
     *
     * @param move the move string (e.g., "2, 4").
     * @return the sum of the move's values.
     */
    private int calculateScore(String move) {
        int sum = 0;
        String[] parts = move.split(",\\s*");
        for (String part : parts) {
            try {
                sum += Integer.parseInt(part);
            } catch (NumberFormatException e) {
                // Skip unparsable tokens.
            }
        }
        return sum;
    }

    /**
     * Evaluates a move using a metric based on its sum and the number of squares used.
     * <p>
     * For covering moves, a higher sum (with a slight penalty for many squares) is preferable.
     * For uncovering moves, a lower sum (with fewer squares) is preferable.
     *
     * @param move       the move represented as a list of integers.
     * @param isCovering true if evaluating a covering move; false for uncovering.
     * @return the evaluation metric score.
     */
    private double evaluateMove(List<Integer> move, boolean isCovering) {
        int sum = 0;
        for (int num : move) {
            sum += num;
        }
        int count = move.size();
        if (isCovering) {
            return sum - count * 0.1;
        } else {
            return sum + count * 0.1;
        }
    }

    /**
     * Determines whether the computer should prefer a covering move based on the dice sum.
     * <p>
     * It examines the ratio of uncovered squares in the current player's row.
     *
     * @param diceSum the sum of the dice.
     * @return true if covering is preferred; false otherwise.
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
        return uncoveredRatio > 0.5;
    }

    /**
     * Provides an explanation for the chosen best move.
     *
     * @param bestMove   the move string.
     * @param isCovering true if the move is for covering; false for uncovering.
     * @return an explanation string describing the strategic rationale.
     */
    public String getExplanation(String bestMove, boolean isCovering) {
        if (bestMove.equals("No valid moves")) {
            return "No available moves based on the current dice roll.";
        } else {
            if (isCovering) {
                return "Covering squares " + bestMove + " maximizes your score potential and limits opponent options.";
            } else {
                return "Uncovering squares " + bestMove + " minimizes your opponent's scoring opportunities.";
            }
        }
    }

    /**
     * Parses a move string (e.g., "2, 4") into a list of integers.
     *
     * @param move the move string.
     * @return a list of numbers representing the move.
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
     * Determines the computer's strategy move based on valid covering
     * and uncovering moves as well as board heuristics.
     * <p>
     * The returned string indicates the action and move, such as "Cover:2, 4" or "Uncover:3, 1".
     *
     * @param diceSum the sum of the dice.
     * @return the strategy move as a formatted string.
     */
    public String getComputerStrategyMove(int diceSum) {
        List<String> coverMoves = calculateValidMoves(diceSum, true);
        List<String> uncoverMoves = calculateValidMoves(diceSum, false);

        String bestCover = getBestMove(coverMoves, true);
        String bestUncover = getBestMove(uncoverMoves, false);

        double coverScore = bestCover.equals("No valid moves") ? Double.NEGATIVE_INFINITY :
                evaluateMove(parseMove(bestCover), true);
        double uncoverScore = bestUncover.equals("No valid moves") ? Double.POSITIVE_INFINITY :
                evaluateMove(parseMove(bestUncover), false);

        boolean preferCover = shouldCover(diceSum);

        if (preferCover && !bestCover.equals("No valid moves")) {
            return "Cover:" + bestCover;
        } else if (!bestUncover.equals("No valid moves")) {
            return "Uncover:" + bestUncover;
        } else if (!bestCover.equals("No valid moves")) {
            return "Cover:" + bestCover;
        } else {
            return "No valid moves";
        }
    }

    /**
     * Determines whether the computer should roll one die or two dice.
     * <p>
     * If all squares from 7 to n are already covered and fewer than half remain uncovered,
     * a single die roll is recommended.
     *
     * @return 1 if a single die should be rolled; otherwise, 2.
     */
    public int determineDiceRoll() {
        int boardSize = gameRound.getBoard().getSize();
        boolean[] mySquares = gameRound.isHumanTurn() ? gameRound.getBoard().getHumanSquares() :
                                                       gameRound.getBoard().getComputerSquares();
        boolean allCoveredFrom7 = true;
        for (int i = 6; i < boardSize; i++) {
            if (!mySquares[i]) {
                allCoveredFrom7 = false;
                break;
            }
        }
        if (allCoveredFrom7) {
            int uncoveredCount = 0;
            for (boolean square : mySquares) {
                if (!square) uncoveredCount++;
            }
            if (uncoveredCount <= boardSize / 2) {
                return 1;
            } else {
                return 2;
            }
        } else {
            return 2;
        }
    }


    private int digitRoot(int n) {
        n = Math.abs(n);
        int s = 0;
        while (n > 0) { s += n % 10; n /= 10; }
        return (s >= 10) ? digitRoot(s) : s; // single digit 0..9
    }

}
