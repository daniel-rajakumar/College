//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Board.h"

#include <set>

Board::Board(const int n): squares(n, false), size(n) {}

// Cover a square
void Board::coverSquare(int square) {
    if (square >= 1 && square <= size) {
        squares[square - 1] = true;
    }
}

// Uncover a square
void Board::uncoverSquare(int square) {
    if (square >= 1 && square <= size) {
        squares[square - 1] = false;
    }
}

// Check if a square is covered
bool Board::isSquareCovered(int square) const {
    if (square >= 1 && square <= size) {
        return squares[square - 1];
    }
    return false;
}

// Get the size of the board
int Board::getSize() const {
    return size;
}

// Check if all squares are covered
bool Board::allCovered() const {
    for (bool square : squares) {
        if (!square) return false;
    }
    return true;
}

// Check if all squares are uncovered
bool Board::allUncovered() const {
    for (bool square : squares) {
        if (square) return false;
    }
    return true;
}

// Get the sum of uncovered squares
int Board::getUncoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (!isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

// Get the sum of covered squares
int Board::getCoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

// Find all valid combinations of squares that add up to the sum
set<set<int>> Board::findValidCombinations(const int sum, const bool forCovering) const {
    set<set<int>> combinations;
    for (int i = 1; i <= size; ++i) {
        if ((forCovering && !isSquareCovered(i)) || (!forCovering && isSquareCovered(i))) {
            if (i == sum) {
                combinations.insert({i});
            } else if (i < sum) {
                set<set<int>> subCombinations = findValidCombinations(sum - i, forCovering);
                for (const set<int>& subCombination : subCombinations) {
                    if (!subCombination.contains(i)) {
                        set<int> combination = subCombination;
                        combination.insert(i);
                        combinations.insert(combination);
                    }
                }
            }
        }
    }
    return combinations;
}

// Check if a combination is valid
bool Board::isValidCombination(const set<int>& combination, bool forCovering) const {
    for (const int square : combination) {
        if ((forCovering && isSquareCovered(square)) || (!forCovering && !isSquareCovered(square))) {
            return false;
        }
    }
    return true;
}