package com.example.canoga.model;

import androidx.annotation.NonNull;
import java.io.Serializable;
import java.util.Random;

/**
 * Manages a single game round.
 * <p>
 * This class encapsulates the board, players, turn management, and game state serialization.
 */
public class GameRound implements Serializable {
    private Board board;
    private Human human;
    private Computer computer;
    private boolean isHumanTurn;
    private Random random;

    private Player winner;
    private int winnerScore;

    /**
     * Constructs a game round with a chosen board size.
     *
     * @param boardSize the board size (9, 10, or 11)
     */
    public GameRound(int boardSize) {
        board = new Board(boardSize);
        human = new Human(board);
        computer = new Computer(board);
        random = new Random();
        // Default turn set to human. This can be overridden by loaded game data.
//        isHumanTurn = true;
        isHumanTurn = decideFirstPlayer();

        winner = null;
        winnerScore = 0;
    }


    /**
     * Decides the first player by simulating dice rolls for both players.
     *
     * @return true if the human wins the toss; false if the computer wins
     */
    private boolean decideFirstPlayer() {
        int humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        int computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        // Repeat until there is a tie-breaker.
        while (humanRoll == computerRoll) {
            humanRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
            computerRoll = (random.nextInt(6) + 1) + (random.nextInt(6) + 1);
        }
        return humanRoll > computerRoll;
    }

    /**
     * Plays the computer's turn based on the dice sum.
     * <p>
     * The computer attempts its move and the current turn is switched accordingly.
     *
     * @param diceSum the total value of the dice thrown
     * @return true if the computer successfully plays its turn; false otherwise
     */

    private String lastHelp;

    public void setLastHelp(String help) {
        this.lastHelp = help;
    }

    public String getLastHelp() {
        return lastHelp;
    }

    /**
     * Simulates throwing two dice.
     *
     * @return the sum of two dice rolls
     */
    private int throwDice() {
        int die1 = random.nextInt(6) + 1;
        int die2 = random.nextInt(6) + 1;
        return die1 + die2;
    }

    /**
     * Serializes the current game state into a string representation.
     *
     * @return a string representing the current game state
     */
    public String serialize() {
        StringBuilder sb = new StringBuilder();
        sb.append("Board Size: ").append(board.getSize()).append("\n");
        sb.append("Human Score: ").append(human.getScore()).append("\n");
        sb.append("Computer Score: ").append(computer.getScore()).append("\n");
        sb.append("Human Squares: ");
        for (boolean covered : board.getHumanSquares()) {
            sb.append(covered ? "1 " : "0 ");
        }
        sb.append("\nComputer Squares: ");
        for (boolean covered : board.getComputerSquares()) {
            sb.append(covered ? "1 " : "0 ");
        }
        sb.append("\nNext Turn: ").append(isHumanTurn ? "Human" : "Computer");
        return sb.toString();
    }

    // === Setters used by parsers to restore saved game state ===

    /**
     * Sets the board.
     *
     * @param board the board to set
     */
    public void setBoard(Board board) {
        this.board = board;
    }

    /**
     * Sets the human player.
     *
     * @param human the human player to set
     */
    public void setHuman(Human human) {
        this.human = human;
    }

    /**
     * Sets the computer player.
     *
     * @param computer the computer player to set
     */
    public void setComputer(Computer computer) {
        this.computer = computer;
    }

    /**
     * Sets the current turn.
     *
     * @param isHumanTurn true if it is the human's turn; false otherwise
     */
    public void setHumanTurn(boolean isHumanTurn) {
        this.isHumanTurn = isHumanTurn;
    }

    // === Getters ===

    /**
     * Returns the human player.
     *
     * @return the human player
     */
    public Human getHuman() {
        return human;
    }

    /**
     * Returns the computer player.
     *
     * @return the computer player
     */
    public Computer getComputer() {
        return computer;
    }

    /**
     * Returns the game board.
     *
     * @return the board
     */
    public Board getBoard() {
        return board;
    }

    /**
     * Returns true if it is currently the human's turn.
     *
     * @return true if human's turn; false otherwise
     */
    public boolean isHumanTurn() {
        return isHumanTurn;
    }

    /**
     * Returns the current player.
     *
     * @return the current player (human or computer)
     */
    public Player getCurrentPlayer() {
        return isHumanTurn ? human : computer;
    }

    /**
     * Returns the name of the current player.
     *
     * @return "Human" if it's the human's turn; otherwise "Computer"
     */
    public String getCurrentPlayerName() {
        return isHumanTurn ? "Human" : "Computer";
    }

    /**
     * Determines the winner based on the players' scores.
     *
     * @return "human" if the human wins, "computer" if the computer wins, or "draw" on a tie
     */
    public String getWinner() {
        if (human.getScore() > computer.getScore()) {
            return "human";
        } else if (computer.getScore() > human.getScore()) {
            return "computer";
        }
        return "draw";
    }

    /**
     * Sets the winning player.
     *
     * @param winner the player who won the game
     */
    public void setWinner(Player winner) {
        this.winner = winner;
    }

    /**
     * Returns the winning player.
     *
     * @return the winning player; may be null if no winner has been determined
     */
    public Player getWinnerPlayer() {
        return winner;
    }

    /**
     * Returns the name of the winner.
     *
     * @return "Human", "Computer", or "Draw" if there is a tie or no winner
     */
    public String getWinnerName() {
        if (winner == human) {
            return "Human";
        } else if (winner == computer) {
            return "Computer";
        }
        return "Draw";
    }

    /**
     * Sets the winner's score.
     *
     * @param winnerScore the score of the winning player
     */
    public void setWinnerScore(int winnerScore) {
        this.winnerScore = winnerScore;
    }

    /**
     * Returns the winner's score.
     *
     * @return the winner's score
     */
    public int getWinnerScore() {
        return winnerScore;
    }

    /**
     * Sets the current player based on a string value.
     *
     * @param playerName "Human" to set human's turn; any other value sets it to computer's turn.
     */
    public void setCurrentPlayer(String playerName) {
        isHumanTurn = playerName.equals("Human");
    }

    // ==== NEW: have the computer take a single move given a dice sum ====
    // Have the computer take a single move given a dice sum.
    public boolean playComputerTurn(int diceSum) {
        com.example.canoga.model.Player computer = getComputer();
        if (!(computer instanceof com.example.canoga.model.Computer)) {
            throw new IllegalStateException("Computer player is not instance of Computer");
        }
        com.example.canoga.model.Computer ai = (com.example.canoga.model.Computer) computer;

        boolean moved = ai.makeMove(diceSum);

        // Optional: log the AI's rationale for Help/debug
        System.out.println(ai.getStrategyExplanation());

        return moved;
    }


}
