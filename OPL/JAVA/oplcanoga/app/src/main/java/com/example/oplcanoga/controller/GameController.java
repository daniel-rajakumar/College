package com.example.oplcanoga.controller;

import android.os.Bundle;

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

/**
 * Controller class that manages the flow of the Canoga game.
 * It mediates between the Model (Tournament, GameRound) and the View (GameView).
 */
public class GameController {

    private final GameView view;

    private Tournament tournament;
    GameRound currentRound;

    private int roundNumber = 0;
    private int lastDiceTotal = 0;
    private boolean waitingForHumanMove = false;

    private List<Move> lastHumanCoverMoves = new ArrayList<>();
    private List<Move> lastHumanUncoverMoves = new ArrayList<>();

    /**
     * Constructs a new GameController.
     *
     * @param view The interface for updating the UI.
     */
    public GameController(GameView view) {
        this.view = view;
    }

    /**
     * Starts a new tournament with the specified board size and first player.
     *
     * @param boardSize   The size of the board (e.g., 9, 10, 11).
     * @param firstPlayer The player who goes first in the first round.
     */
    public void startNewTournament(int boardSize, PlayerId firstPlayer) {
        this.tournament = new Tournament(boardSize);
        this.roundNumber = 0;

        startNewRoundInternal(firstPlayer, new AdvantageInfo(null, -1));
    }

    /**
     * Returns the winner of the tournament based on total scores.
     *
     * @return The PlayerId of the winner, or null if it's a draw.
     */
    public PlayerId getTournamentWinner() {
        if (tournament == null) return null;
        return tournament.getTournamentWinner();
    }

    /**
     * Checks if the current round is over.
     *
     * @return True if the round is over, false otherwise.
     */
    public boolean isRoundOver() {
        return currentRound != null && currentRound.isOver();
    }

    /**
     * Checks if the human player is allowed to roll a single die.
     * This is typically allowed if squares 7 through N are covered.
     *
     * @return True if the human can roll one die, false otherwise.
     */
    public boolean canHumanRollOneDie() {
        if (currentRound == null) return false;
        return currentRound.canRollOneDie(PlayerId.HUMAN);
    }

    /**
     * Gets the ID of the current player.
     *
     * @return The PlayerId of the current player.
     */
    public PlayerId getCurrentPlayer() {
        if (currentRound == null) return null;
        return currentRound.getCurrentPlayerId();
    }

    /**
     * Handles the human player's request to roll dice.
     *
     * @param diceCount The number of dice to roll (1 or 2).
     */
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

    /**
     * Handles manual dice input for the human player (for testing or manual play).
     *
     * @param die1 The value of the first die.
     * @param die2 The value of the second die (0 if only one die is rolled).
     */
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

    /**
     * Called when the generic "Roll Dice" button is pressed.
     * Dispatches the action to the current player's logic.
     *
     * @param diceCount The number of dice to roll.
     */
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

    /**
     * Called when dice are manually input via the UI dialog.
     *
     * @param die1 Value of the first die.
     * @param die2 Value of the second die (0 if single die).
     */
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

    /**
     * Handles the dice roll for the current player, updating the view and
     * delegating to the appropriate player logic (human or computer).
     *
     * @param dice The array of dice values rolled.
     */
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

    /**
     * Processes the outcome of a human player's dice roll.
     * Determines legal moves and prompts the user or ends the turn if no moves are available.
     */
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

