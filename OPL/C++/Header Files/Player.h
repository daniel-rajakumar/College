#ifndef PLAYER_H
#define PLAYER_H
#include "Board.h"

/**
 * @file Player.h
 * @brief Abstract base class that represents a game participant (human or AI).
 */

/**
 * @class Player
 * @brief Abstract base class for players.
 *
 * Player provides a common interface for human and computer players. It
 * exposes utilities such as rolling a die and access to the associated board.
 */
class Player {
public:
    virtual ~Player() = default;

    /**
     * @brief Constructs a Player.
     * @param b Reference to the player's Board
     * @param human true if the player is a human, false for computer
     */
    Player(Board& b, bool human);

    /**
     * @brief Simulate rolling a single six-sided die.
     * @return Value in range [1..6]
     */
    int rollDie() const;

    /**
     * @brief Returns a const reference to the player's board.
     * @return Reference to the Board
     */
    const Board& getBoard() const;

    /**
     * @brief Delegates to the underlying board to indicate if one-die throws are allowed.
     * @return true if one-die throws may be used
     */
    bool canThrowOneDie() const;

    /**
     * @brief Execute a player's turn. Must be implemented by derived classes.
     * @return true if the turn completed successfully
     */
    virtual bool takeTurn() = 0;

    /**
     * @brief Query whether this Player represents a human.
     * @return true when the player is human
     */
    bool getIsHuman() const;

protected:
    Board& board; /**< Associated board for this player */
    bool isHuman; /**< True when this player is human */
    int input{}; /**< Temporary storage for player input (UI) */

private:
    // Private members would go here
};

#endif //PLAYER_H