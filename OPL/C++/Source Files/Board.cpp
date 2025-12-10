#include "../Header Files/Board.h"
#include <set>
using namespace std;

bool Board::coverSquare(const int square) {
    if (square >= 1 && square <= size && !squares[square - 1]) {
        squares[square - 1] = true;
        return true;
    }
    return false;
}

bool Board::uncoverSquare(const int square) {
    if (square >= 1 && square <= size && squares[square - 1]) {
        squares[square - 1] = false;
        return true;
    }
    return false;
}

bool Board::isSquareCovered(const int square) const {
    if (square >= 1 && square <= size) {
        return squares[square - 1];
    }
    return false;
}

int Board::getSize() const {
    return size;
}

bool Board::allCovered() const {
    for (const bool square : squares) {
        if (!square) return false;
    }
    return true;
}

bool Board::allUncovered() const {
    for (const bool square : squares) {
        if (square) return false;
    }
    return true;
}

int Board::getUncoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (!isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

int Board::getCoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

set<set<int>> Board::findValidCombinations(const int sum, const bool forCovering) const {
    set<set<int>> combinations;
    for (int i = 1; i <= size; ++i) {
        if ((forCovering && !isSquareCovered(i)) || (!forCovering && isSquareCovered(i))) {
            if (i == sum) {
                combinations.insert({i});
            } else if (i < sum) {
                for (set<set<int>> subCombinations = findValidCombinations(sum - i, forCovering); const set<int>& subCombination : subCombinations) {
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

bool Board::isValidCombination(const set<int>& combination, bool forCovering) const {
    for (const int square : combination) {
        if ((forCovering && isSquareCovered(square)) || (!forCovering && !isSquareCovered(square))) {
            return false;
        }
    }
    return true;
}

bool Board::canThrowOneDie() const {
    for (int i = Board::ONE_DIE_RULE_START; i <= size; ++i) {
        if (!isSquareCovered(i)) return false;
    }
    return true;
}
