package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.PlayerId;

/**
 * An immutable snapshot of the game state at a particular moment.
 * This object is created by the GameController and passed to the GameView
 * to avoid exposing the mutable model to the view directly.
 */
public class BoardState {
    /**
     * An array representing the human player's squares. A value of 0 means covered.
     */
    public final int[] humanSquares;
    /**
     * An array representing the computer player's squares. A value of 0 means covered.
     */
    public final int[] computerSquares;
    /**
     * The human player's total score in the tournament.
     */
    public final int humanScore;
    /**
     * The computer player's total score in the tournament.
     */
    public final int computerScore;
    /**
     * The number of squares on the board for the current round.
     */
    public final int boardSize;
    /**
     * The player whose turn it is.
     */
    public final PlayerId currentPlayer;
    /**
     * A flag indicating if the current round has ended.
     */
    public final boolean roundOver;
    /**
     * The winner of the round, if it is over. Can be null for a draw.
     */
    public final PlayerId roundWinner;
    /**
     * A flag indicating if the advantage square is currently locked and cannot be uncovered.
     */
    public final boolean advantageLockActive;
    /**
     * The player who has the advantage in the current round.
     */
    public final PlayerId advantagedPlayer;
    /**
     * The square number that is covered due to the advantage rule.
     */
    public final int advantageSquare;

    /**
     * Constructs a new BoardState snapshot.
     *
     * @param humanSquares        State of the human's squares.
     * @param computerSquares     State of the computer's squares.
     * @param humanScore          Total score for the human.
     * @param computerScore       Total score for the computer.
     * @param boardSize           The current board size.
     * @param currentPlayer       The player whose turn it is.
     * @param roundOver           True if the round has ended.
     * @param roundWinner         The winner of the round, or null.
     * @param advantageLockActive True if the advantage square is locked.
     * @param advantagedPlayer    The player with the advantage.
     * @param advantageSquare     The advantage square number.
     */
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
