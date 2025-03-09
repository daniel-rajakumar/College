//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARD_H
#define BOARD_H
#include <set>
#include <vector>
using namespace std;


class Board {
private:
    vector<bool> squares; // true = covered, false = uncovered
    int size;

public:
    explicit Board(int n); // Constructor
    void coverSquare(int square);
    void uncoverSquare(int square);
    bool isSquareCovered(int square) const;
    int getSize() const;
    bool allCovered() const;
    bool allUncovered() const;

    int getUncoveredSum() const;

    int getCoveredSum() const;

    set<set<int>> findValidCombinations(int sum, bool forCovering) const;

    bool isValidCombination(const set<int> &combination, bool forCovering) const;
};

#endif //BOARD_H
