#pragma once
#include <string>

class PocketCoord
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    PocketCoord();
    PocketCoord(int row, int col);

    // destructor
    ~PocketCoord() = default;

    // selector(s)
    int getRow() const;
    int getCol() const;
    bool isInBounds() const;
    std::string toString() const;

    // mutator(s)
    bool setRow(int row);
    bool setCol(int col);
    bool set(int row, int col);

    // utility functions
    bool operator==(const PocketCoord& other) const;
    bool operator!=(const PocketCoord& other) const;

private:
    int m_row;
    int m_col;
};
