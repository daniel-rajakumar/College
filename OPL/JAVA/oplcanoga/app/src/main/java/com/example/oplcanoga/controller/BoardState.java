package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.PlayerId;

/**
 * Immutable snapshot of board + scores + turn info.
 * The view uses this to render the UI.
 */
public class BoardState {

    public final int[] humanSquares;      // copy of human squares[1..boardSize]
    public final int[] computerSquares;   // copy of computer squares[1..boardSize]
    public final int humanScore;
    public final int computerScore;

    public final int boardSize;
    public final PlayerId currentPlayer;
    public final boolean roundOver;
    public final PlayerId roundWinner;

    public BoardState(int[] humanSquares,
                      int[] computerSquares,
                      int humanScore,
                      int computerScore,
                      int boardSize,
                      PlayerId currentPlayer,
                      boolean roundOver,
                      PlayerId roundWinner) {
        this.humanSquares = humanSquares;
        this.computerSquares = computerSquares;
        this.humanScore = humanScore;
        this.computerScore = computerScore;
        this.boardSize = boardSize;
        this.currentPlayer = currentPlayer;
        this.roundOver = roundOver;
        this.roundWinner = roundWinner;
    }
}
