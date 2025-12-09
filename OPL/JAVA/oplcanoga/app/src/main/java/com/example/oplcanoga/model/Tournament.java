package com.example.oplcanoga.model;

public class Tournament {


    private final HumanPlayer human;
    private final ComputerPlayer computer;
    private final Dice dice;

    private int boardSize;

    private GameRound currentRound;

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





    public void startNextRoundWithBoardSize(int newBoardSize,
                                            PlayerId firstPlayer,
                                            AdvantageInfo advantageInfo) {
        if (newBoardSize < 9 || newBoardSize > 11) {
            throw new IllegalArgumentException("Board size must be 9, 10, or 11");
        }

        this.boardSize = newBoardSize;

        human.setBoardSize(newBoardSize);
        computer.setBoardSize(newBoardSize);

        currentRound = new GameRound(human, computer, newBoardSize, dice, firstPlayer, advantageInfo);
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

    public void startFirstRound(PlayerId firstPlayer) {
        AdvantageInfo noAdvantage = new AdvantageInfo(null, -1);
        currentRound = new GameRound(human, computer, boardSize, dice, firstPlayer, noAdvantage);
    }

    public void finishCurrentRound() {
        if (currentRound == null || !currentRound.isOver()) {
            throw new IllegalStateException("Round not finished");
        }
        lastRoundWinner = currentRound.getWinner();
        lastRoundFirstPlayer = currentRound.getFirstPlayer();
        lastRoundWinningScore = currentRound.getWinningScore();
    }

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
        startNextRoundWithBoardSize(this.boardSize, firstPlayer, advantageInfo);
    }


    public PlayerId getTournamentWinner() {
        if (human.getTournamentScore() > computer.getTournamentScore()) {
            return PlayerId.HUMAN;
        } else if (computer.getTournamentScore() > human.getTournamentScore()) {
            return PlayerId.COMPUTER;
        }
        return null;
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

    public int getBoardSize() {
        return boardSize;
    }



    public String serialize() {
        StringBuilder sb = new StringBuilder();

        Player human = getHuman();
        Player computer = getComputer();
        int[] humanSquares = human.getSquaresCopy();
        int[] compSquares = computer.getSquaresCopy();
        int n = boardSize;

        sb.append("Computer:\n");
        sb.append("  Squares:");
        for (int i = 1; i <= n; i++) {
            sb.append(' ').append(compSquares[i]);
        }
        sb.append('\n');
        sb.append("  Score: ").append(computer.getTournamentScore()).append('\n');
        sb.append('\n');

        sb.append("Human:\n");
        sb.append("  Squares:");
        for (int i = 1; i <= n; i++) {
            sb.append(' ').append(humanSquares[i]);
        }
        sb.append('\n');
        sb.append("  Score: ").append(human.getTournamentScore()).append('\n');
        sb.append('\n');

        GameRound round = getCurrentRound();
        if (round != null) {
            sb.append("First Turn: ").append(round.getFirstPlayer().name()).append('\n');
            sb.append("Next Turn: ").append(round.getCurrentPlayerId().name()).append('\n');
        } else {
            sb.append("First Turn: NONE\n");
            sb.append("Next Turn: NONE\n");
        }

        return sb.toString();
    }

    public static Tournament deserialize(String data) {
        String[] lines = data.split("\\R");
        int idx = 0;

        java.util.function.Function<String, Integer> parseIntAfterColon = line -> {
            int colon = line.indexOf(':');
            if (colon < 0) return 0;
            String part = line.substring(colon + 1).trim();
            try {
                return Integer.parseInt(part);
            } catch (NumberFormatException e) {
                return 0;
            }
        };

        java.util.function.Function<String, int[]> parseSquaresLine = line -> {
            int colon = line.indexOf(':');
            if (colon < 0) return new int[0];
            String part = line.substring(colon + 1).trim();
            if (part.isEmpty()) return new int[0];
            String[] tokens = part.split("\\s+");
            int[] arr = new int[tokens.length];
            for (int i = 0; i < tokens.length; i++) {
                try {
                    arr[i] = Integer.parseInt(tokens[i]);
                } catch (NumberFormatException e) {
                    arr[i] = 0;
                }
            }
            return arr;
        };

        java.util.function.Function<String, PlayerId> parsePlayerAfterColon = line -> {
            int colon = line.indexOf(':');
            if (colon < 0) return null;
            String part = line.substring(colon + 1).trim();
            if (part.equalsIgnoreCase("NONE") || part.isEmpty()) return null;
            return PlayerId.valueOf(part.toUpperCase());
        };

        while (idx < lines.length && lines[idx].trim().isEmpty()) idx++;

        if (idx >= lines.length || !lines[idx].trim().startsWith("Computer")) {
            throw new IllegalArgumentException("Invalid save file: missing 'Computer:'");
        }
        idx++;

        String compSquaresLine = lines[idx++].trim();
        int[] compSquaresArr = parseSquaresLine.apply(compSquaresLine);

        String compScoreLine = lines[idx++].trim();
        int compScore = parseIntAfterColon.apply(compScoreLine);

        while (idx < lines.length && lines[idx].trim().isEmpty()) idx++;

        if (idx >= lines.length || !lines[idx].trim().startsWith("Human")) {
            throw new IllegalArgumentException("Invalid save file: missing 'Human:'");
        }
        idx++;

        String humanSquaresLine = lines[idx++].trim();
        int[] humanSquaresArr = parseSquaresLine.apply(humanSquaresLine);

        String humanScoreLine = lines[idx++].trim();
        int humanScore = parseIntAfterColon.apply(humanScoreLine);

        while (idx < lines.length && lines[idx].trim().isEmpty()) idx++;

        PlayerId firstPlayer = null;
        PlayerId nextPlayer = null;

        if (idx < lines.length && lines[idx].trim().startsWith("First Turn")) {
            firstPlayer = parsePlayerAfterColon.apply(lines[idx++].trim());
        }
        if (idx < lines.length && lines[idx].trim().startsWith("Next Turn")) {
            nextPlayer = parsePlayerAfterColon.apply(lines[idx++].trim());
        }

        int boardSize = Math.max(compSquaresArr.length, humanSquaresArr.length);
        if (boardSize == 0) boardSize = 9;

        Tournament t = new Tournament(boardSize);
        Player human = t.getHuman();
        Player computer = t.getComputer();

        if (humanScore != 0) human.addToTournamentScore(humanScore);
        if (compScore != 0) computer.addToTournamentScore(compScore);

        if (firstPlayer != null) {
            AdvantageInfo adv = new AdvantageInfo(null, -1);
            t.startNextRound(firstPlayer, adv);
            GameRound round = t.getCurrentRound();

            for (int i = 1; i <= boardSize; i++) {
                int hVal = (i - 1 < humanSquaresArr.length) ? humanSquaresArr[i - 1] : 0;
                int cVal = (i - 1 < compSquaresArr.length) ? compSquaresArr[i - 1] : 0;

                if (hVal == 0 && !human.isCovered(i)) {
                    human.coverSquare(i);
                } else if (hVal != 0 && human.isCovered(i)) {
                    human.uncoverSquare(i);
                }

                if (cVal == 0 && !computer.isCovered(i)) {
                    computer.coverSquare(i);
                } else if (cVal != 0 && computer.isCovered(i)) {
                    computer.uncoverSquare(i);
                }
            }

            if (nextPlayer != null) {
                round.forceSetCurrentPlayer(nextPlayer);
            }
        }

        return t;
    }















}
