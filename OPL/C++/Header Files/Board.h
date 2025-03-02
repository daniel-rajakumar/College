//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARD_H
#define BOARD_H
#include <vector>
using namespace std;


class Board {
private:
    vector<bool> squares; // true = covered, false = uncovered
    int size;

public:
    Board(int n); // Constructor
    void coverSquare(int square);
    void uncoverSquare(int square);
    bool isSquareCovered(int square) const;
    int getSize() const;
    bool allCovered() const;
    bool allUncovered() const;
};

#endif //BOARD_H
