//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef COMPUTER_H
#define COMPUTER_H
#include "BoardView.h"
#include "Player.h"


class Computer: public Player {
private:
    BoardView boardView; // Add a BoardView object

public:
    Computer(Board& b); // Constructor
    void takeTurn() override;
};



#endif //COMPUTER_H
