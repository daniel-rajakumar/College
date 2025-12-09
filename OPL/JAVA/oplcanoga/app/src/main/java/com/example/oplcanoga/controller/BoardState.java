package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.PlayerId;

public class BoardState {
    public final int[] humanSquares;
    public final int[] computerSquares;
    public final int humanScore;
    public final int computerScore;
    public final int boardSize;
    public final PlayerId currentPlayer;
    public final boolean roundOver;
    public final PlayerId roundWinner;

    public final boolean advantageLockActive;
    public final PlayerId advantagedPlayer;
    public final int advantageSquare;

    public BoardState(int[] humanSquares,
                      int[] computerSquares,
                      int humanScore,
                      int computerScore,
                      int boardSize,
                      PlayerId currentPlayer,
                      boolean roundOver,
                      PlayerId roundWinner,
                      boolean advantageLockActive,
                      PlayerId advantagedPlayer,
                      int advantageSquare) {
        this.humanSquares = humanSquares;
        this.computerSquares = computerSquares;
        this.humanScore = humanScore;
        this.computerScore = computerScore;
        this.boardSize = boardSize;
        this.currentPlayer = currentPlayer;
        this.roundOver = roundOver;
        this.roundWinner = roundWinner;

        this.advantageLockActive = advantageLockActive;
        this.advantagedPlayer = advantagedPlayer;
        this.advantageSquare = advantageSquare;
    }
}
