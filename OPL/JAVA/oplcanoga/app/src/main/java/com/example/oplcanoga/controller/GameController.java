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

/**
 * Controller: connects UI (GameView) with Model (Tournament, GameRound, etc.).
 * - No Android imports here.
 * - View = anything that implements GameView (Activity/Fragment).
 */
public class GameController {

    private final GameView view;

    private Tournament tournament;
    GameRound currentRound;   // package-visible for tests if needed

    private int roundNumber = 0;
    private int lastDiceTotal = 0;
    private boolean waitingForHumanMove = false;

    // Cache of last human legal moves (so we can validate the selection)
    private List<Move> lastHumanCoverMoves = new ArrayList<>();
    private List<Move> lastHumanUncoverMoves = new ArrayList<>();

    public GameController(GameView view) {
        this.view = view;
    }

    /**
     * Start a new tournament with a given board size and first player.
     * (You could randomize firstPlayer in the UI and pass it here.)
     */
    public void startNewTournament(int boardSize, PlayerId firstPlayer) {
        this.tournament = new Tournament(boardSize);
        this.roundNumber = 0;

        startNewRoundInternal(firstPlayer, new AdvantageInfo(null, -1));
    }

    /**
     * Ask if tournament has a winner (by total score). Null = tie.
     */
    public PlayerId getTournamentWinner() {
        if (tournament == null) return null;
        return tournament.getTournamentWinner();
    }

    /**
     * Whether current round is over.
     */
    public boolean isRoundOver() {
        return currentRound != null && currentRound.isOver();
    }

    /**
     * Whether the human is allowed to roll one die right now.
     * You can use this to enable/disable the "Roll 1 die" button.
     */
    public boolean canHumanRollOneDie() {
        if (currentRound == null) return false;
        return currentRound.canRollOneDie(PlayerId.HUMAN);
    }

    /**
     * Who's turn is it right now?
     */
    public PlayerId getCurrentPlayer() {
        if (currentRound == null) return null;
        return currentRound.getCurrentPlayerId();
    }

    /**
     * Called by the UI when the human presses "Roll 1 die" or "Roll 2 dice".
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

        // Generate legal moves for human
        lastHumanCoverMoves = currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, lastDiceTotal);
        lastHumanUncoverMoves = currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, lastDiceTotal);

        if (lastHumanCoverMoves.isEmpty() && lastHumanUncoverMoves.isEmpty()) {
            view.showMessage("No legal moves. Your turn is over.");
            waitingForHumanMove = false;
            // turn ends without move; model will switch turn on next apply,
            // but since we didn't apply a move, we manually give control to computer
            startComputerTurn();
        } else {
            waitingForHumanMove = true;
            view.promptHumanForMove(lastDiceTotal, lastHumanCoverMoves, lastHumanUncoverMoves);
        }

        // Push current board state to UI
        updateBoardInView();
    }

    // Add this inside GameController (next to onHumanRollDice)

    /**
     * Human manually selects dice values (e.g., from UI "Input Die").
     * We bypass the model's random rolling and just treat these as the dice rolled.
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

        // Show dice on UI
        view.showDiceRoll(PlayerId.HUMAN, dice);

        // Generate legal moves for this dice total
        lastHumanCoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, lastDiceTotal);
        lastHumanUncoverMoves =
                currentRound.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, lastDiceTotal);

        if (lastHumanCoverMoves.isEmpty() && lastHumanUncoverMoves.isEmpty()) {
            view.showMessage("No legal moves. Your turn is over.");
            waitingForHumanMove = false;
            // No move; give turn to computer
            startComputerTurn();
        } else {
            waitingForHumanMove = true;
            view.promptHumanForMove(lastDiceTotal, lastHumanCoverMoves, lastHumanUncoverMoves);
        }

        updateBoardInView();
    }


    /**
     * Called by UI after human selects a move.
     * The UI should pass the selected MoveType and a list of squares.
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

        // Validate the chosen move against legal moves
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
        } else {
            // Now it's the computer's turn (GameRound.applyMove already switched player)
            startComputerTurn();
        }
    }

    /**
     * Called by UI when human taps "Help".
     * For now we reuse the computer's strategy to suggest a best move for the human.
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

        ComputerPlayer pseudoComputer = new ComputerPlayer(currentRound.getBoardSize());
        // We don't actually use its board, just its strategy method:
        Move suggestion = pseudoComputer.chooseMove(lastHumanCoverMoves, lastHumanUncoverMoves);

        if (suggestion == null) {
            view.showMessage("No good move available.");
        } else {
            view.showMessage("Suggestion: " + suggestion.getType() +
                    " squares " + suggestion.getSquares() +
                    " (total " + suggestion.getDiceTotal() + ")");
        }
    }

    /**
     * UI calls this when the user wants to start the next round.
     * Assumes current round has already finished.
     */
    public void startNextRound(PlayerId firstPlayerForNextRound) {
        if (tournament == null) {
            view.showMessage("No tournament in progress.");
            return;
        }
        if (currentRound == null || !currentRound.isOver()) {
            view.showMessage("Current round has not finished yet.");
            return;
        }

        // Finish current round and compute advantage
        tournament.finishCurrentRound();
        AdvantageInfo advantage = tournament.computeNextRoundAdvantage();

        startNewRoundInternal(firstPlayerForNextRound, advantage);
    }

    // ---------- Internal helpers ----------

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

        // If computer starts, immediately begin its turn
        if (currentRound.getCurrentPlayerId() == PlayerId.COMPUTER) {
            startComputerTurn();
        }
    }

    /**
     * Let the computer automatically play its whole turn:
     * - decide dice (1 or 2)
     * - roll
     * - choose move
     * - apply
     * until no legal move exists or round ends.
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

            Move chosen = computer.chooseMove(coverMoves, uncoverMoves);
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
                currentRound.getWinner()
        );

        view.updateBoard(state);
    }

    /**
     * Given a requested move (type + set of squares), find the matching legal move.
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

    public int getBoardSize() {
        return tournament != null ? tournament.getBoardSize() : 9;
    }
}
