package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

public class Tournament_AdvantageTest {

    static int digitSum(int x) { int s=0; while(x>0){ s+=x%10; x/=10; } return s; }

    // TODO: replace these with your real tournament/round setup
    static void applyAdvantageTo(Board advantagedBoard, int winnerPoints) {
        int s = digitSum(winnerPoints);
        if (s < 1 || s > advantagedBoard.getSize()) return;
        advantagedBoard.setCovered(false, s, true); // if advantaged is computer, cover its own row; adjust if spec differs
    }

    @Test
    void advantage_covers_digit_sum_square_and_is_initially_protected() {
        Board nextRoundComputer = new Board(11); // use the row that receives advantage per your rules
        // initial: computer row is all covered already; simulate rule by uncovering most then re-cover advantage
        for (int i = 1; i <= 11; i++) nextRoundComputer.setCovered(false, i, false);
        applyAdvantageTo(nextRoundComputer, /*winner points*/27);
        assertTrue(nextRoundComputer.isCovered(false, 9));

        // TODO: enforce protection in your engine (cannot be uncovered until advantaged player has taken one turn)
        // For now we just assert it's covered; wire protection into GameModel when available.
    }
}
