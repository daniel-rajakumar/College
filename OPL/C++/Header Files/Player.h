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
        Player(Board& b, bool human); // Constructor
        int rollDie() const;

        Board &getBoard() const;

        bool canThrowOneDie() const;

        virtual void takeTurn() = 0; // Pure virtual function
        bool getIsHuman() const;
};




#endif //PLAYER_H
