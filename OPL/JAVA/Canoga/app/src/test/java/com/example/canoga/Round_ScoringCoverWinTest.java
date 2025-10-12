package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

public class Round_ScoringCoverWinTest {

    // TODO: replace these with your actual round/model scoring calls
    static int sumUncoveredComputer(Board b) {
        int s = 0;
        for (int i = 1; i <= b.getSize(); i++) if (!b.isCovered(false, i)) s += i;
        return s;
    }

    @Test
    void win_by_covering_scores_sum_of_opponent_uncovered() {
        Board b = new Board(9);

        // Human is about to finish: cover 1..8 already covered
        for (int i = 1; i <= 8; i++) assertTrue(b.coverHumanSquare(i));
        assertFalse(b.hasHumanCoveredAll());
        // Opponent has some uncovered: 1,3,8 uncovered (others covered)
        for (int i = 1; i <= 9; i++) b.setCovered(false, i, true); // all covered first
        b.setCovered(false, 1, false);
        b.setCovered(false, 3, false);
        b.setCovered(false, 8, false);

        // Human applies last cover on 9 using applyMove
        b.applyMove(true, true, java.util.List.of(9), 9);
        assertTrue(b.hasHumanCoveredAll());

        // Points expected
        int expected = 1 + 3 + 8;
        assertEquals(expected, sumUncoveredComputer(b));
    }
}
