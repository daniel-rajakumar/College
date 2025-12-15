#include "PocketCoord.h"
#include "Constants.h"

PocketCoord::PocketCoord() : m_row(0), m_col(0) {}

PocketCoord::PocketCoord(int row, int col) : m_row(0), m_col(0)
{
    set(row, col);
}

int PocketCoord::getRow() const { return m_row; }
int PocketCoord::getCol() const { return m_col; }

bool PocketCoord::isInBounds() const
{
    return (m_row >= 0 && m_row < Constants::BOARD_SIZE &&
        m_col >= 0 && m_col < Constants::BOARD_SIZE);
}

std::string PocketCoord::toString() const
{
    return "(" + std::to_string(m_row) + "," + std::to_string(m_col) + ")";
}

bool PocketCoord::setRow(int row)
{
    if (row < 0 || row >= Constants::BOARD_SIZE) return false;
    m_row = row;
    return true;
}

bool PocketCoord::setCol(int col)
{
    if (col < 0 || col >= Constants::BOARD_SIZE) return false;
    m_col = col;
    return true;
}

bool PocketCoord::set(int row, int col)
{
    if (row < 0 || row >= Constants::BOARD_SIZE) return false;
    if (col < 0 || col >= Constants::BOARD_SIZE) return false;
    m_row = row;
    m_col = col;
    return true;
}

bool PocketCoord::operator==(const PocketCoord& other) const
{
    return m_row == other.m_row && m_col == other.m_col;
}

bool PocketCoord::operator!=(const PocketCoord& other) const
{
    return !(*this == other);
}
