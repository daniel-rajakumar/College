package com.example.canoga.controller;

import com.example.canoga.model.GameRound;
import com.example.canoga.view.BoardView;

public class GameController {
    private GameRound gameRound;
    private BoardView boardView;

    /**
     * Constructs the controller with a game round and a view.
     * @param gameRound The current game round.
     * @param boardView The view that displays the board.
     */
    public GameController(GameRound gameRound, BoardView boardView) {
        this.gameRound = gameRound;
        this.boardView = boardView;
        boardView.setBoard(gameRound.getBoard());
    }

    /**
     * Plays one turn and updates the view.
     */
    public void playTurn() {
        gameRound.playTurn();
        boardView.invalidate();
    }

    /**
     * Returns a serialized representation of the game state.
     * @return Serialized game state.
     */
    public String getSerializedGameState() {
        return gameRound.serialize();
    }
}
