package com.example.oplcanoga.model;

public class AdvantageInfo {
    public final PlayerId advantagedPlayer;
    public final int advantageSquare;

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
