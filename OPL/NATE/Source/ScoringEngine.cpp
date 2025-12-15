#include "ScoringEngine.h"
#include <algorithm>
#include "Constants.h"

ScoringEngine::ScoringEngine() {}

void ScoringEngine::reset() {}

bool ScoringEngine::isNonEmptyStone(StoneColor s) const
{
    return s == StoneColor::White || s == StoneColor::Black || s == StoneColor::Clear;
}

std::string ScoringEngine::tripleKey(const PocketCoord& a, const PocketCoord& b, const PocketCoord& c) const
{
    // sort coords to make order-independent key
    std::vector<PocketCoord> v = { a, b, c };
    std::sort(v.begin(), v.end(), [](const PocketCoord& p1, const PocketCoord& p2)
        {
            if (p1.getRow() != p2.getRow()) return p1.getRow() < p2.getRow();
            return p1.getCol() < p2.getCol();
        });

    return std::to_string(v[0].getRow()) + "," + std::to_string(v[0].getCol()) + "|" +
        std::to_string(v[1].getRow()) + "," + std::to_string(v[1].getCol()) + "|" +
        std::to_string(v[2].getRow()) + "," + std::to_string(v[2].getCol());
}

bool ScoringEngine::tripleIsScoringForPlayer(const Board& board,
    const PocketCoord& a,
    const PocketCoord& b,
    const PocketCoord& c,
    StoneColor playerMainColor) const
{
    if (!board.isValidPocket(a) || !board.isValidPocket(b) || !board.isValidPocket(c)) return false;

    const StoneColor sa = board.getStone(a);
    const StoneColor sb = board.getStone(b);
    const StoneColor sc = board.getStone(c);

    if (!isNonEmptyStone(sa) || !isNonEmptyStone(sb) || !isNonEmptyStone(sc)) return false;

    // Allowed: player's main color + up to 2 clears. Not allowed: all clear.
    int clearCount = 0;
    int mainCount = 0;
    for (StoneColor s : { sa, sb, sc })
    {
        if (s == StoneColor::Clear) ++clearCount;
        else if (s == playerMainColor) ++mainCount;
        else return false; // opponent stone blocks scoring for this player
    }

    if (clearCount == 3) return false;
    return (mainCount >= 1);
}

void ScoringEngine::rebuildAwardedTriplesFromBoard(const Board& board, StoneColor playerMainColor, std::set<std::string>& awardedTriples) const
{
    // PSEUDOCODE:
    // 1) Clear awardedTriples
    // 2) Scan every possible 3-in-a-row segment in the 4 directions
    // 3) If the triple scores for this player, insert its canonical key into the set

    awardedTriples.clear();

    // Horizontal starts: (r, c) where c <= 8
    for (int r = 0; r < Constants::BOARD_SIZE; ++r)
    {
        for (int c = 0; c <= Constants::BOARD_SIZE - 3; ++c)
        {
            PocketCoord a(r, c), b(r, c + 1), d(r, c + 2);
            if (tripleIsScoringForPlayer(board, a, b, d, playerMainColor))
                awardedTriples.insert(tripleKey(a, b, d));
        }
    }

    // Vertical starts: (r, c) where r <= 8
    for (int r = 0; r <= Constants::BOARD_SIZE - 3; ++r)
    {
        for (int c = 0; c < Constants::BOARD_SIZE; ++c)
        {
            PocketCoord a(r, c), b(r + 1, c), d(r + 2, c);
            if (tripleIsScoringForPlayer(board, a, b, d, playerMainColor))
                awardedTriples.insert(tripleKey(a, b, d));
        }
    }

    // Diag down-right starts: (r, c) where r <= 8 and c <= 8
    for (int r = 0; r <= Constants::BOARD_SIZE - 3; ++r)
    {
        for (int c = 0; c <= Constants::BOARD_SIZE - 3; ++c)
        {
            PocketCoord a(r, c), b(r + 1, c + 1), d(r + 2, c + 2);
            if (tripleIsScoringForPlayer(board, a, b, d, playerMainColor))
                awardedTriples.insert(tripleKey(a, b, d));
        }
    }

    // Diag up-right starts: (r, c) where r >= 2 and c <= 8
    for (int r = 2; r < Constants::BOARD_SIZE; ++r)
    {
        for (int c = 0; c <= Constants::BOARD_SIZE - 3; ++c)
        {
            PocketCoord a(r, c), b(r - 1, c + 1), d(r - 2, c + 2);
            if (tripleIsScoringForPlayer(board, a, b, d, playerMainColor))
                awardedTriples.insert(tripleKey(a, b, d));
        }
    }
}


int ScoringEngine::computeNewPointsForPlayerAfterMove(const Board& board,
    const PocketCoord& placedAt,
    StoneColor playerMainColor,
    std::set<std::string>& awardedTriples) const
{
    // Check only triples that include placedAt, in 4 directions:
    // Horizontal, Vertical, Diag down-right, Diag up-right

    const int r = placedAt.getRow();
    const int c = placedAt.getCol();

    int points = 0;

    auto tryTriple = [&](PocketCoord a, PocketCoord b, PocketCoord d)
    {
        if (!tripleIsScoringForPlayer(board, a, b, d, playerMainColor)) return;
        const std::string key = tripleKey(a, b, d);
        if (awardedTriples.find(key) != awardedTriples.end()) return;
        awardedTriples.insert(key);
        ++points;
    };

    // For each direction, consider 3-length windows that could include (r,c)
    // Horizontal
    for (int dc = -2; dc <= 0; ++dc)
        tryTriple(PocketCoord(r, c + dc), PocketCoord(r, c + dc + 1), PocketCoord(r, c + dc + 2));

    // Vertical
    for (int dr = -2; dr <= 0; ++dr)
        tryTriple(PocketCoord(r + dr, c), PocketCoord(r + dr + 1, c), PocketCoord(r + dr + 2, c));

    // Diag down-right
    for (int d = -2; d <= 0; ++d)
        tryTriple(PocketCoord(r + d, c + d), PocketCoord(r + d + 1, c + d + 1), PocketCoord(r + d + 2, c + d + 2));

    // Diag up-right
    for (int d = -2; d <= 0; ++d)
        tryTriple(PocketCoord(r - d, c + d), PocketCoord(r - d - 1, c + d + 1), PocketCoord(r - d - 2, c + d + 2));

    return points;
}
