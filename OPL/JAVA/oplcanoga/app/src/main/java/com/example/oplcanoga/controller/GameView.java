package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;

import java.util.List;

/**
 * Defines the interface that the View (UI) must implement.
 * The GameController communicates with the UI through this contract,
 * ensuring a clean separation between the controller and the Android-specific UI code.
 */
public interface GameView {

    /**
     * Called to update the entire board display with the latest game state.
     *
     * @param state A snapshot of the current board, scores, and turn information.
     */
    void updateBoard(BoardState state);

    /**
     * Displays the result of a dice roll for a specific player.
     *
     * @param player The player who rolled the dice.
     * @param dice   An array containing the values of the rolled dice.
     */
    void showDiceRoll(PlayerId player, int[] dice);

    /**
     * Shows a generic message to the user (e.g., in a toast or a status bar).
     *
     * @param message The message string to display.
     */
    void showMessage(String message);

    /**
     * Prompts the human player to choose a move from a list of legal options.
     *
     * @param diceTotal    The total of the dice roll that the move must match.
     * @param coverMoves   A list of legal moves to cover own squares.
     * @param uncoverMoves A list of legal moves to uncover opponent's squares.
     */
    void promptHumanForMove(int diceTotal,
                            List<Move> coverMoves,
                            List<Move> uncoverMoves);

    /**
     * Called when a round has ended.
     * The View should use this to transition to a results screen or prompt for the next round.
     *
     * @param winner             The PlayerId of the round winner, or null for a draw.
     * @param winType            The way the round was won (COVER or UNCOVER).
     * @param winningScore       The number of points awarded for the round.
     * @param humanTotalScore    The new total score for the human player.
     * @param computerTotalScore The new total score for the computer player.
     */
    void onRoundEnded(PlayerId winner,
                      WinType winType,
                      int winningScore,
                      int humanTotalScore,
                      int computerTotalScore);
}
