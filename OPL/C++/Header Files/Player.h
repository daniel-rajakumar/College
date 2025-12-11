#ifndef PLAYER_H
#define PLAYER_H
#include "Board.h"

/**
 * @class Player
 * @brief Abstract base class for players.
 */
class Player {
public:
    virtual ~Player() = default;

    Player(Board& b, bool human);
    int rollDie() const;
    const Board& getBoard() const;
    bool canThrowOneDie() const;
    virtual bool takeTurn() = 0;
    bool getIsHuman() const;

protected:
    Board& board; 
    bool isHuman; 
    int input{}; 

private:
    // Private members would go here
};

#endif //PLAYER_H