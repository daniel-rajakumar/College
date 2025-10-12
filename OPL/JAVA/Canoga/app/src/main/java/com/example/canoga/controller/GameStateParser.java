package com.example.canoga.controller;

import com.example.canoga.model.Board;
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;

/**
 * Parses the serialized game state data and updates the corresponding models.
 * <p>
 * This class is responsible for interpreting the game state data and creating instances of
 * GameRound, Board, Human, and Computer based on the parsed information.
 */
public class GameStateParser {

    /**
     * Parses the provided game state data and updates the corresponding models.
     *
     * @param data the serialized game state data
     * @return a new GameRound instance with the parsed state
     */
    public static GameRound parse(String data) {
        String[] lines = data.split("\n");
        int boardSize = 0;
        int computerScore = 0;
        int humanScore = 0;
        boolean[] computerSquares = null;
        boolean[] humanSquares = null;
        boolean isHumanTurn = false; // Determined by the "Next Turn:" line

        String currentSection = "";
        for (String line : lines) {
            line = line.trim();
            // Skip empty lines.
            if (line.isEmpty()) {
                continue;
            }

            // Identify section headers.
            if (line.startsWith("Computer:")) {
                currentSection = "Computer";
                continue;
            } else if (line.startsWith("Human:")) {
                currentSection = "Human";
                continue;
            } else if (line.startsWith("First Turn:")) {
                // This line is ignored because "Next Turn:" determines the current turn.
                continue;
            } else if (line.startsWith("Next Turn:")) {
                String nextTurn = line.split(":")[1].trim();
                isHumanTurn = nextTurn.equalsIgnoreCase("Human");
                continue;
            }

            // Process section details.
            if (currentSection.equals("Computer")) {
                if (line.startsWith("Squares:")) {
                    String[] tokens = line.substring("Squares:".length()).trim().split(" ");
                    boardSize = tokens.length; // Set board size based on tokens count.
                    computerSquares = new boolean[boardSize];
                    // Mark squares as covered if token != 0.
                    for (int i = 0; i < tokens.length; i++) {
                        int val = Integer.parseInt(tokens[i]);
                        computerSquares[i] = (val != 0);
                    }
                } else if (line.startsWith("Score:")) {
                    computerScore = Integer.parseInt(line.substring("Score:".length()).trim());
                }
            } else if (currentSection.equals("Human")) {
                if (line.startsWith("Squares:")) {
                    String[] tokens = line.substring("Squares:".length()).trim().split(" ");
                    if (boardSize == 0) {
                        boardSize = tokens.length;
                    }
                    humanSquares = new boolean[boardSize];
                    // Mark squares as covered if token != 0.
                    for (int i = 0; i < tokens.length; i++) {
                        int val = Integer.parseInt(tokens[i]);
                        humanSquares[i] = (val != 0);
                    }
                } else if (line.startsWith("Score:")) {
                    humanScore = Integer.parseInt(line.substring("Score:".length()).trim());
                }
            }
        }

        // Create and update a new Board.
        Board board = new Board(boardSize);
        boolean[] boardHuman = board.getHumanSquares();
        boolean[] boardComputer = board.getComputerSquares();
        // Invert value: parser indicates "1" means covered, so update board accordingly.
        if (humanSquares != null) {
            for (int i = 0; i < boardSize; i++) {
                // In our board, a false value means uncovered.
                boardHuman[i] = !humanSquares[i];
            }
        }
        if (computerSquares != null) {
            for (int i = 0; i < boardSize; i++) {
                boardComputer[i] = !computerSquares[i];
            }
        }

        // Create Human and Computer players and update their scores.
        Human human = new Human(board);
        human.updateScore(humanScore);
        Computer computer = new Computer(board);
        computer.updateScore(computerScore);

        // Create a new GameRound and set its state.
        GameRound round = new GameRound(boardSize);
        round.setBoard(board);
        round.setHuman(human);
        round.setComputer(computer);
        round.setHumanTurn(isHumanTurn);

        board.recomputeCounts(); // <— LAST line of the ctor

        return round;
    }
}
