package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.AdvantageInfo;
import com.example.oplcanoga.model.ComputerPlayer;
import com.example.oplcanoga.model.GameRound;
import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.MoveType;
import com.example.oplcanoga.model.Player;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.Tournament;
import com.example.oplcanoga.model.WinType;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class GameController {

    private final GameView view;

    private Tournament tournament;
    GameRound currentRound;

    private int roundNumber = 0;
    private int lastDiceTotal = 0;
    private boolean waitingForHumanMove = false;

    private List<Move> lastHumanCoverMoves = new ArrayList<>();
    private List<Move> lastHumanUncoverMoves = new ArrayList<>();

    public GameController(GameView view) {
        this.view = view;
    }

    public void startNewTournament(int boardSize, PlayerId firstPlayer) {
        this.tournament = new Tournament(boardSize);
        this.roundNumber = 0;

        startNewRoundInternal(firstPlayer, new AdvantageInfo(null, -1));
    }

    public PlayerId getTournamentWinner() {
        if (tournament == null) return null;
        return tournament.getTournamentWinner();
    }

    public boolean isRoundOver() {
        return currentRound != null && currentRound.isOver();
    }

    public boolean canHumanRollOneDie() {
        if (currentRound == null) return false;
        return currentRound.canRollOneDie(PlayerId.HUMAN);
    }

    public PlayerId getCurrentPlayer() {
        if (currentRound == null) return null;
        return currentRound.getCurrentPlayerId();
    }

    public void onHumanRollDice(int diceCount) {
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }
        if (currentRound.getCurrentPlayerId() != PlayerId.HUMAN) {
            view.showMessage("It's not your turn.");
            return;
        }
        if (diceCount == 1 && !currentRound.canRollOneDie(PlayerId.HUMAN)) {
            view.showMessage("You are not allowed to roll one die yet.");
            return;
        }

        int[] dice = currentRound.rollForCurrentPlayer(diceCount);
        view.showDiceRoll(PlayerId.HUMAN, dice);

        lastDiceTotal = dice[0] + (dice.length > 1 ? dice[1] : 0);

        lastHumanCoverMoves = currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, lastDiceTotal);
        lastHumanUncoverMoves = currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, lastDiceTotal);

        if (lastHumanCoverMoves.isEmpty() && lastHumanUncoverMoves.isEmpty()) {
            view.showMessage("No legal moves. Your turn is over.");
            waitingForHumanMove = false;
            startComputerTurn();
        } else {
            waitingForHumanMove = true;
            view.promptHumanForMove(lastDiceTotal, lastHumanCoverMoves, lastHumanUncoverMoves);
        }

        updateBoardInView();
    }

    public void onHumanManualRoll(int die1, int die2) {
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }
        if (currentRound.getCurrentPlayerId() != PlayerId.HUMAN) {
            view.showMessage("It's not your turn.");
            return;
        }

        int[] dice = new int[]{die1, die2};
        lastDiceTotal = die1 + die2;

        view.showDiceRoll(PlayerId.HUMAN, dice);

        lastHumanCoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, lastDiceTotal);
        lastHumanUncoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, lastDiceTotal);

        if (lastHumanCoverMoves.isEmpty() && lastHumanUncoverMoves.isEmpty()) {
            view.showMessage("No legal moves. Your turn is over.");
            waitingForHumanMove = false;
            startComputerTurn();
        } else {
            waitingForHumanMove = true;
            view.promptHumanForMove(lastDiceTotal, lastHumanCoverMoves, lastHumanUncoverMoves);
        }

        updateBoardInView();
    }

    public void onRollDiceButtonPressed(int diceCount) {
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }

        PlayerId current = currentRound.getCurrentPlayerId();

        if (diceCount == 1 && !currentRound.canRollOneDie(current)) {
            view.showMessage("You are not allowed to roll one die yet.");
            return;
        }

        int[] dice = currentRound.rollForCurrentPlayer(diceCount);
        handleDiceForCurrentPlayer(dice);
    }

    public void onManualDiceButtonPressed(int die1, int die2) {
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }

        PlayerId current = currentRound.getCurrentPlayerId();

        if (die2 == 0) {
            if (!currentRound.canRollOneDie(current)) {
                view.showMessage("You are not allowed to roll one die yet.");
                return;
            }

            int[] dice = new int[]{die1};
            handleDiceForCurrentPlayer(dice);
        } else {
            int[] dice = new int[]{die1, die2};
            handleDiceForCurrentPlayer(dice);
        }
    }

    private void handleDiceForCurrentPlayer(int[] dice) {
        PlayerId current = currentRound.getCurrentPlayerId();

        view.showDiceRoll(current, dice);
        lastDiceTotal = dice[0] + (dice.length > 1 ? dice[1] : 0);

        if (current == PlayerId.HUMAN) {
            handleHumanDiceOutcome();
        } else {
            handleComputerDiceOutcome();
        }
    }

    private void handleHumanDiceOutcome() {
        lastHumanCoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, lastDiceTotal);
        lastHumanUncoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, lastDiceTotal);

        if (lastHumanCoverMoves.isEmpty() && lastHumanUncoverMoves.isEmpty()) {
            waitingForHumanMove = false;
            view.showMessage("No legal moves. Your turn is over.");
            currentRound.switchTurn();
            updateBoardInView();
        } else {
            waitingForHumanMove = true;
            view.promptHumanForMove(lastDiceTotal, lastHumanCoverMoves, lastHumanUncoverMoves);
            updateBoardInView();
        }
    }

    private void handleComputerDiceOutcome() {
        List<Move> coverMoves =
                currentRound.getLegalMoves(PlayerId.COMPUTER, MoveType.COVER, lastDiceTotal);
        List<Move> uncoverMoves =
                currentRound.getLegalMoves(PlayerId.COMPUTER, MoveType.UNCOVER, lastDiceTotal);

        if (coverMoves.isEmpty() && uncoverMoves.isEmpty()) {
            view.showMessage("Computer has no legal moves. Your turn.");
            currentRound.switchTurn();
            updateBoardInView();
            return;
        }

        ComputerPlayer computer = tournament.getComputer();
        Move chosen = computer.chooseMove(coverMoves, uncoverMoves, computer, tournament.getHuman());

        if (chosen == null) {
            view.showMessage("Computer skips (no good move). Your turn.");
            currentRound.switchTurn();
            updateBoardInView();
            return;
        }

        view.showMessage("Computer " + chosen.getType() +
                "s squares " + chosen.getSquares() +
                " (total " + chosen.getDiceTotal() + ")");

        currentRound.applyMove(chosen);
        updateBoardInView();

        if (currentRound.isOver()) {
            onRoundFinished();
        }
    }


    public void onHumanMoveChosen(MoveType type, List<Integer> squares) {
        if (!waitingForHumanMove) {
            view.showMessage("No move is expected right now. Roll dice first.");
            return;
        }
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }
        if (currentRound.getCurrentPlayerId() != PlayerId.HUMAN) {
            view.showMessage("It's not your turn.");
            return;
        }

        Move chosen = findMatchingMove(type, squares);
        if (chosen == null) {
            view.showMessage("Invalid move selection. Please select one of the suggested options.");
            return;
        }

        waitingForHumanMove = false;

        currentRound.applyMove(chosen);
        updateBoardInView();

        if (currentRound.isOver()) {
            onRoundFinished();
        }
    }


    public void onHelpRequested() {
        if (currentRound == null || currentRound.isOver()) {
            view.showMessage("Round is not active.");
            return;
        }
        if (currentRound.getCurrentPlayerId() != PlayerId.HUMAN) {
            view.showMessage("Help is only available on your turn.");
            return;
        }
        if (lastDiceTotal == 0) {
            view.showMessage("Roll the dice first, then ask for help.");
            return;
        }

        if ((lastHumanCoverMoves == null || lastHumanCoverMoves.isEmpty()) &&
                (lastHumanUncoverMoves == null || lastHumanUncoverMoves.isEmpty())) {
            view.showMessage("There are no legal moves this turn.");
            return;
        }

        ComputerPlayer pseudoComputer = new ComputerPlayer(currentRound.getBoardSize());
        Move suggestion = pseudoComputer.chooseMove(lastHumanCoverMoves, lastHumanUncoverMoves, tournament.getHuman(), tournament.getComputer());

        if (suggestion == null) {
            view.showMessage("No good move available.");
        } else {
            StringBuilder reason = new StringBuilder();

            if (suggestion.getType() == MoveType.COVER) {
                // If this move makes the human win instantly
                int humanUncoveredCount = 0;
                Player human = tournament.getHuman();
                for (int i=1; i<=human.getBoardSize(); i++) {
                    if (!human.isCovered(i)) humanUncoveredCount++;
                }
                if (suggestion.getSquareCount() == humanUncoveredCount) {
                    reason.append(" This move will let you win the round immediately!");
                } else {
                    reason.append("I chose a COVER move because covering more of your own squares ")
                            .append("reduces your opponent's chances to score at the end.");
                }

            } else if (suggestion.getType() == MoveType.UNCOVER) {
                // If this move makes the human win instantly
                int computerCoveredCount = 0;
                Player comp = tournament.getComputer();
                for (int i=1; i<=comp.getBoardSize(); i++) {
                    if (comp.isCovered(i)) computerCoveredCount++;
                }
                if (suggestion.getSquareCount() == computerCoveredCount) {
                    reason.append(" This move will let you win the round immediately!");
                } else {
                    reason.append("I chose an UNCOVER move because removing your opponent's covered squares ")
                            .append("makes it harder for them to win by covering all of theirs.");
                }
            }

            if (reason.length() == 0) { // If no special reason added yet
                reason.append(" This move uses ").append(suggestion.getSquares().size())
                        .append(" square(s), and I prefer moves that use more squares and higher numbers ")
                        .append("to maximize impact from this roll.");
            }

            view.showMessage("Suggestion: " + suggestion.getType() +
                    " squares " + suggestion.getSquares() +
                    " (total " + suggestion.getDiceTotal() + "). " +
                    reason.toString());
        }

    }

    public void startNextRoundAuto() {
        if (tournament == null) {
            view.showMessage("No tournament in progress.");
            return;
        }
        if (currentRound == null || !currentRound.isOver()) {
            view.showMessage("Current round has not finished yet.");
            return;
        }

        tournament.finishCurrentRound();

        AdvantageInfo advantage = tournament.computeNextRoundAdvantage();

        PlayerId previousFirst = currentRound.getFirstPlayer();
        PlayerId nextFirst =
                (previousFirst == PlayerId.HUMAN) ? PlayerId.COMPUTER : PlayerId.HUMAN;

        startNewRoundInternal(nextFirst, advantage);
    }

    public int getHumanTotalScore() {
        return (tournament != null) ? tournament.getHuman().getTournamentScore() : 0;
    }

    public int getComputerTotalScore() {
        return (tournament != null) ? tournament.getComputer().getTournamentScore() : 0;
    }


    private void startNewRoundInternal(PlayerId firstPlayer, AdvantageInfo advantageInfo) {
        roundNumber++;
        tournament.startNextRound(firstPlayer, advantageInfo);
        currentRound = tournament.getCurrentRound();

        lastDiceTotal = 0;
        waitingForHumanMove = false;
        lastHumanCoverMoves.clear();
        lastHumanUncoverMoves.clear();

        view.showMessage("Starting round " + roundNumber +
                ". First player: " + firstPlayer +
                (advantageInfo != null && advantageInfo.advantagedPlayer != null
                        ? " | Advantage: " + advantageInfo.advantagedPlayer +
                        " on square " + advantageInfo.advantageSquare
                        : ""));

        updateBoardInView();

    }

    private void startComputerTurn() {
        if (currentRound == null || currentRound.isOver()) {
            return;
        }
        if (currentRound.getCurrentPlayerId() != PlayerId.COMPUTER) {
            return;
        }

        ComputerPlayer computer = tournament.getComputer();

        while (!currentRound.isOver() &&
                currentRound.getCurrentPlayerId() == PlayerId.COMPUTER) {

            boolean rollOne = computer.decideRollOneDie(currentRound);
            int diceCount = rollOne ? 1 : 2;

            int[] dice = currentRound.rollForCurrentPlayer(diceCount);
            view.showDiceRoll(PlayerId.COMPUTER, dice);

            int diceTotal = dice[0] + (dice.length > 1 ? dice[1] : 0);

            List<Move> coverMoves =
                    currentRound.getLegalMoves(PlayerId.COMPUTER, MoveType.COVER, diceTotal);
            List<Move> uncoverMoves =
                    currentRound.getLegalMoves(PlayerId.COMPUTER, MoveType.UNCOVER, diceTotal);

            if (coverMoves.isEmpty() && uncoverMoves.isEmpty()) {
                view.showMessage("Computer has no legal moves. Its turn ends.");
                break;
            }

            Move chosen = computer.chooseMove(coverMoves, uncoverMoves, computer, tournament.getHuman());
            if (chosen == null) {
                view.showMessage("Computer skips (no good move).");
                break;
            }

            view.showMessage("Computer " + chosen.getType() +
                    "s squares " + chosen.getSquares() +
                    " (total " + chosen.getDiceTotal() + ")");
            currentRound.applyMove(chosen);
            updateBoardInView();
        }

        if (currentRound.isOver()) {
            onRoundFinished();
        }
    }

    private void onRoundFinished() {
        PlayerId winner = currentRound.getWinner();
        WinType winType = currentRound.getWinType();
        int winningScore = currentRound.getWinningScore();

        int humanTotal = tournament.getHuman().getTournamentScore();
        int computerTotal = tournament.getComputer().getTournamentScore();

        view.onRoundEnded(winner, winType, winningScore, humanTotal, computerTotal);
    }

    private void updateBoardInView() {
        if (currentRound == null) return;

        Player human = tournament.getHuman();
        Player computer = tournament.getComputer();

        int[] humanSquares = human.getSquaresCopy();
        int[] computerSquares = computer.getSquaresCopy();

        BoardState state = new BoardState(
                humanSquares,
                computerSquares,
                human.getTournamentScore(),
                computer.getTournamentScore(),
                currentRound.getBoardSize(),
                currentRound.getCurrentPlayerId(),
                currentRound.isOver(),
                currentRound.getWinner(),
                currentRound.isAdvantageLockActive(),
                currentRound.getAdvantagedPlayer(),
                currentRound.getAdvantageSquare()
        );

        view.updateBoard(state);
    }

    private Move findMatchingMove(MoveType type, List<Integer> squares) {
        Set<Integer> requestSet = new HashSet<>(squares);
        List<Move> source =
                (type == MoveType.COVER) ? lastHumanCoverMoves : lastHumanUncoverMoves;

        for (Move m : source) {
            Set<Integer> ms = new HashSet<>(m.getSquares());
            if (ms.equals(requestSet)) {
                return m;
            }
        }
        return null;
    }

    public int getBoardSize() {
        return tournament != null ? tournament.getBoardSize() : 9;
    }

    public String exportState() {
        if (tournament == null) {
            throw new IllegalStateException("No tournament to save.");
        }

        return tournament.serialize();
    }

    public void importState(String serialized) {
        this.tournament = Tournament.deserialize(serialized);

        this.currentRound = tournament.getCurrentRound();
        this.roundNumber = 1;

        lastDiceTotal = 0;
        waitingForHumanMove = false;
        lastHumanCoverMoves.clear();
        lastHumanUncoverMoves.clear();

        updateBoardInView();
    }


    public PlayerId rollForFirstPlayer() {
        if (tournament == null) {
            view.showMessage("No tournament in progress.");
            return null;
        }

        int[] humanRoll;
        int[] computerRoll;
        int humanTotal;
        int computerTotal;

        do {
            humanRoll = tournament.getDice().roll(2);
            computerRoll = tournament.getDice().roll(2);
            humanTotal = humanRoll[0] + humanRoll[1];
            computerTotal = computerRoll[0] + computerRoll[1];

            view.showDiceRoll(PlayerId.HUMAN, humanRoll);
            view.showDiceRoll(PlayerId.COMPUTER, computerRoll);
            view.showMessage("Roll for first player: Human = " + humanTotal +
                    ", Computer = " + computerTotal);
        } while (humanTotal == computerTotal);

        PlayerId first = (humanTotal > computerTotal) ? PlayerId.HUMAN : PlayerId.COMPUTER;
        view.showMessage("First player (by dice): " + first);
        return first;
    }

    public void startNextRoundWithBoardSize(int newBoardSize) {
        if (tournament == null) {
            view.showMessage("No tournament in progress.");
            return;
        }
        if (currentRound == null || !currentRound.isOver()) {
            view.showMessage("Current round has not finished yet.");
            return;
        }

        tournament.finishCurrentRound();

        AdvantageInfo advantage = tournament.computeNextRoundAdvantage();

        PlayerId nextFirst = rollForFirstPlayer();
        if (nextFirst == null) {
            return;
        }

        roundNumber++;
        tournament.startNextRoundWithBoardSize(newBoardSize, nextFirst, advantage);
        currentRound = tournament.getCurrentRound();

        lastDiceTotal = 0;
        waitingForHumanMove = false;
        lastHumanCoverMoves.clear();
        lastHumanUncoverMoves.clear();

        view.showMessage("Starting round " + roundNumber +
                " with board size " + newBoardSize +
                ". First player: " + nextFirst +
                (advantage != null && advantage.advantagedPlayer != null
                        ? " | Advantage: " + advantage.advantagedPlayer +
                        " on square " + advantage.advantageSquare
                        : ""));

        updateBoardInView();
    }


    public void startNextRoundFromSetup(int newBoardSize, PlayerId firstPlayer) {
        if (tournament == null) {
            view.showMessage("No tournament in progress.");
            return;
        }
        if (currentRound == null || !currentRound.isOver()) {
            view.showMessage("Current round has not finished yet.");
            return;
        }

        tournament.finishCurrentRound();

        AdvantageInfo advantage = tournament.computeNextRoundAdvantage();

        roundNumber++;
        tournament.startNextRoundWithBoardSize(newBoardSize, firstPlayer, advantage);
        currentRound = tournament.getCurrentRound();

        lastDiceTotal = 0;
        waitingForHumanMove = false;
        lastHumanCoverMoves.clear();
        lastHumanUncoverMoves.clear();

        view.showMessage("Starting round " + roundNumber +
                " with board size " + newBoardSize +
                ". First player: " + firstPlayer +
                (advantage != null && advantage.advantagedPlayer != null
                        ? " | Advantage: " + advantage.advantagedPlayer +
                        " on square " + advantage.advantageSquare
                        : ""));

        updateBoardInView();
    }

}
