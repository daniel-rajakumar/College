#ifndef ROUND_H
#define ROUND_H

#include "Human.h"
#include "Tournament.h"

class Tournament;
class Board;
class Player;

/**
 * @class Round
 * @brief Manages the gameplay within a single round.
 */
class Round {
public:
    Round(Player &p1, Player &p2, Tournament &tournament, bool isANewGame);
    void play() const;
    bool isRoundOver() const;
    void declareWinner(const Player* currentPlayer, bool winnerWasFirstPlayer) const;
    Player& determineFirstPlayer() const;

private:
    Player& player1; 
    Player& player2; 
    bool isOver; 
    bool isHumanTurn{}; 
    Tournament& tournament; 
    bool isANewGame; 
};

#endif //ROUND_H