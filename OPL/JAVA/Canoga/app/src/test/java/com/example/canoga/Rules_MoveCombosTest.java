package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import java.util.*;

public class Rules_MoveCombosTest {

    /** If you already have something like GameModel.findCoverCombos(sum), call that instead. */
    static List<List<Integer>> combosForSum(int sum, int maxSquare) {
        List<List<Integer>> out = new ArrayList<>();
        backtrack(sum, maxSquare, 1, new ArrayList<>(), out);
        return out;
    }

    private static void backtrack(int target, int max, int start, List<Integer> cur, List<List<Integer>> out) {
        if (target == 0) { out.add(List.copyOf(cur)); return; }
        for (int i = start; i <= Math.min(max, target); i++) {
            cur.add(i);
            backtrack(target - i, max, i + 1, cur, out);
            cur.remove(cur.size() - 1);
        }
    }

    @Test
    void sums_for_6_include_expected_sets() {
        List<List<Integer>> combos = combosForSum(6, 11);
        assertTrue(combos.contains(List.of(1,5)));
        assertTrue(combos.contains(List.of(2,4)));
        assertTrue(combos.contains(List.of(1,2,3)));
        // no duplicates
        assertEquals(new HashSet<>(combos).size(), combos.size());
    }
}
