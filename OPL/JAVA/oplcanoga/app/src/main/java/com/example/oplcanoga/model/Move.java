package com.example.oplcanoga.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Move {

    private final PlayerId actor;
    private final MoveType type;
    private final int diceTotal;
    private final List<Integer> squares;

    public Move(PlayerId actor, MoveType type, int diceTotal, List<Integer> squares) {
        this.actor = actor;
        this.type = type;
        this.diceTotal = diceTotal;
        this.squares = new ArrayList<>(squares);
        Collections.sort(this.squares);
    }

    public PlayerId getActor() {
        return actor;
    }

    public MoveType getType() {
        return type;
    }

    public int getDiceTotal() {
        return diceTotal;
    }

    public List<Integer> getSquares() {
        return Collections.unmodifiableList(squares);
    }

    public int getSquareCount() {
        return squares.size();
    }

    public int getHighestSquare() {
        if (squares.isEmpty()) return 0;
        return squares.get(squares.size() - 1);
    }

    @Override
    public String toString() {
        return "Move{" +
                "actor=" + actor +
                ", type=" + type +
                ", diceTotal=" + diceTotal +
                ", squares=" + squares +
                '}';
    }
}
