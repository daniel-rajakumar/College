package com.example.oplcanoga.model;

/**
 * Represents a handicap/advantage for the next round.
 */
public class AdvantageInfo {
    public final PlayerId advantagedPlayer;
    public final int advantageSquare; // 1..boardSize, or -1 for "no advantage"

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
