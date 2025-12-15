#include "Board.h"
#include "Constants.h"

Board::Board()
    : m_grid(SIZE, std::vector<StoneColor>(SIZE, StoneColor::Empty)),
    m_valid(SIZE, std::vector<bool>(SIZE, false))
{
    initializeValidMask();
}

Board::Board(const Board& other)
    : m_grid(other.m_grid), m_valid(other.m_valid)
{
}

void Board::initializeValidMask()
{
    // Diamond layout from your save files:
    // row pockets: 3,5,7,9,11,10,11,9,7,5,3 with missing center at (5,5)

    for (int r = 0; r < SIZE; ++r)
        for (int c = 0; c < SIZE; ++c)
            m_valid[r][c] = false;

    auto markRange = [&](int row, int cStart, int cEnd)
    {
        for (int c = cStart; c <= cEnd; ++c)
            m_valid[row][c] = true;
    };

    markRange(0, 4, 6);
    markRange(1, 3, 7);
    markRange(2, 2, 8);
    markRange(3, 1, 9);
    markRange(4, 0, 10);
    markRange(5, 0, 10);
    markRange(6, 0, 10);
    markRange(7, 1, 9);
    markRange(8, 2, 8);
    markRange(9, 3, 7);
    markRange(10, 4, 6);

    // Missing center pocket
    m_valid[Constants::CENTER_ROW][Constants::CENTER_COL] = false;
}

bool Board::isValidPocket(const PocketCoord& c) const
{
    if (!c.isInBounds()) return false;
    return m_valid[c.getRow()][c.getCol()];
}

bool Board::isEmptyPocket(const PocketCoord& c) const
{
    if (!isValidPocket(c)) return false;
    return m_grid[c.getRow()][c.getCol()] == StoneColor::Empty;
}

StoneColor Board::getStone(const PocketCoord& c) const
{
    if (!isValidPocket(c)) return StoneColor::Empty;
    return m_grid[c.getRow()][c.getCol()];
}

int Board::countEmptyPockets() const
{
    int count = 0;
    for (int r = 0; r < SIZE; ++r)
        for (int c = 0; c < SIZE; ++c)
            if (m_valid[r][c] && m_grid[r][c] == StoneColor::Empty)
                ++count;
    return count;
}

bool Board::clearBoard()
{
    for (int r = 0; r < SIZE; ++r)
        for (int c = 0; c < SIZE; ++c)
            if (m_valid[r][c])
                m_grid[r][c] = StoneColor::Empty;
    return true;
}

bool Board::placeStone(const PocketCoord& c, StoneColor stone)
{
    if (!isPlayableStone(stone)) return false;
    if (!isValidPocket(c)) return false;
    if (!isEmptyPocket(c)) return false;

    m_grid[c.getRow()][c.getCol()] = stone;
    return true;
}

std::vector<PocketCoord> Board::getAllEmptyPockets() const
{
    std::vector<PocketCoord> out;
    for (int r = 0; r < SIZE; ++r)
        for (int c = 0; c < SIZE; ++c)
            if (m_valid[r][c] && m_grid[r][c] == StoneColor::Empty)
                out.emplace_back(r, c);
    return out;
}

std::vector<PocketCoord> Board::getEmptyPocketsInRow(int row) const
{
    std::vector<PocketCoord> out;
    if (row < 0 || row >= SIZE) return out;

    for (int c = 0; c < SIZE; ++c)
    {
        if (m_valid[row][c] && m_grid[row][c] == StoneColor::Empty)
            out.emplace_back(row, c);
    }
    return out;
}

std::vector<PocketCoord> Board::getEmptyPocketsInCol(int col) const
{
    std::vector<PocketCoord> out;
    if (col < 0 || col >= SIZE) return out;

    for (int r = 0; r < SIZE; ++r)
    {
        if (m_valid[r][col] && m_grid[r][col] == StoneColor::Empty)
            out.emplace_back(r, col);
    }
    return out;
}
