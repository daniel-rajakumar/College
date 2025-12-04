package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;

import java.util.List;

/**
 * Interface the Android UI layer (Activity/Fragment) must implement.
 * The controller only talks to this, never directly to Android classes.
 */
public interface GameView {

    /**
     * Called whenever the board state changes (after a move, start of round, etc.).
     */
    void updateBoard(BoardState state);

    /**
     * Show a dice roll result for a player.
     */
    void showDiceRoll(PlayerId player, int[] dice);

    /**
     * Show a simple message (toast, dialog, status text, etc.).
     */
    void showMessage(String message);

    /**
     * Ask the UI to let the human choose a move.
     * The UI can render the options and then call back into the controller
     * with the chosen move.
     */
    void promptHumanForMove(int diceTotal,
                            List<Move> coverMoves,
                            List<Move> uncoverMoves);

    /**
     * Called when a round ends.
     */
    void onRoundEnded(PlayerId winner,
                      WinType winType,
                      int winningScore,
                      int humanTotalScore,
                      int computerTotalScore);
}
