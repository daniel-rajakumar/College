#pragma once
#include <vector>
#include "Stone.h"
#include "PocketCoord.h"

class Board
{
public:
    // constants
    static constexpr int SIZE = 11;

    // variables
    // (none)

    // constructor(s)
    Board();
    Board(const Board& other);

    // destructor
    ~Board() = default;

    // selector(s)
    bool isValidPocket(const PocketCoord& c) const;
    bool isEmptyPocket(const PocketCoord& c) const;
    StoneColor getStone(const PocketCoord& c) const;
    int countEmptyPockets() const;

    // mutator(s)
    bool clearBoard();
    bool placeStone(const PocketCoord& c, StoneColor stone);

    // utility functions
    std::vector<PocketCoord> getAllEmptyPockets() const;
    std::vector<PocketCoord> getEmptyPocketsInRow(int row) const;
    std::vector<PocketCoord> getEmptyPocketsInCol(int col) const;

private:
    void initializeValidMask();

    std::vector<std::vector<StoneColor>> m_grid;
    std::vector<std::vector<bool>> m_valid;
};
