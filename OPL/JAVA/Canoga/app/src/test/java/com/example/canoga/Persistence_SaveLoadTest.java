package com.example.canoga;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

import com.example.canoga.model.Board;

// TODO: import your real SaveLoadController / GameStateParser

public class Persistence_SaveLoadTest {

    static class Snapshot {
        final boolean[] human, comp;
        Snapshot(Board b) { human=b.getHumanSquares().clone(); comp=b.getComputerSquares().clone(); }
    }

    @Test
    void serialize_then_deserialize_restores_all_squares() {
        Board b = new Board(11);

        // Craft a non-trivial state
        for (int i : new int[]{1,3,7,9,11}) assertTrue(b.coverHumanSquare(i));
        for (int i : new int[]{2,5,10}) assertTrue(b.uncoverComputerSquare(i));
        Snapshot before = new Snapshot(b);

        // TODO: String text = GameStateParser.serialize(b);
        // TODO: Board restored = GameStateParser.deserializeBoard(text);

        // TEMP until you wire parser: pretend we reloaded to 'b2'
        Board restored = new Board(11);
        for (int i = 1; i <= 11; i++) restored.setCovered(true, i, before.human[i-1]);
        for (int i = 1; i <= 11; i++) restored.setCovered(false, i, before.comp[i-1]);

        assertArrayEquals(before.human, restored.getHumanSquares());
        assertArrayEquals(before.comp, restored.getComputerSquares());
    }
}
