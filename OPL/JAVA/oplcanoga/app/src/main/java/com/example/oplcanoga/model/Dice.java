package com.example.oplcanoga.model;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;

/**
 * Dice roller. Supports random mode and a "manual" queue mode for testing.
 */
public class Dice {

    private final Random random = new Random();
    private boolean manualMode = false;
    private final Queue<Integer> manualRolls = new LinkedList<>();

    public void setManualMode(boolean manualMode) {
        this.manualMode = manualMode;
    }

    public void addManualRoll(int value) {
        manualRolls.add(value);
    }

    public int[] roll(int count) {
        if (count != 1 && count != 2) {
            throw new IllegalArgumentException("Dice count must be 1 or 2");
        }

        int[] result = new int[count];

        for (int i = 0; i < count; i++) {
            if (manualMode && !manualRolls.isEmpty()) {
                result[i] = manualRolls.remove();
            } else {
                result[i] = random.nextInt(6) + 1; // 1..6
            }
        }

        return result;
    }
}
