#ifndef BOARD_H
#define BOARD_H
#include <set>
#include <vector>

class Board {
public:
    static constexpr int ONE_DIE_RULE_START = 7;

private:
    std::vector<bool> squares;
    int size;

public:
    Board() : squares(), size(0) {}
    explicit Board(int n) : squares(n, false), size(n) {}
    Board(const Board&) = default;

    bool coverSquare(int square);
    bool uncoverSquare(int square);
    bool isSquareCovered(int square) const;
    int getSize() const;
    bool allCovered() const;
    bool allUncovered() const;
    int getUncoveredSum() const;
    int getCoveredSum() const;
    std::set<std::set<int>> findValidCombinations(int sum, bool forCovering) const;
    bool isValidCombination(const std::set<int> &combination, bool forCovering) const;
    bool canThrowOneDie() const;
};

#endif
