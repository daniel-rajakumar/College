package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.MoveType;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.*;

/**
 * Basic tests for GameController using a fake GameView implementation.
 * These don't touch Android at all.
 */
public class GameControllerTest {

    @Test
    public void testStartNewTournamentInitialState() {
        FakeGameView view = new FakeGameView();
        GameController controller = new GameController(view);

        controller.startNewTournament(9, PlayerId.HUMAN);

        assertNotNull("BoardState should be sent to view", view.lastBoardState);
        assertEquals(9, view.lastBoardState.boardSize);
        assertEquals(PlayerId.HUMAN, view.lastBoardState.currentPlayer);
        assertTrue("Should show a message about starting round 1",
                view.messages.stream().anyMatch(m -> m.contains("Starting round 1")));
    }

    @Test
    public void testHumanCannotRollOneDieWhenNotAllowed() {
        FakeGameView view = new FakeGameView();
        GameController controller = new GameController(view);

        controller.startNewTournament(9, PlayerId.HUMAN);

        // At the start, 7..9 are uncovered -> human can't roll 1 die
        controller.onHumanRollDice(1);

        assertEquals("You are not allowed to roll one die yet.",
                view.lastMessage());
    }

    @Test
    public void testHumanMoveChosenBeforeRollIsRejected() {
        FakeGameView view = new FakeGameView();
        GameController controller = new GameController(view);

        controller.startNewTournament(9, PlayerId.HUMAN);

        // Human tries to choose a move without rolling first
        List<Integer> squares = new ArrayList<>();
        squares.add(1);

        controller.onHumanMoveChosen(MoveType.COVER, squares);

        assertEquals("No move is expected right now. Roll dice first.",
                view.lastMessage());
    }

    @Test
    public void testHelpBeforeDiceRollShowsMessage() {
        FakeGameView view = new FakeGameView();
        GameController controller = new GameController(view);

        controller.startNewTournament(9, PlayerId.HUMAN);

        // Ask for help before rolling dice
        controller.onHelpRequested();

        assertEquals("Roll the dice first, then ask for help.",
                view.lastMessage());
    }

    /**
     * Simple "test double" for GameView that just records calls.
     */
    private static class FakeGameView implements GameView {

        BoardState lastBoardState;
        List<String> messages = new ArrayList<>();
        List<int[]> diceRollsHuman = new ArrayList<>();
        List<int[]> diceRollsComputer = new ArrayList<>();

        int promptCount = 0;
        int roundEndedCount = 0;

        @Override
        public void updateBoard(BoardState state) {
            this.lastBoardState = state;
        }

        @Override
        public void showDiceRoll(PlayerId player, int[] dice) {
            if (player == PlayerId.HUMAN) {
                diceRollsHuman.add(dice);
            } else {
                diceRollsComputer.add(dice);
            }
        }

        @Override
        public void showMessage(String message) {
            messages.add(message);
        }

        @Override
        public void promptHumanForMove(int diceTotal,
                                       List<com.example.oplcanoga.model.Move> coverMoves,
                                       List<com.example.oplcanoga.model.Move> uncoverMoves) {
            promptCount++;
            // For controller tests we don't actually choose a move here.
        }

        @Override
        public void onRoundEnded(PlayerId winner,
                                 WinType winType,
                                 int winningScore,
                                 int humanTotalScore,
                                 int computerTotalScore) {
            roundEndedCount++;
        }

        String lastMessage() {
            return messages.isEmpty() ? null : messages.get(messages.size() - 1);
        }
    }
}
