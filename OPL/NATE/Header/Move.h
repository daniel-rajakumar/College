#pragma once
#include <string>
#include "PocketCoord.h"
#include "Stone.h"

class Move
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    Move();
    Move(const PocketCoord& coord, StoneColor stone);

    // destructor
    ~Move() = default;

    // selector(s)
    const PocketCoord& getCoord() const;
    StoneColor getStone() const;
    bool isValid() const;
    std::string toString() const;

    // mutator(s)
    bool setCoord(const PocketCoord& coord);
    bool setStone(StoneColor stone);

    // utility functions
private:
    PocketCoord m_coord;
    StoneColor m_stone;
    bool m_valid;
};
