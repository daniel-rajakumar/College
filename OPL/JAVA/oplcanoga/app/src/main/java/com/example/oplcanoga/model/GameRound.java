package com.example.oplcanoga.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the state and logic of a single round of Canoga.
 * Handles player turns, move validation, board updates, and determining the round winner.
 */
public class GameRound {

    private final HumanPlayer human;
    private final ComputerPlayer computer;
    private final Dice dice;
    private final int boardSize;

    private final PlayerId firstPlayer;
    private PlayerId currentPlayer;

    private boolean isOver;
    private PlayerId winner;
    private WinType winType;
    private int winningScore;

    private final AdvantageInfo advantageInfo;
    private boolean advantageLockActive;

    private boolean humanHasMoved = false;
    private boolean computerHasMoved = false;

    /**
     * Initializes a new game round.
     *
     * @param human         The human player instance.
     * @param computer      The computer player instance.
     * @param boardSize     The size of the game board (number of squares).
     * @param dice          The dice instance to be used.
     * @param firstPlayer   The player who moves first.
     * @param advantageInfo Information about any handicap/advantage for this round.
     */
    public GameRound(HumanPlayer human,
                     ComputerPlayer computer,
                     int boardSize,
                     Dice dice,
                     PlayerId firstPlayer,
                     AdvantageInfo advantageInfo) {
        this.human = human;
        this.computer = computer;
        this.boardSize = boardSize;
        this.dice = dice;
        this.firstPlayer = firstPlayer;
        this.currentPlayer = firstPlayer;
        this.advantageInfo = advantageInfo;
        this.isOver = false;
        this.winner = null;
        this.winType = null;
        this.winningScore = 0;

        initBoardsForRound();
    }

    /**
     * Resets player boards and applies any advantage (covered square) settings.
     */
    private void initBoardsForRound() {
        Integer humanAdvSquare = null;
        Integer compAdvSquare = null;

        if (advantageInfo != null && advantageInfo.advantagedPlayer != null &&
                advantageInfo.advantageSquare >= 1 && advantageInfo.advantageSquare <= boardSize) {

            if (advantageInfo.advantagedPlayer == PlayerId.HUMAN) {
                humanAdvSquare = advantageInfo.advantageSquare;
            } else {
                compAdvSquare = advantageInfo.advantageSquare;
            }
            advantageLockActive = true;
        } else {
            advantageLockActive = false;
        }

        human.resetBoard(humanAdvSquare);
        computer.resetBoard(compAdvSquare);

        humanHasMoved = false;
        computerHasMoved = false;
    }

    /**
     * Marks that both players have made at least one move.
     * This is sometimes necessary to satisfy win conditions that require both players to have played.
     */
    public void markBothPlayersMoved() {
        this.humanHasMoved = true;
        this.computerHasMoved = true;
    }

    /**
     * Gets the human player.
     *
     * @return The HumanPlayer instance.
     */
    public HumanPlayer getHuman() {
        return human;
    }

    /**
     * Gets the computer player.
     *
     * @return The ComputerPlayer instance.
     */
    public ComputerPlayer getComputer() {
        return computer;
    }

    /**
     * Gets the ID of the player whose turn it currently is.
     *
     * @return The current PlayerId.
     */
    public PlayerId getCurrentPlayerId() {
        return currentPlayer;
    }

    /**
     * Gets the ID of the player who went first in this round.
     *
     * @return The PlayerId of the first player.
     */
    public PlayerId getFirstPlayer() {
        return firstPlayer;
    }

    /**
     * Checks if the round is over.
     *
     * @return True if the round has ended, false otherwise.
     */
    public boolean isOver() {
        return isOver;
    }

    /**
     * Gets the winner of the round, if any.
     *
     * @return The PlayerId of the winner, or null if the round is not over.
     */
    public PlayerId getWinner() {
        return winner;
    }

    /**
     * Gets the type of win (COVER or UNCOVER).
     *
     * @return The WinType, or null if the round is not over.
     */
    public WinType getWinType() {
        return winType;
    }

    /**
     * Gets the score awarded to the winner of the round.
     *
     * @return The winning score.
     */
    public int getWinningScore() {
        return winningScore;
    }

    /**
     * Gets the board size for this round.
     *
     * @return The number of squares.
     */
    public int getBoardSize() {
        return boardSize;
    }

    /**
     * Gets the dice instance used in this round.
     *
     * @return The Dice object.
     */
    public Dice getDice() {
        return dice;
    }

    /**
     * Retrieves the player object corresponding to the given ID.
     *
     * @param id The PlayerId.
     * @return The corresponding Player object.
     */
    public Player getPlayer(PlayerId id) {
        return (id == PlayerId.HUMAN) ? human : computer;
    }

    /**
     * Retrieves the opponent of the player with the given ID.
     *
     * @param id The PlayerId.
     * @return The opponent's Player object.
     */
    public Player getOpponent(PlayerId id) {
        return (id == PlayerId.HUMAN) ? computer : human;
    }

    /**
     * Switches the turn to the other player.
     */
    public void switchTurn() {
        currentPlayer = (currentPlayer == PlayerId.HUMAN)
                ? PlayerId.COMPUTER
                : PlayerId.HUMAN;
    }

    /**
     * Rolls the dice for the current player.
     *
     * @param diceCount The number of dice to roll.
     * @return An array of dice values.
     */
    public int[] rollForCurrentPlayer(int diceCount) {
        return dice.roll(diceCount);
    }

