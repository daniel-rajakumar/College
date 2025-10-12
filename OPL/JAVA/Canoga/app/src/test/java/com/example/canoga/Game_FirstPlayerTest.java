package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.ArrayDeque;
import java.util.Queue;

public class Game_FirstPlayerTest {

    interface Dice {
        int[] rollTwo();
    }

    static class FakeDice implements Dice {
        private final Queue<Integer> q = new ArrayDeque<>();
        FakeDice(int... pips) { for (int v : pips) q.add(v); }
        public int[] rollTwo() { return new int[]{ q.remove(), q.remove() }; }
    }

    // TODO: replace with your real determineFirstPlayer(Dice) logic
    static String determineFirstPlayer(Dice d) {
        while (true) {
            int a = d.rollTwo()[0] + d.rollTwo()[1]; // human
            int b = d.rollTwo()[0] + d.rollTwo()[1]; // computer
            if (a > b) return "HUMAN";
            if (b > a) return "COMPUTER";
        }
    }

    @Test
    void tie_re_rolls_until_resolved() {
        FakeDice dice = new FakeDice(
                3,3, 3,3,   // tie 6 vs 6
                2,5, 2,3    // human 7 vs computer 5
        );
        String first = determineFirstPlayer(dice);
        assertEquals("HUMAN", first);
    }
}