    /**
     * Processes the outcome of a computer player's dice roll.
     * The computer automatically selects and applies a move, or skips its turn if no moves are possible.
     */
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
                " (total " + chosen.getDiceTotal() + ").\n" +
                computer.getLastMoveReason());

        currentRound.applyMove(chosen);
        updateBoardInView();

        if (currentRound.isOver()) {
            onRoundFinished();
        }
    }

    /**
     * Called when the human player selects a move from the list of options.
     *
     * @param type    The type of move (COVER or UNCOVER).
     * @param squares The list of square numbers involved in the move.
     */
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

    /**
     * Called when the human player requests a hint.
     * The computer's strategy is used to suggest a move.
     */
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

        ComputerPlayer tempAi = new ComputerPlayer(currentRound.getBoardSize());
        Move suggestion = tempAi.chooseMove(lastHumanCoverMoves, lastHumanUncoverMoves, tournament.getHuman(), tournament.getComputer());

        if (suggestion == null) {
            view.showMessage("No good move available.");
        } else {
            view.showMessage("Suggestion: " + suggestion.getType() +
                    " squares " + suggestion.getSquares() +
                    " (total " + suggestion.getDiceTotal() + ").\n" +
                    tempAi.getLastMoveReason());
        }

    }

    /**
     * Automatically starts the next round in the tournament flow.
     */
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

    /**
     * Gets the human player's total score in the tournament.
     *
     * @return The score.
     */
    public int getHumanTotalScore() {
        return (tournament != null) ? tournament.getHuman().getTournamentScore() : 0;
    }

    /**
     * Gets the computer player's total score in the tournament.
     *
     * @return The score.
     */
    public int getComputerTotalScore() {
        return (tournament != null) ? tournament.getComputer().getTournamentScore() : 0;
    }

    /**
     * Generates a Bundle with result strings for the final tournament screen.
     *
     * @param winner The winner of the tournament.
     * @return Bundle containing "WINNER_TEXT" and "SUMMARY_TEXT".
     */
    public Bundle getFinalResultStrings(PlayerId winner) {
        Bundle bundle = new Bundle();
        String winnerText;
        String summary;

        if (winner == null) {
            winnerText = "Tournament Result: Draw";
            summary = "Both players ended with the same score.";
        } else {
            winnerText = "Tournament Winner: " + winner.name();
            if (winner == PlayerId.HUMAN) {
                summary = "You outplayed the computer. Nice job!";
            } else {
                summary = "The computer won this time. Try again!";
            }
        }

        bundle.putString("WINNER_TEXT", winnerText);
        bundle.putString("SUMMARY_TEXT", summary);
        return bundle;
    }


    /**
     * Internal method to set up and start a new round.
     *
     * @param firstPlayer   The player who moves first.
     * @param advantageInfo Advantage settings for the round.
     */
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

    /**
     * Manages the computer's turn, executing moves until it's the human's turn or the round ends.
     */
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
                    " (total " + chosen.getDiceTotal() + ").\n" +
                    computer.getLastMoveReason());

            currentRound.applyMove(chosen);
            updateBoardInView();
        }

        if (currentRound.isOver()) {
            onRoundFinished();
        }
    }

    /**
     * Handles the end of a round, calculating scores and notifying the view.
     */
    private void onRoundFinished() {
        PlayerId winner = currentRound.getWinner();
        WinType winType = currentRound.getWinType();
        int winningScore = currentRound.getWinningScore();

        int humanTotal = tournament.getHuman().getTournamentScore();
        int computerTotal = tournament.getComputer().getTournamentScore();

        view.onRoundEnded(winner, winType, winningScore, humanTotal, computerTotal);
    }

    /**
     * Updates the game view with the current board state.
     */
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

    /**
     * Helper method to find a specific move object from a list of squares.
     *
     * @param type    The type of move (COVER/UNCOVER).
     * @param squares The list of square numbers.
     * @return The Move object if found, or null.
     */
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

    /**
     * Gets the board size for the current round.
     *
     * @return The size of the board (e.g., 9, 10, 11).
     */
    public int getBoardSize() {
        return tournament != null ? tournament.getBoardSize() : 9;
    }

    /**
     * Serializes the current game state for saving.
     *
     * @return A string representation of the game state.
     */
    public String exportState() {
        if (tournament == null) {
            throw new IllegalStateException("No tournament to save.");
        }

        return tournament.serialize();
    }

    /**
     * Imports a saved game state from a string.
     *
     * @param serialized The serialized game state string.
     */
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


    /**
     * Rolls dice to determine which player goes first.
     * Rerolls in case of a tie.
     *
     * @return The PlayerId of the first player.
     */
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

    /**
     * Starts the next round of the tournament with a new board size.
     *
     * @param newBoardSize The size of the board for the next round.
     */
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


    /**
     * Starts the next round using parameters from the setup screen.
     *
     * @param newBoardSize The new board size.
     * @param firstPlayer  The player who goes first.
     */
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