    /**
     * Checks if a player is allowed to roll only one die.
     * This is allowed if the squares 7 through boardSize are all covered.
     *
     * @param playerId The ID of the player checking eligibility.
     * @return True if the player can roll one die, false otherwise.
     */
    public boolean canRollOneDie(PlayerId playerId) {
        Player p = getPlayer(playerId);
        if (boardSize < 7) return true;

        for (int i = 7; i <= boardSize; i++) {
            if (!p.isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generates all legal moves for a given player, move type, and dice total.
     *
     * @param actorId   The player attempting to move.
     * @param type      The type of move (COVER or UNCOVER).
     * @param diceTotal The total value rolled on the dice.
     * @return A list of valid Move objects.
     */
    public List<Move> getLegalMoves(PlayerId actorId, MoveType type, int diceTotal) {
        List<Move> result = new ArrayList<>();
        Player actor = getPlayer(actorId);
        Player opp = getOpponent(actorId);

        List<Integer> current = new ArrayList<>();
        backtrackSquares(1, diceTotal, current, result, actor, opp, type);

        return result;
    }

    /**
     * Recursive helper to find combinations of squares that sum to the remaining value.
     */
    private void backtrackSquares(int start,
                                  int remaining,
                                  List<Integer> current,
                                  List<Move> moves,
                                  Player actor,
                                  Player opp,
                                  MoveType type) {
        if (remaining == 0 && !current.isEmpty()) {
            if (isCombinationValid(current, actor, opp, type)) {
                int sum = 0;
                for (int s : current) sum += s;
                moves.add(new Move(actor.getId(), type, sum, current));
            }
            return;
        }

        if (remaining < 0 || current.size() >= 4) {
            return;
        }

        for (int s = start; s <= boardSize; s++) {
            current.add(s);
            backtrackSquares(s + 1, remaining - s, current, moves, actor, opp, type);
            current.remove(current.size() - 1);
        }
    }

    /**
     * Validates if a combination of squares can be used for a move.
     * Checks if squares are available (covered/uncovered) and respects advantage locks.
     */
    private boolean isCombinationValid(List<Integer> squares,
                                       Player actor,
                                       Player opp,
                                       MoveType type) {
        Player target = (type == MoveType.COVER) ? actor : opp;

        for (int s : squares) {
            if (s < 1 || s > boardSize) return false;

            if (type == MoveType.COVER) {
                if (target.isCovered(s)) return false;
            } else {
                if (!target.isCovered(s)) return false;

                if (advantageLockActive &&
                        advantageInfo != null &&
                        advantageInfo.advantagedPlayer == target.getId() &&
                        advantageInfo.advantageSquare == s) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Applies a move to the game state.
     * Updates the board, tracks if players have moved, clears advantage locks, and checks for a win.
     *
     * @param move The move to apply.
     */
    public void applyMove(Move move) {
        if (isOver) return;

        Player actor = getPlayer(move.getActor());
        Player opp = getOpponent(move.getActor());

        if (move.getType() == MoveType.COVER) {
            for (int s : move.getSquares()) {
                actor.coverSquare(s);
            }
        } else {
            for (int s : move.getSquares()) {
                opp.uncoverSquare(s);
            }
        }

        if (move.getActor() == PlayerId.HUMAN) {
            humanHasMoved = true;
        } else if (move.getActor() == PlayerId.COMPUTER) {
            computerHasMoved = true;
        }

        if (advantageLockActive &&
                advantageInfo != null &&
                move.getActor() == advantageInfo.advantagedPlayer) {
            advantageLockActive = false;
        }

        checkForRoundEnd(move.getActor());
    }

    /**
     * Checks if the round has ended after a move.
     * Win conditions are evaluated only if both players have had a chance to move.
     *
     * @param actorId The ID of the player who just moved.
     */
    private void checkForRoundEnd(PlayerId actorId) {
        if (!(humanHasMoved && computerHasMoved)) {
            return;
        }

        Player actor = getPlayer(actorId);
        Player opp = getOpponent(actorId);

        if (actor.allSquaresCovered()) {
            isOver = true;
            winner = actorId;
            winType = WinType.COVER;
            winningScore = opp.sumOfUncoveredSquares();
            actor.addToTournamentScore(winningScore);
        } else if (opp.allSquaresUncovered()) {
            isOver = true;
            winner = actorId;
            winType = WinType.UNCOVER;
            winningScore = actor.sumOfCoveredSquares();
            actor.addToTournamentScore(winningScore);
        }
    }

    /**
     * Forcefully sets the current player.
     * Useful for debugging or specific game states.
     *
     * @param id The PlayerId to set as current.
     */
    public void forceSetCurrentPlayer(PlayerId id) {
        this.currentPlayer = id;
    }


    /**
     * Checks if the advantage lock is currently active.
     * The advantage lock prevents uncovering the advantage square until the advantaged player has moved.
     *
     * @return True if active, false otherwise.
     */
    public boolean isAdvantageLockActive() {
        return advantageLockActive;
    }

    /**
     * Gets the ID of the player who received an advantage this round.
     *
     * @return The PlayerId, or null if no advantage.
     */
    public PlayerId getAdvantagedPlayer() {
        return (advantageInfo != null) ? advantageInfo.advantagedPlayer : null;
    }

    /**
     * Gets the specific square that was covered as an advantage.
     *
     * @return The square number, or -1 if no advantage.
     */
    public int getAdvantageSquare() {
        return (advantageInfo != null) ? advantageInfo.advantageSquare : -1;
    }

    /**
     * Manually marks both players as having moved.
     * Used for resuming games or special initialization.
     */
    public void markBothPlayersHaveMoved() {
        humanHasMoved = true;
        computerHasMoved = true;
    }
}
