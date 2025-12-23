//
// Created by Daniel Rajakumar on 2/10/25.
//

/**
 * @file Human.h
 * @brief Declaration of the Human player class (player-controlled input).
 */

#ifndef HUMAN_H
#define HUMAN_H
#include "BoardView.h"
#include "Player.h"

/**
 * @class Human
 * @brief Represents a human player in the game.
 * 
 * The Human class inherits from the Player class and provides
 * functionality specific to a human-controlled player.
 */
class Human final : public Player {
private:
    BoardView boardView; ///< The human player's view of their own board.
    BoardView computerBoardView; ///< The human player's view of the computer's board.
    Board& computerBoard; ///< Reference to the computer's board.

public:
    /**
     * @brief Constructs a Human object.
     * 
     * @param b Reference to the human player's board.
     * @param computerBoard Reference to the computer's board.
     */
    Human(Board &b, Board &computerBoard);

    /**
     * @brief Takes a turn for the human player.
     * 
     * @return True if the turn was successful, false otherwise.
     */
    bool takeTurn() override;

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
    void uncoverSquares(int sum) const;
};

#endif //HUMAN_H
