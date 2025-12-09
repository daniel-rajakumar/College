package com.example.oplcanoga.controller;

import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;

import java.util.List;

public interface GameView {

    void updateBoard(BoardState state);

    void showDiceRoll(PlayerId player, int[] dice);

    void showMessage(String message);

    void promptHumanForMove(int diceTotal,
                            List<Move> coverMoves,
                            List<Move> uncoverMoves);

    void onRoundEnded(PlayerId winner,
                      WinType winType,
                      int winningScore,
                      int humanTotalScore,
                      int computerTotalScore);
}
