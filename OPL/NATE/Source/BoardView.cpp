#include "BoardView.h"
#include <iostream>
#include "Constants.h"

char BoardView::stoneToChar(StoneColor c) const
{
    switch (c)
    {
    case StoneColor::White: return Constants::CHAR_WHITE;
    case StoneColor::Black: return Constants::CHAR_BLACK;
    case StoneColor::Clear: return Constants::CHAR_CLEAR;
    case StoneColor::Empty: return Constants::CHAR_EMPTY;
    default: return '?';
    }
}

void BoardView::printBoard(const Board& board) const
{
    std::cout << "    ";
    for (int c = 0; c < Constants::BOARD_SIZE; ++c)
        std::cout << c << " ";
    std::cout << "\n";

    for (int r = 0; r < Constants::BOARD_SIZE; ++r)
    {
        std::cout << r << (r < 10 ? "   " : "  ");
        for (int c = 0; c < Constants::BOARD_SIZE; ++c)
        {
            PocketCoord pc(r, c);
            if (!board.isValidPocket(pc))
            {
                std::cout << "  ";
            }
            else
            {
                std::cout << stoneToChar(board.getStone(pc)) << " ";
            }
        }
        std::cout << "\n";
    }
}
