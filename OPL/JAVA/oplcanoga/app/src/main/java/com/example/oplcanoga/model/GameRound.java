package com.example.oplcanoga.model;

import java.util.ArrayList;
import java.util.List;

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

        humanHasMoved = false;
        computerHasMoved = false;
    }

    public void markBothPlayersMoved() {
        this.humanHasMoved = true;
        this.computerHasMoved = true;
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

    public void switchTurn() {
        currentPlayer = (currentPlayer == PlayerId.HUMAN)
                ? PlayerId.COMPUTER
                : PlayerId.HUMAN;
    }

    public int[] rollForCurrentPlayer(int diceCount) {
        return dice.roll(diceCount);
    }

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

    public List<Move> getLegalMoves(PlayerId actorId, MoveType type, int diceTotal) {
        List<Move> result = new ArrayList<>();
        Player actor = getPlayer(actorId);
        Player opp = getOpponent(actorId);

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

    public void forceSetCurrentPlayer(PlayerId id) {
        this.currentPlayer = id;
    }


    public boolean isAdvantageLockActive() {
        return advantageLockActive;
    }

    public PlayerId getAdvantagedPlayer() {
        return (advantageInfo != null) ? advantageInfo.advantagedPlayer : null;
    }

    public int getAdvantageSquare() {
        return (advantageInfo != null) ? advantageInfo.advantageSquare : -1;
    }

    public void markBothPlayersHaveMoved() {
        humanHasMoved = true;
        computerHasMoved = true;
    }

    // Called by Tournament.deserialize so round-end logic works after loading
    public void initMoveFlagsFromPlayers(PlayerId firstPlayer, PlayerId nextPlayer) {
        // Default: no one has moved
        humanHasMoved = false;
        computerHasMoved = false;

        if (firstPlayer == null || nextPlayer == null) {
            return;
        }

        if (nextPlayer == firstPlayer) {
            // Example: First Turn: Computer, Next Turn: Computer
            // => both have completed at least one turn
            humanHasMoved = true;
            computerHasMoved = true;
        } else {
            // Only the first player has completed a turn so far
            if (firstPlayer == PlayerId.HUMAN) {
                humanHasMoved = true;
            } else if (firstPlayer == PlayerId.COMPUTER) {
                computerHasMoved = true;
            }
        }
    }


}
