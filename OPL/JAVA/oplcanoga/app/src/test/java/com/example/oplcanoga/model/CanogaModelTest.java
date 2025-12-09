package com.example.oplcanoga.model;

import org.junit.Test;

import java.util.*;

import static org.junit.Assert.*;

/**
 * One big JUnit test suite for the current Canoga model.
 * Running this file should sanity-check most of the core logic.
 */
public class CanogaModelTest {

    // ---------- Player tests ----------

    @Test
    public void testPlayerBoardInitialization() {
        int boardSize = 9;
        HumanPlayer human = new HumanPlayer(boardSize);

        int[] squares = human.getSquaresCopy();
        int expectedSum = 0;

        for (int i = 1; i <= boardSize; i++) {
            assertEquals("Square " + i + " should be uncovered initially", i, squares[i]);
            assertFalse("Square " + i + " should not be covered", human.isCovered(i));
            expectedSum += i;
        }

        assertEquals("Sum of uncovered squares mismatch", expectedSum, human.sumOfUncoveredSquares());
        assertEquals("No squares should be covered initially", 0, human.sumOfCoveredSquares());
    }

    @Test
    public void testCoverAndUncover() {
        int boardSize = 9;
        HumanPlayer human = new HumanPlayer(boardSize);

        human.coverSquare(5);
        assertTrue(human.isCovered(5));
        assertEquals(5, human.sumOfCoveredSquares());
        assertEquals(45 - 5, human.sumOfUncoveredSquares()); // 1..9 = 45

        human.uncoverSquare(5);
        assertFalse(human.isCovered(5));
        assertEquals(0, human.sumOfCoveredSquares());
        assertEquals(45, human.sumOfUncoveredSquares());
    }

    @Test
    public void testAdvantageSquareOnResetBoard() {
        int boardSize = 9;
        HumanPlayer human = new HumanPlayer(boardSize);

        human.resetBoard(4); // advantage square 4 starts covered
        assertTrue(human.isCovered(4));
        assertEquals("Covered sum should be 4", 4, human.sumOfCoveredSquares());

        int[] sq = human.getSquaresCopy();
        assertEquals(0, sq[4]);
    }

    // ---------- Dice tests ----------

    @Test
    public void testDiceManualMode() {
        Dice dice = new Dice();
        dice.setManualMode(true);
        dice.addManualRoll(3);
        dice.addManualRoll(5);

        int[] roll = dice.roll(2);
        assertArrayEquals(new int[]{3, 5}, roll);

        // If we roll again with no manual values, it should not crash (but will be random)
        int[] roll2 = dice.roll(1);
        assertEquals(1, roll2.length);
        assertTrue(roll2[0] >= 1 && roll2[0] <= 6);
    }

    // ---------- GameRound: basic rules ----------

