package com.example.canoga.controller;

import com.example.canoga.model.Board;
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;

/**
 * Parses a serialized game state from a text file and updates the models.
 * Expected file format:
 *
 * Computer:
 *    Squares: 0 2 0 4 5 0 7 0 0
 *    Score: 34
 *
 * Human:
 *    Squares: 1 2 0 4 5 6 0 0 0
 *    Score: 36
 *
 * First Turn: Computer
 * Next Turn: Human
 */
public class GameStateParser {

    public static GameRound parse(String data) {
        String[] lines = data.split("\n");
        int boardSize = 0;
        int computerScore = 0;
        int humanScore = 0;
        boolean[] computerSquares = null;
        boolean[] humanSquares = null;
        boolean isHumanTurn = false; // will be determined by "Next Turn:" line

        String currentSection = "";
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            if (line.startsWith("Computer:")) {
                currentSection = "Computer";
                continue;
            } else if (line.startsWith("Human:")) {
                currentSection = "Human";
                continue;
            } else if (line.startsWith("First Turn:")) {
                // We can ignore this if we only use "Next Turn:" for current turn.
                continue;
            } else if (line.startsWith("Next Turn:")) {
                String nextTurn = line.split(":")[1].trim();
                isHumanTurn = nextTurn.equalsIgnoreCase("Human");
                continue;
            }

            if (currentSection.equals("Computer")) {
                if (line.startsWith("Squares:")) {
                    String[] tokens = line.substring("Squares:".length()).trim().split(" ");
                    boardSize = tokens.length;
                    computerSquares = new boolean[boardSize];
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
                    // If boardSize hasn't been set, use tokens.length.
                    if (boardSize == 0) {
                        boardSize = tokens.length;
                    }
                    humanSquares = new boolean[boardSize];
                    for (int i = 0; i < tokens.length; i++) {
                        int val = Integer.parseInt(tokens[i]);
                        humanSquares[i] = (val != 0);
                    }
                } else if (line.startsWith("Score:")) {
                    humanScore = Integer.parseInt(line.substring("Score:".length()).trim());
                }
            }
        }

        // Create a new Board and update its state.
        Board board = new Board(boardSize);
        // Assume board.getHumanSquares() returns a boolean[] that can be updated.
        boolean[] boardHuman = board.getHumanSquares();
        boolean[] boardComputer = board.getComputerSquares();
        if (humanSquares != null) {
            for (int i = 0; i < boardSize; i++) {
                boardHuman[i] = !humanSquares[i];
            }
        }
        if (computerSquares != null) {
            for (int i = 0; i < boardSize; i++) {
                boardComputer[i] = !computerSquares[i];
            }
        }

        // Create player objects and update their scores.
        Human human = new Human(board);
        human.updateScore(humanScore);
        Computer computer = new Computer(board);
        computer.updateScore(computerScore);

        // Create a new GameRound and update its state.
        GameRound round = new GameRound(boardSize);
        round.setBoard(board);
        round.setHuman(human);
        round.setComputer(computer);
        round.setHumanTurn(isHumanTurn);

        return round;
    }
}
