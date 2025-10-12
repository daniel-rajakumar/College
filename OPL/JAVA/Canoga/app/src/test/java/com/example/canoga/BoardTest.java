package com.example.canoga;


import static org.junit.jupiter.api.Assertions.*;

import com.example.canoga.model.Board;

import org.junit.jupiter.api.Test;

import java.util.List;

public class BoardTest {

    @Test
    void ctor_sets_size_and_initial_states() {
        Board b = new Board(11);
        assertEquals(11, b.getSize());

        // human starts all uncovered (false)
        for (int i = 1; i <= b.getSize(); i++) {
            assertFalse(b.getHumanSquares()[i-1], "human " + i + " should start uncovered=false");
            assertTrue(b.getComputerSquares()[i-1], "computer " + i + " should start covered=true");
        }
    }

    @Test
    void ctor_rejects_invalid_size() {
        assertThrows(IllegalArgumentException.class, () -> new Board(7));
        assertThrows(IllegalArgumentException.class, () -> new Board(12));
    }


    @Test
    void coverHuman_uncoverComputer_respect_rules() {
        Board b = new Board(11);

        // cover human 5 (was false)
        assertTrue(b.coverHumanSquare(5));
        assertTrue(b.getHumanSquares()[4]);

        // cannot cover same again
        assertFalse(b.coverHumanSquare(5));

        // uncover computer 7 (was true)
        assertTrue(b.uncoverComputerSquare(7));
        assertFalse(b.getComputerSquares()[6]);

        // cannot uncover same again
        assertFalse(b.uncoverComputerSquare(7));

        // out of range returns false
        assertFalse(b.coverHumanSquare(0));
        assertFalse(b.uncoverComputerSquare(12));
    }

    @Test
    void isCovered_and_setCovered_work_with_1_based_indexes() {
        Board b = new Board(9);

        // human 3 initially false
        assertFalse(b.isCovered(true, 3));
        b.setCovered(true, 3, true);
        assertTrue(b.isCovered(true, 3));

        // computer 4 initially true
        assertTrue(b.isCovered(false, 4));
        b.setCovered(false, 4, false);
        assertFalse(b.isCovered(false, 4));

        // OOB throws
        assertThrows(IllegalArgumentException.class, () -> b.isCovered(true, 0));
        assertThrows(IllegalArgumentException.class, () -> b.setCovered(false, 10, true));
    }

    @Test
    void applyMove_rejects_bad_sum_and_is_atomic() {
        Board b = new Board(11);

        // Pre-mark some state we can detect if it changes
        // computer 6 is true initially; human 2 is false initially
        boolean beforeHuman2 = b.isCovered(true, 2);
        boolean beforeComp6  = b.isCovered(false, 6);

        // Human tries to cover squares [2,3] with diceSum 10 (invalid: 2+3 != 10)
        assertThrows(IllegalArgumentException.class,
                () -> b.applyMove(true, /*coverMode*/true, List.of(2,3), /*diceSum*/10));

        // state unchanged
        assertEquals(beforeHuman2, b.isCovered(true, 2));
        assertEquals(beforeComp6,  b.isCovered(false, 6));
    }

    @Test
    void applyMove_rejects_covering_already_covered_and_uncovering_already_uncovered() {
        Board b = new Board(11);

        // Make human 5 covered first
        assertTrue(b.coverHumanSquare(5));
        // Try to cover 5 again via applyMove (should throw)
        assertThrows(IllegalArgumentException.class,
                () -> b.applyMove(true, true, List.of(5), 5));

        // Make computer 4 uncovered first
        assertTrue(b.uncoverComputerSquare(4));
        // Try to uncover 4 again via applyMove (should throw)
        assertThrows(IllegalArgumentException.class,
                () -> b.applyMove(true, false, List.of(4), 4));
    }

    @Test
    void applyMove_cover_own_row_success() {
        Board b = new Board(11);

        // Human covers [2,3] using dice sum 5
        b.applyMove(true, /*cover*/true, List.of(2,3), 5);

        assertTrue(b.isCovered(true, 2));
        assertTrue(b.isCovered(true, 3));
    }

    @Test
    void applyMove_uncover_opponent_row_success() {
        Board b = new Board(11);

        // Computer row starts covered=true; Human uncovers [1,4] using sum 5
        b.applyMove(true, /*cover*/false, List.of(1,4), 5);

        assertFalse(b.isCovered(false, 1));
        assertFalse(b.isCovered(false, 4));
    }

    @Test
    void human_win_predicates_work() {
        Board b = new Board(9);

        // Cover all human squares (win A for human)
        for (int i = 1; i <= 9; i++) assertTrue(b.coverHumanSquare(i));
        assertTrue(b.hasHumanCoveredAll());
        assertFalse(b.hasHumanUncoveredAllOpponent()); // opponent still covered initially
    }

    @Test
    void computer_win_predicates_work() {
        Board b = new Board(9);

        // Uncover all computer squares (human “uncovered all opponent”)
        for (int i = 1; i <= 9; i++) assertTrue(b.uncoverComputerSquare(i));
        assertTrue(b.hasHumanUncoveredAllOpponent());

        // If computer had covered all of its own (impossible now), that would be:
        // assertTrue(b.hasComputerCoveredAll()); // not true after uncovering
        assertFalse(b.hasComputerCoveredAll());
    }
}
