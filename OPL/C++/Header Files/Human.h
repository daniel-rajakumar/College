//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef HUMAN_H
#define HUMAN_H
#include "BoardView.h"
#include "Player.h"


class Human : public Player {
private:
    BoardView boardView; // Add a BoardView object

public:
    Human(Board& b); // Constructor
    void takeTurn() override;
};



#endif //HUMAN_H
