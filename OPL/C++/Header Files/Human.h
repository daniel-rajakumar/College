//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef HUMAN_H
#define HUMAN_H
#include "BoardView.h"
#include "Player.h"


class Human : public Player {
private:
    BoardView boardView;
    BoardView computerBoardView;
    Board& computerBoard;

public:
    Human(Board &b, Board &computerBoard);

    void takeTurn() override;

    void coverSquares(int sum);

    void uncoverSquares(int sum);

    void coverSquares(int sum) const;

    void uncoverSquares(int sum) const;
};



#endif //HUMAN_H
