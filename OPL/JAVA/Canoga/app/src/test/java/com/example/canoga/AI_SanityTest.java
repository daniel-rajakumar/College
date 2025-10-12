package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

import java.util.List;

// Minimal move type used only in the test
class Move { final boolean cover; final List<Integer> squares; Move(boolean c, List<Integer> s){cover=c;squares=s;} }

public class AI_SanityTest {

    // TODO: replace with your real AI call, e.g., Computer.chooseMove(board, sum)
    static Move aiChooseMove(Board b, boolean isHuman, int sum) {
        // Dummy: always pick the first legal single
        for (int i = 1; i <= b.getSize(); i++) {
            if (sum == i && !b.isCovered(isHuman, i)) return new Move(true, List.of(i));            // try cover own
            if (sum == i && b.isCovered(!isHuman, i)) return new Move(false, List.of(i));           // try uncover opp
        }
        return null;
    }

    @Test
    void ai_never_targets_illegal_squares() {
        Board b = new Board(11);

        // Human 7 pre-covered; computer 4 pre-uncovered
        assertTrue(b.coverHumanSquare(7));
        assertTrue(b.uncoverComputerSquare(4));

        // Ask AI (from human perspective) for sum=7 -> should NOT cover 7 again
        Move m1 = aiChooseMove(b, true, 7);
        assertNotNull(m1);
        if (m1.cover) assertFalse(m1.squares.contains(7), "AI should not cover an already covered square");

        // Ask AI (from human perspective) for sum=4 -> should NOT try to uncover 4 again (already uncovered)
        Move m2 = aiChooseMove(b, true, 4);
        assertNotNull(m2);
        if (!m2.cover) assertFalse(m2.squares.contains(4), "AI should not uncover an already uncovered square");
    }
}
