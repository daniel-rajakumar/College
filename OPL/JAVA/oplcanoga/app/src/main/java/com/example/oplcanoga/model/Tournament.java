package com.example.oplcanoga.model;

/**
 * Tracks multiple rounds and computes handicap/advantage for the next round.
 */
public class Tournament {

    private final HumanPlayer human;
    private final ComputerPlayer computer;
    private final Dice dice;
    private final int boardSize;

    private GameRound currentRound;

    // Info from last completed round
    private PlayerId lastRoundWinner;
    private PlayerId lastRoundFirstPlayer;
    private int lastRoundWinningScore;

    public Tournament(int boardSize) {
        if (boardSize < 9 || boardSize > 11) {
            throw new IllegalArgumentException("Board size must be 9, 10, or 11");
        }
        this.boardSize = boardSize;
        this.human = new HumanPlayer(boardSize);
        this.computer = new ComputerPlayer(boardSize);
        this.dice = new Dice();
    }

    public HumanPlayer getHuman() {
        return human;
    }

    public ComputerPlayer getComputer() {
        return computer;
    }

    public Dice getDice() {
        return dice;
    }

    public GameRound getCurrentRound() {
        return currentRound;
    }

    /**
     * Start the first round.
     */
    public void startFirstRound(PlayerId firstPlayer) {
        AdvantageInfo noAdvantage = new AdvantageInfo(null, -1);
        currentRound = new GameRound(human, computer, boardSize, dice, firstPlayer, noAdvantage);
    }

    /**
     * Should be called after currentRound finishes.
     * Stores last round info for handicap calculation.
     */
    public void finishCurrentRound() {
        if (currentRound == null || !currentRound.isOver()) {
            throw new IllegalStateException("Round not finished");
        }
        lastRoundWinner = currentRound.getWinner();
        lastRoundFirstPlayer = currentRound.getFirstPlayer();
        lastRoundWinningScore = currentRound.getWinningScore();
    }

    /**
     * Compute handicap for next round using:
     * - Sum of digits of winning score.
     * - If winner was also first player, advantage goes to opponent, else to winner.
     */
    public AdvantageInfo computeNextRoundAdvantage() {
        if (lastRoundWinner == null) {
            return new AdvantageInfo(null, -1);
        }

        int digitSum = sumDigits(lastRoundWinningScore);
        if (digitSum < 1 || digitSum > boardSize) {
            return new AdvantageInfo(null, -1);
        }

        PlayerId advantaged;
        if (lastRoundWinner == lastRoundFirstPlayer) {
            advantaged = (lastRoundWinner == PlayerId.HUMAN) ? PlayerId.COMPUTER : PlayerId.HUMAN;
        } else {
            advantaged = lastRoundWinner;
        }

        return new AdvantageInfo(advantaged, digitSum);
    }

    public void startNextRound(PlayerId firstPlayer, AdvantageInfo advantageInfo) {
        currentRound = new GameRound(human, computer, boardSize, dice, firstPlayer, advantageInfo);
    }

    /**
     * Determine tournament winner (by score). Returns null if tie.
     */
    public PlayerId getTournamentWinner() {
        if (human.getTournamentScore() > computer.getTournamentScore()) {
            return PlayerId.HUMAN;
        } else if (computer.getTournamentScore() > human.getTournamentScore()) {
            return PlayerId.COMPUTER;
        }
        return null; // tie
    }

    private int sumDigits(int n) {
        n = Math.abs(n);
        int sum = 0;
        while (n > 0) {
            sum += (n % 10);
            n /= 10;
        }
        return sum;
    }
}
