//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef PLAYER_H
#define PLAYER_H
using namespace std;
#include "Board.h"

class Player {
    protected:
        Board& board;
        bool isHuman;
        int input{};


    public:
        Player(Board& b, bool human);
        int rollDie() const;

        Board &getBoard() const;

        bool canThrowOneDie() const;

        virtual bool takeTurn() = 0;
        bool getIsHuman() const;
};




#endif //PLAYER_H
