package com.example.oplcanoga.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents a move made by a player in the game.
 * Encapsulates the actor, the type of move, the dice roll, and the squares involved.
 */
public class Move {

    private final PlayerId actor;
    private final MoveType type;
    private final int diceTotal;
    private final List<Integer> squares;

    /**
     * Constructs a Move object.
     *
     * @param actor     The player performing the move.
     * @param type      The type of move (e.g., COVER, UNCOVER).
     * @param diceTotal The sum of the dice rolled for this move.
     * @param squares   The list of squares affected by this move.
     */
    public Move(PlayerId actor, MoveType type, int diceTotal, List<Integer> squares) {
        this.actor = actor;
        this.type = type;
        this.diceTotal = diceTotal;
        this.squares = new ArrayList<>(squares);
        Collections.sort(this.squares);
    }

    /**
     * Gets the player who made the move.
     *
     * @return The PlayerId of the actor.
     */
    public PlayerId getActor() {
        return actor;
    }

    /**
     * Gets the type of the move.
     *
     * @return The MoveType.
     */
    public MoveType getType() {
        return type;
    }

    /**
     * Gets the total value of the dice roll associated with this move.
     *
     * @return The dice total.
     */
    public int getDiceTotal() {
        return diceTotal;
    }

    /**
     * Gets the list of squares involved in the move.
     * The list is unmodifiable and sorted.
     *
     * @return An unmodifiable list of squares.
     */
    public List<Integer> getSquares() {
        return Collections.unmodifiableList(squares);
    }

    /**
     * Gets the number of squares involved in the move.
     *
     * @return The count of squares.
     */
    public int getSquareCount() {
        return squares.size();
    }

    /**
     * Gets the highest-valued square involved in the move.
     *
     * @return The highest square value, or 0 if no squares are involved.
     */
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
