package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

public class Rules_DiceModeTest {

    /** Replace this with your real rules function if you have one. */
    static boolean canThrowOneDie(Board b, boolean isHuman) {
        int n = b.getSize();
        for (int i = 7; i <= n; i++) {
            if (!b.isCovered(isHuman, i)) return false;
        }
        return true;
    }

    @Test
    void one_die_only_when_7_to_n_are_covered() {
        Board b = new Board(11);

        // initially human has all false → not allowed
        assertFalse(canThrowOneDie(b, true));

        // cover human 7..11
        for (int i = 7; i <= 11; i++) {
            assertTrue(b.coverHumanSquare(i));
        }
        assertTrue(canThrowOneDie(b, true));

        // uncover one high human square → flips back to false
        b.setCovered(true, 11, false);
        assertFalse(canThrowOneDie(b, true));
    }
}
