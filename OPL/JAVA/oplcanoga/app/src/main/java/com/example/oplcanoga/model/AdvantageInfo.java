package com.example.oplcanoga.model;

/**
 * Immutable class holding information about a player's advantage/handicap in a round.
 * An advantage consists of a specific square that starts covered or is locked from uncovering.
 */
public class AdvantageInfo {

    /**
     * The ID of the player who holds the advantage.
     */
    public final PlayerId advantagedPlayer;

    /**
     * The square number associated with the advantage.
     */
    public final int advantageSquare;

    /**
     * Constructs an AdvantageInfo object.
     *
     * @param advantagedPlayer The player with the advantage.
     * @param advantageSquare  The square to be covered/locked.
     */
    public AdvantageInfo(PlayerId advantagedPlayer, int advantageSquare) {
        this.advantagedPlayer = advantagedPlayer;
        this.advantageSquare = advantageSquare;
    }

    @Override
    public String toString() {
        return "AdvantageInfo{" +
                "advantagedPlayer=" + advantagedPlayer +
                ", advantageSquare=" + advantageSquare +
                '}';
    }
}
