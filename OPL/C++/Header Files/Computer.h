//
// Created by Daniel Rajakumar on 2/10/25.
//

/**
 * @file Computer.h
 * @brief Declaration of the Computer player class (AI-controlled player).
 */

#ifndef COMPUTER_H
#define COMPUTER_H
#include "BoardView.h"
#include "Player.h"

/**
 * @class Computer
 * @brief AI player implementation. Inherits from Player and provides
 * automated decision-making for covering/uncovering squares.
 */
class Computer final : public Player {
private:
    BoardView boardView; /**< View of the computer's own board */
    BoardView humanBoardView; /**< View of the human's board used for help/analysis */
    Board& humanBoard; /**< Reference to the human's board */

public:
    /**
     * @brief Constructs a Computer player.
     * @param b Reference to the computer's board
     * @param humanBoard Reference to the human's board
     */
    Computer(Board &b, Board &humanBoard);

    /**
     * @brief Performs the computer's turn.
     * @return true if the computer completed its turn successfully
     */
    bool takeTurn() override;

    /**
     * @brief Decides if the computer should cover given a dice sum.
     * @param sum Dice sum
     * @return true if the AI chooses to cover squares for the provided sum
     */
    bool shouldCover(int sum) const;

    /**
     * @brief Covers squares on the computer's board corresponding to the sum.
     * @param sum Dice sum
     */
    void coverSquares(int sum) const;

    /**
     * @brief Uncovers squares on the computer's board corresponding to the sum.
     * @param sum Dice sum
     */
    void uncoverSquares(int sum) const;

    /**
     * @brief Provides help or analysis information (used for debugging or hints).
     * @param diceSum Sum rolled on the dice
     * @param humanBoard Reference to human board state
     * @param computerBoard Reference to computer board state
     */
    void provideHelp(int diceSum, const Board &humanBoard, const Board &computerBoard) const;
};

#endif //COMPUTER_H
