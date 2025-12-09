//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef PLAYER_H
#define PLAYER_H
#include "Board.h"

/**
 * @class Player
 * @brief Represents a player in the game.
 * 
 * The Player class is an abstract base class that provides common functionality
 * for both human and computer players.
 */
class Player {
protected:
    Board& board; ///< Reference to the player's board.
    bool isHuman; ///< Flag indicating if the player is human.
    int input{}; ///< Input value for the player.

public:
    virtual ~Player() = default;

    /**
     * @brief Constructs a Player object.
     * 
     * @param b Reference to the player's board.
     * @param human Flag indicating if the player is human.
     */
    Player(Board& b, bool human);

    /**
     * @brief Rolls a die and returns the result.
     * 
     * @return The result of the die roll.
     */
    int rollDie() const;

    /**
     * @brief Gets the player's board.
     * 
     * @return Reference to the player's board.
     */
    const Board& getBoard() const;

    /**
     * @brief Determines if the player can throw one die.
     * 
     * @return True if the player can throw one die, false otherwise.
     */
    bool canThrowOneDie() const;

    /**
     * @brief Takes a turn for the player.
     * 
     * This is a pure virtual function that must be implemented by derived classes.
     * 
     * @return True if the turn was successful, false otherwise.
     */
    virtual bool takeTurn() = 0;

    /**
     * @brief Gets whether the player is human.
     * 
     * @return True if the player is human, false otherwise.
     */
    bool getIsHuman() const;
};

#endif //PLAYER_H
