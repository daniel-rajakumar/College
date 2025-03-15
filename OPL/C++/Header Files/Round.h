//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef ROUND_H
#define ROUND_H
#include <string>

#include "Computer.h"
#include "Human.h"
#include "Tournament.h"

class Tournament;
class Board;
class Player;

/**
 * @class Round
 * @brief Represents a round in the game.
 * 
 * The Round class manages the gameplay between two players within a single round.
 */
class Round {
private:
    Player& player1; ///< Reference to the first player.
    Player& player2; ///< Reference to the second player.
    bool isOver; ///< Flag indicating if the round is over.
    bool isHumanTurn; ///< Flag indicating if it is the human player's turn.
    Tournament& tournament; ///< Reference to the tournament.
    bool isANewGame; ///< Flag indicating if it is a new game.

public:
    /**
     * @brief Constructs a Round object.
     * 
     * @param p1 Reference to the first player.
     * @param p2 Reference to the second player.
     * @param tournament Reference to the tournament.
     */
    Round(Player &p1, Player &p2, Tournament &tournament);

    /**
     * @brief Constructs a Round object with an additional flag for a new game.
     * 
     * @param p1 Reference to the first player.
     * @param p2 Reference to the second player.
     * @param tournament Reference to the tournament.
     * @param isANewGame Flag indicating if it is a new game.
     */
    Round(Player &p1, Player &p2, Tournament &tournament, bool isANewGame);

    /**
     * @brief Plays the round.
     */
    void play() const;

    /**
     * @brief Checks if the round is over.
     * 
     * @return True if the round is over, false otherwise.
     */
    bool isRoundOver() const;

    /**
     * @brief Declares the winner of the round.
     * 
     * @param currentPlayer Pointer to the current player.
     */
    void declareWinner(const Player *currentPlayer) const;

    /**
     * @brief Determines the first player for the round.
     * 
     * @return Reference to the first player.
     */
    Player& determineFirstPlayer() const;
};

#endif //ROUND_H