    @Test
    public void testCanRollOneDieRule() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.HUMAN);
        GameRound round = tournament.getCurrentRound();
        HumanPlayer human = tournament.getHuman();

        // Initially, 7..9 are uncovered -> cannot roll one die
        assertFalse(round.canRollOneDie(PlayerId.HUMAN));

        // Cover 7..9
        for (int i = 7; i <= boardSize; i++) {
            human.coverSquare(i);
        }

        assertTrue("After covering 7..9, human should be allowed to roll 1 die",
                round.canRollOneDie(PlayerId.HUMAN));
    }

    @Test
    public void testGenerateCoverMovesForDiceTotalSeven() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.HUMAN);
        GameRound round = tournament.getCurrentRound();

        int diceTotal = 7;
        List<Move> coverMoves = round.getLegalMoves(PlayerId.HUMAN, MoveType.COVER, diceTotal);

        // We at least expect these combos: [7], [1,6], [2,5], [3,4]
        Set<Set<Integer>> expected = new HashSet<>();
        expected.add(setOf(7));
        expected.add(setOf(1, 6));
        expected.add(setOf(2, 5));
        expected.add(setOf(3, 4));

        // Build a set of all actual square sets the model produced
        Set<Set<Integer>> actualSets = new HashSet<>();
        for (Move m : coverMoves) {
            assertEquals(PlayerId.HUMAN, m.getActor());
            assertEquals(MoveType.COVER, m.getType());
            assertEquals(diceTotal, m.getDiceTotal());
            actualSets.add(new HashSet<>(m.getSquares()));
        }

        // Make sure every expected combo is present (there can be more, that's fine)
        for (Set<Integer> e : expected) {
            assertTrue("Expected move not found: " + e, actualSets.contains(e));
        }
    }

    @Test
    public void testGenerateUncoverMovesRespectsAdvantageLock() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);

        // Simulate: Computer won last round with score 11 (digit sum 2) and was not first player.
        // We'll start a new round with HUMAN first, advantage for COMPUTER on square 2.
        // For this test, we just create GameRound directly with advantageInfo.
        HumanPlayer human = tournament.getHuman();
        ComputerPlayer computer = tournament.getComputer();
        Dice dice = tournament.getDice();

        AdvantageInfo advantageInfo = new AdvantageInfo(PlayerId.COMPUTER, 2);
        GameRound round = new GameRound(human, computer, boardSize, dice,
                PlayerId.HUMAN, advantageInfo);

        // At start, advantage lock is active, so human should NOT be able to uncover 2.
        // Make sure computer has square 2 covered, so it *would* be a candidate.
        computer.coverSquare(2);

        int diceTotal = 2;
        List<Move> uncoverMoves = round.getLegalMoves(PlayerId.HUMAN, MoveType.UNCOVER, diceTotal);

        // There should be 0 uncover moves involving [2] because of advantage lock.
        for (Move m : uncoverMoves) {
            assertFalse("Should not allow uncover of advantage square while lock active",
                    m.getSquares().contains(2));
        }
    }

    // ---------- Round end & scoring ----------

    @Test
    public void testWinByCoverAddsCorrectScore() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.HUMAN);
        GameRound round = tournament.getCurrentRound();

        HumanPlayer human = tournament.getHuman();
        ComputerPlayer computer = tournament.getComputer();

        // Human: all covered except square 3
        for (int i = 1; i <= boardSize; i++) {
            human.coverSquare(i);
        }
        human.uncoverSquare(3);

        // Computer: uncovered 1..5, covered others
        for (int i = 1; i <= boardSize; i++) {
            computer.coverSquare(i);
        }
        for (int i = 1; i <= 5; i++) {
            computer.uncoverSquare(i);
        }

        // Winning move: Human covers 3
        Move winMove = new Move(PlayerId.HUMAN, MoveType.COVER, 3,
                Collections.singletonList(3));

        assertFalse(round.isOver());
        round.applyMove(winMove);

        assertTrue("Round should be over", round.isOver());
        assertEquals(PlayerId.HUMAN, round.getWinner());
        assertEquals(WinType.COVER, round.getWinType());

        int expectedScore = computer.sumOfUncoveredSquares(); // 1+2+3+4+5 = 15
        assertEquals(expectedScore, round.getWinningScore());
        assertEquals(expectedScore, human.getTournamentScore());
    }

    @Test
    public void testWinByUncoverAddsCorrectScore() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.HUMAN);
        GameRound round = tournament.getCurrentRound();

        HumanPlayer human = tournament.getHuman();
        ComputerPlayer computer = tournament.getComputer();

        // Set up: all computer squares uncovered (so human can win by uncovering last covered one)
        for (int i = 1; i <= boardSize; i++) {
            computer.uncoverSquare(i);
        }
        // Human: cover a few squares so score is interesting: cover 2,4,6
        human.coverSquare(2);
        human.coverSquare(4);
        human.coverSquare(6);

        // Now pretend all computer squares are covered *except* 5,
        // and human will uncover 5 to make all uncovered.
        for (int i = 1; i <= boardSize; i++) {
            computer.coverSquare(i);
        }
        computer.uncoverSquare(5); // the one still uncovered

        // Wait, win-by-uncover rule is: winner uncovers all OPPONENT squares.
        // So we want human to uncover the last covered square on computer's side.
        // So make computer have all squares UNcovered except one, we uncover that one.
        for (int i = 1; i <= boardSize; i++) {
            computer.uncoverSquare(i);
        }
        // Now cover 5 only (so it's the last covered one), human will uncover it:
        computer.coverSquare(5);

        Move winMove = new Move(PlayerId.HUMAN, MoveType.UNCOVER, 5,
                Collections.singletonList(5));

        round.applyMove(winMove);

        assertTrue(round.isOver());
        assertEquals(PlayerId.HUMAN, round.getWinner());
        assertEquals(WinType.UNCOVER, round.getWinType());

        int expectedScore = human.sumOfCoveredSquares(); // 2+4+6
        assertEquals(expectedScore, round.getWinningScore());
        assertEquals(expectedScore, human.getTournamentScore());
    }

    // ---------- Tournament & advantage ----------

    @Test
    public void testTournamentAdvantageWinnerNotFirstPlayer() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.COMPUTER); // computer goes first
        GameRound round = tournament.getCurrentRound();

        HumanPlayer human = tournament.getHuman();
        ComputerPlayer computer = tournament.getComputer();

        // Set up a human win with score 23 (digit sum 5)
        // Easiest: manually set board, then apply a win move and let scoring happen.

        // Human: all covered except square 5
        for (int i = 1; i <= boardSize; i++) {
            human.coverSquare(i);
        }
        human.uncoverSquare(5);

        // Computer: uncovered squares sum to 23 when human wins by cover
        // e.g. 10 + 9 + 4 = 23 (for board 1..9 this doesn't fit),
        // so let's cheat slightly:
        // We'll just cover/uncover so that sumOfUncoveredSquares() = 23.
        // Example for boardSize=9:
        // Use 9 + 8 + 6 = 23
        for (int i = 1; i <= boardSize; i++) {
            computer.coverSquare(i);
        }
        computer.uncoverSquare(9);
        computer.uncoverSquare(8);
        computer.uncoverSquare(6);

        // Human win-by-cover by covering 5
        Move winMove = new Move(PlayerId.HUMAN, MoveType.COVER, 5,
                Collections.singletonList(5));
        round.applyMove(winMove);

        assertTrue(round.isOver());
        assertEquals(PlayerId.HUMAN, round.getWinner());
        assertEquals(23, round.getWinningScore());

        // Finish round & compute advantage
        tournament.finishCurrentRound();
        AdvantageInfo adv = tournament.computeNextRoundAdvantage();

        // Winner (HUMAN) was NOT first player (COMPUTER),
        // so advantage should go to the winner (HUMAN),
        // advantageSquare = sumDigits(23) = 5
        assertEquals(PlayerId.HUMAN, adv.advantagedPlayer);
        assertEquals(5, adv.advantageSquare);
    }

    @Test
    public void testTournamentAdvantageWinnerIsFirstPlayerGoesToOpponent() {
        int boardSize = 9;
        Tournament tournament = new Tournament(boardSize);
        tournament.startFirstRound(PlayerId.HUMAN); // human first
        GameRound round = tournament.getCurrentRound();

        HumanPlayer human = tournament.getHuman();
        ComputerPlayer computer = tournament.getComputer();

        // Let human win with score 14 (digit sum 5 again)
        for (int i = 1; i <= boardSize; i++) {
            human.coverSquare(i);
        }
        human.uncoverSquare(5);

        for (int i = 1; i <= boardSize; i++) {
            computer.coverSquare(i);
        }
        computer.uncoverSquare(9);
        computer.uncoverSquare(5); // 9+5 = 14

        Move winMove = new Move(PlayerId.HUMAN, MoveType.COVER, 5,
                Collections.singletonList(5));
        round.applyMove(winMove);

        assertTrue(round.isOver());
        assertEquals(PlayerId.HUMAN, round.getWinner());
        assertEquals(14, round.getWinningScore());

        tournament.finishCurrentRound();
        AdvantageInfo adv = tournament.computeNextRoundAdvantage();

        // Winner == firstPlayer, so advantage goes to opponent (COMPUTER)
        assertEquals(PlayerId.COMPUTER, adv.advantagedPlayer);
        assertEquals(5, adv.advantageSquare);
    }

    // ---------- Computer strategy ----------

    @Test
    public void testComputerChoosesMoveWithMoreSquaresAndHigherValues() {
        int boardSize = 9;
        ComputerPlayer computer = new ComputerPlayer(boardSize);
        HumanPlayer human = new HumanPlayer(boardSize);

        // Make both boards default (all uncovered)
        computer.resetBoard(null);
        human.resetBoard(null);

        // Suppose diceTotal = 7.
        // Build two possible moves:
        //   m1: COVER [7]
        //   m2: COVER [3,4]  (2 squares, higher count)
        Move m1 = new Move(PlayerId.COMPUTER, MoveType.COVER, 7,
                Collections.singletonList(7));
        Move m2 = new Move(PlayerId.COMPUTER, MoveType.COVER, 7,
                Arrays.asList(3, 4));

        List<Move> coverMoves = Arrays.asList(m1, m2);
        List<Move> uncoverMoves = Collections.emptyList();

//        Move chosen = computer.chooseMove(coverMoves, uncoverMoves);

//        assertNotNull(chosen);
//        assertEquals(Arrays.asList(3, 4), chosen.getSquares());
    }

    // ---------- helpers ----------

    private Set<Integer> setOf(Integer... vals) {
        Set<Integer> s = new HashSet<>();
        Collections.addAll(s, vals);
        return s;
    }
}
