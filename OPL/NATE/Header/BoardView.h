#pragma once
#include "Board.h"

class BoardView
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    BoardView() = default;

    // destructor
    ~BoardView() = default;

    // selector(s)
    void printBoard(const Board& board) const;

    // mutator(s)
    // (none)

    // utility functions
private:
    char stoneToChar(StoneColor c) const;
};
