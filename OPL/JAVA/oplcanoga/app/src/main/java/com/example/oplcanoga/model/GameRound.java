package com.example.oplcanoga.model;

import java.util.ArrayList;
import java.util.List;


/**
 * One round of Canoga. Knows about:
 * - two players
 * - board size
 * - whose turn it is
 * - advantage rules (simple version)
 * - winner / score for this round
 */
public class GameRound {

    private final HumanPlayer human;
    private final ComputerPlayer computer;
    private final Dice dice;
    private final int boardSize;

    private PlayerId firstPlayer;
    private PlayerId currentPlayer;

    private boolean isOver;
    private PlayerId winner;
    private WinType winType;
    private int winningScore; // points added to winner's tournamentScore

    // Advantage (handicap) for this round:
    private final AdvantageInfo advantageInfo;
    private boolean advantageLockActive;  // until advantaged player completes first turn

    // NEW: track whether each player has completed at least one turn this round
    private boolean humanHasMoved = false;
    private boolean computerHasMoved = false;

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

        // reset first-turn flags
        humanHasMoved = false;
        computerHasMoved = false;
    }

    public HumanPlayer getHuman() {
        return human;
    }

    public ComputerPlayer getComputer() {
        return computer;
    }

    public PlayerId getCurrentPlayerId() {
        return currentPlayer;
    }

    public PlayerId getFirstPlayer() {
        return firstPlayer;
    }

    public boolean isOver() {
        return isOver;
    }

    public PlayerId getWinner() {
        return winner;
    }

    public WinType getWinType() {
        return winType;
    }

    public int getWinningScore() {
        return winningScore;
    }

    public int getBoardSize() {
        return boardSize;
    }

    public Dice getDice() {
        return dice;
    }

    public Player getPlayer(PlayerId id) {
        return (id == PlayerId.HUMAN) ? human : computer;
    }

    public Player getOpponent(PlayerId id) {
        return (id == PlayerId.HUMAN) ? computer : human;
    }

    /**
     * Roll dice for current player.
     *
     * @param diceCount 1 or 2
     */
    public int[] rollForCurrentPlayer(int diceCount) {
        return dice.roll(diceCount);
    }

    /**
     * Can this player roll one die (7..boardSize covered)?
     */
    public boolean canRollOneDie(PlayerId playerId) {
        Player p = getPlayer(playerId);
        // If boardSize <= 6, there is no 7..n, treat as always false or always true?
        // We'll treat it as "can always roll one die" if boardSize < 7.
        if (boardSize < 7) return true;

        for (int i = 7; i <= boardSize; i++) {
            if (!p.isCovered(i)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generate all legal moves for given actor, move type, and dice total.
     * Restricts combinations to length 1..4.
     */
    public List<Move> getLegalMoves(PlayerId actorId, MoveType type, int diceTotal) {
        List<Move> result = new ArrayList<>();
        Player actor = getPlayer(actorId);
        Player opp = getOpponent(actorId);

        // We'll generate combinations of squares 1..boardSize up to length 4
        List<Integer> current = new ArrayList<>();
        backtrackSquares(1, diceTotal, current, result, actor, opp, type);

        return result;
    }

    private void backtrackSquares(int start,
                                  int remaining,
                                  List<Integer> current,
                                  List<Move> moves,
                                  Player actor,
                                  Player opp,
                                  MoveType type) {
        if (remaining == 0 && !current.isEmpty()) {
            // Validate: squares exist and satisfy covered/uncovered constraints
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

    private boolean isCombinationValid(List<Integer> squares,
                                       Player actor,
                                       Player opp,
                                       MoveType type) {
        Player target = (type == MoveType.COVER) ? actor : opp;

        for (int s : squares) {
            if (s < 1 || s > boardSize) return false;

            if (type == MoveType.COVER) {
                // Must be currently uncovered on actor's row
                if (target.isCovered(s)) return false;
            } else {
                // UNCOVER: must be currently covered on opponent's row
                if (!target.isCovered(s)) return false;

                // If advantage lock is active, cannot uncover the advantage square yet
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
     * Apply a move to the board.
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

        // Mark that this actor has taken at least one turn
        if (move.getActor() == PlayerId.HUMAN) {
            humanHasMoved = true;
        } else if (move.getActor() == PlayerId.COMPUTER) {
            computerHasMoved = true;
        }

        // If this was the advantaged player's first completed turn, unlock advantage
        if (advantageLockActive &&
                advantageInfo != null &&
                move.getActor() == advantageInfo.advantagedPlayer) {
            advantageLockActive = false;
        }

        // Check if round should end (only after both players have moved at least once)
        checkForRoundEnd(move.getActor());

        if (!isOver) {
            // switch turns
            currentPlayer = (currentPlayer == PlayerId.HUMAN)
                    ? PlayerId.COMPUTER
                    : PlayerId.HUMAN;
        }
    }

    private void checkForRoundEnd(PlayerId actorId) {
        // NEW: don't allow the round to end until both players have taken at least one turn
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
}
