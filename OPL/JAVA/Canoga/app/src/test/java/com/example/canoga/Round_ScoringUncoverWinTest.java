package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

public class Round_ScoringUncoverWinTest {

    // TODO: wire to your official scoring if you have it
    static int sumCoveredHuman(Board b) {
        int s = 0;
        for (int i = 1; i <= b.getSize(); i++) if (b.isCovered(true, i)) s += i;
        return s;
    }

    @Test
    void win_by_uncovering_scores_sum_of_own_covered() {
        Board b = new Board(9);

        // Human has some covered on own row: 2,4,5 → 11
        assertTrue(b.coverHumanSquare(2));
        assertTrue(b.coverHumanSquare(4));
        assertTrue(b.coverHumanSquare(5));

        // Computer row all covered initially; human uncovers last remaining set [1,3]
        // First uncover a bunch to simulate near-finish
        for (int i = 1; i <= 9; i++) b.setCovered(false, i, true); // ensure covered
        for (int i : new int[]{2,4,5,6,7,8,9}) b.setCovered(false, i, false);

        // Now apply last uncover move
        b.applyMove(true, false, java.util.List.of(1,3), 4);
        assertTrue(b.hasHumanUncoveredAllOpponent());

        assertEquals(11, sumCoveredHuman(b));
    }
}
