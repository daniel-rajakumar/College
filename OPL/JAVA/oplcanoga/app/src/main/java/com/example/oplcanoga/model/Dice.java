package com.example.oplcanoga.model;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Random;

/**
 * Represents a standard 6-sided die or a pair of dice.
 * Supports a manual mode for testing or deterministic gameplay.
 */
public class Dice {

    private final Random random = new Random();
    private boolean manualMode = false;
    private final Queue<Integer> manualRolls = new LinkedList<>();

    /**
     * Enables or disables manual mode.
     * In manual mode, dice rolls are consumed from the manualRolls queue.
     *
     * @param manualMode True to enable manual mode, false for random rolls.
     */
    public void setManualMode(boolean manualMode) {
        this.manualMode = manualMode;
    }

    /**
     * Adds a pre-determined value to the queue of manual rolls.
     * Used when manual mode is active.
     *
     * @param value The value of the roll (should be between 1 and 6).
     */
    public void addManualRoll(int value) {
        manualRolls.add(value);
    }

    /**
     * Rolls the specified number of dice.
     *
     * @param count The number of dice to roll (must be 1 or 2).
     * @return An array containing the result of each die roll.
     * @throws IllegalArgumentException if count is not 1 or 2.
     */
    public int[] roll(int count) {
        if (count != 1 && count != 2) {
            throw new IllegalArgumentException("Dice count must be 1 or 2");
        }

        int[] result = new int[count];

        for (int i = 0; i < count; i++) {
            if (manualMode && !manualRolls.isEmpty()) {
                result[i] = manualRolls.remove();
            } else {
                result[i] = random.nextInt(6) + 1;
            }
        }

        return result;
    }
}
