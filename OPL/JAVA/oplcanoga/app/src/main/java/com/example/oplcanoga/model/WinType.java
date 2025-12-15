package com.example.oplcanoga.model;

/**
 * Enumeration representing the two ways to win a round in Canoga.
 */
public enum WinType {
    /**
     * Win by covering all squares on the board.
     */
    COVER,

    /**
     * Win by uncovering all squares on the board (after they were covered).
     */
    UNCOVER
}
