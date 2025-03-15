//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef COMPUTER_H
#define COMPUTER_H
#include "BoardView.h"
#include "Player.h"

/**
 * @class Computer
 * @brief Represents a computer player in the game.
 * 
 * The Computer class inherits from the Player class and provides
 * functionality specific to a computer-controlled player.
 */
class Computer: public Player {
private:
    BoardView boardView; ///< The computer's view of its own board.
    BoardView humanBoardView; ///< The computer's view of the human player's board.
    Board& humanBoard; ///< Reference to the human player's board.

public:
    /**
     * @brief Constructs a Computer object.
     * 
     * @param b Reference to the computer's board.
     * @param humanBoard Reference to the human player's board.
     */
    Computer(Board &b, Board &humanBoard);

    /**
     * @brief Takes a turn for the computer player.
     * 
     * @return True if the turn was successful, false otherwise.
     */
    bool takeTurn() override;

    /**
     * @brief Determines if the computer should cover squares based on the sum.
     * 
     * @param sum The sum of the dice.
     * @return True if the computer should cover squares, false otherwise.
     */
    bool shouldCover(int sum) const;

    /**
     * @brief Covers squares on the board based on the sum.
     * 
     * @param sum The sum of the dice.
     */
    void coverSquares(int sum) const;

    /**
     * @brief Uncovers squares on the board based on the sum.
     * 
     * @param sum The sum of the dice.
     */
    void uncoverSquares(int sum);

    /**
     * @brief Provides help to the human player by suggesting moves.
     * 
     * @param diceSum The sum of the dice.
     * @param humanBoard Reference to the human player's board.
     * @param computerBoard Reference to the computer's board.
     */
    void provideHelp(int diceSum, const Board &humanBoard, const Board &computerBoard) const;

    /**
     * @brief Uncovers squares on the board based on the sum.
     * 
     * @param sum The sum of the dice.
     */
    void uncoverSquares(int sum) const;
};

#endif //COMPUTER_H
