//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef COMPUTER_H
#define COMPUTER_H
#include "BoardView.h"
#include "Player.h"

class Computer final : public Player {
private:
    BoardView boardView;
    BoardView humanBoardView;
    Board& humanBoard;

public:
    Computer(Board &b, Board &humanBoard);
    bool takeTurn() override;
    bool shouldCover(int sum) const;
    void coverSquares(int sum) const;
    void uncoverSquares(int sum) const;
    void provideHelp(int diceSum, const Board &humanBoard, const Board &computerBoard) const;
};

#endif //COMPUTER_H
