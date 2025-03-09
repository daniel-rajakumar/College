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
    BoardView humanBoardView;
    Board& humanBoard;

public:
    Computer(Board &b, Board &humanBoard);

    void takeTurn() override;

    bool shouldCover(int sum) const;

    void coverSquares(int sum) const;

    void uncoverSquares(int sum);

    void uncoverSquares(int sum) const;
};



#endif //COMPUTER_H
