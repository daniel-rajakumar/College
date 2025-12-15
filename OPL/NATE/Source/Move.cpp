#include "Move.h"

Move::Move() : m_coord(), m_stone(StoneColor::Empty), m_valid(false) {}

Move::Move(const PocketCoord& coord, StoneColor stone)
    : m_coord(coord), m_stone(stone), m_valid(isPlayableStone(stone) && coord.isInBounds())
{
}

const PocketCoord& Move::getCoord() const { return m_coord; }
StoneColor Move::getStone() const { return m_stone; }

bool Move::isValid() const { return m_valid; }

std::string Move::toString() const
{
    return m_coord.toString() + " " + stoneColorToString(m_stone);
}

bool Move::setCoord(const PocketCoord& coord)
{
    if (!coord.isInBounds()) return false;
    m_coord = coord;
    m_valid = isPlayableStone(m_stone) && m_coord.isInBounds();
    return true;
}

bool Move::setStone(StoneColor stone)
{
    if (!isPlayableStone(stone)) return false;
    m_stone = stone;
    m_valid = isPlayableStone(m_stone) && m_coord.isInBounds();
    return true;
}
