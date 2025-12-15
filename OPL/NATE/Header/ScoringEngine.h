#pragma once
#include <set>
#include <string>
#include "Board.h"
#include "PocketCoord.h"
#include "Stone.h"

class Player;

class ScoringEngine
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    ScoringEngine();

    // destructor
    ~ScoringEngine() = default;

    // selector(s)
    int computeNewPointsForPlayerAfterMove(const Board& board, const PocketCoord& placedAt, StoneColor playerMainColor, std::set<std::string>& awardedTriples) const;
    void rebuildAwardedTriplesFromBoard(const Board& board, StoneColor playerMainColor, std::set<std::string>& awardedTriples) const;

    // mutator(s)
    void reset();

    // utility functions
private:
    bool tripleIsScoringForPlayer(const Board& board, const PocketCoord& a, const PocketCoord& b, const PocketCoord& c, StoneColor playerMainColor) const;
    std::string tripleKey(const PocketCoord& a, const PocketCoord& b, const PocketCoord& c) const;

    bool isNonEmptyStone(StoneColor s) const;
};
