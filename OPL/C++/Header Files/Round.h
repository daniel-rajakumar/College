#ifndef ROUND_H
#define ROUND_H

#include "Human.h"
#include "Tournament.h"

class Tournament;
class Board;
class Player;

/**
 * @file Round.h
 * @brief Declares Round which coordinates gameplay for a single round.
 */

/**
 * @class Round
 * @brief Manages the gameplay within a single round.
 */
class Round {
public:
    /**
     * @brief Constructs a Round controller.
     * @param p1 First player (could be human or computer)
     * @param p2 Second player
     * @param tournament Reference to the overall Tournament state
     * @param isANewGame true when starting a fresh game (affects advantage handling)
     */
    Round(Player &p1, Player &p2, Tournament &tournament, bool isANewGame);

    /**
     * @brief Plays the round until completion.
     */
    void play() const;

    /**
     * @brief Returns whether the round has finished.
     * @return true if the round is over
     */
    bool isRoundOver() const;

    /**
     * @brief Announces the winner of the round to the tournament/UI.
     * @param currentPlayer The player that currently took the action
     * @param winnerWasFirstPlayer true when the winner was player1 in this Round's ordering
     */
    void declareWinner(const Player* currentPlayer, bool winnerWasFirstPlayer) const;

    /**
     * @brief Determine which player should take the first turn for this round.
     * @return Reference to the player who will go first
     */
    Player& determineFirstPlayer() const;

private:
    Player& player1; /**< First player reference internally */
    Player& player2; /**< Second player reference internally */
    bool isOver; /**< Whether this round has completed */
    bool isHumanTurn{}; /**< Tracks whether it is the human's turn */
    Tournament& tournament; /**< Tournament state this round belongs to */
    bool isANewGame; /**< True when the round is part of a new game */
};

#endif //ROUND_H