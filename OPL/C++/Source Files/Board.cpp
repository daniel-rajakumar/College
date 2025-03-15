//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Board.h"
#include <set>

/**
 * @brief Covers a specific square on the board.
 * 
 * @param square The index of the square to cover.
 */
void Board::coverSquare(int square) {
    if (square >= 1 && square <= size) {
        squares[square - 1] = true;
    }
}

/**
 * @brief Uncovers a specific square on the board.
 * 
 * @param square The index of the square to uncover.
 */
void Board::uncoverSquare(int square) {
    if (square >= 1 && square <= size) {
        squares[square - 1] = false;
    }
}

/**
 * @brief Checks if a specific square is covered.
 * 
 * @param square The index of the square to check.
 * @return True if the square is covered, false otherwise.
 */
bool Board::isSquareCovered(int square) const {
    if (square >= 1 && square <= size) {
        return squares[square - 1];
    }
    return false;
}

/**
 * @brief Gets the size of the board.
 * 
 * @return The size of the board.
 */
int Board::getSize() const {
    return size;
}

/**
 * @brief Checks if all squares on the board are covered.
 * 
 * @return True if all squares are covered, false otherwise.
 */
bool Board::allCovered() const {
    for (const bool square : squares) {
        if (!square) return false;
    }
    return true;
}

/**
 * @brief Checks if all squares on the board are uncovered.
 * 
 * @return True if all squares are uncovered, false otherwise.
 */
bool Board::allUncovered() const {
    for (const bool square : squares) {
        if (square) return false;
    }
    return true;
}

/**
 * @brief Gets the sum of the indices of all uncovered squares.
 * 
 * @return The sum of the indices of all uncovered squares.
 */
int Board::getUncoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (!isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

/**
 * @brief Gets the sum of the indices of all covered squares.
 * 
 * @return The sum of the indices of all covered squares.
 */
int Board::getCoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

/**
 * @brief Finds valid combinations of squares that sum to a given value.
 * 
 * @param sum The target sum.
 * @param forCovering Whether the combinations are for covering squares.
 * @return A set of valid combinations of squares that sum to the given value.
 */
set<set<int>> Board::findValidCombinations(int sum, bool forCovering) const {
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

/**
 * @brief Checks if a given combination of squares is valid.
 * 
 * @param combination The combination of squares to check.
 * @param forCovering Whether the combination is for covering squares.
 * @return True if the combination is valid, false otherwise.
 */
bool Board::isValidCombination(const set<int>& combination, bool forCovering) const {
    for (const int square : combination) {
        if ((forCovering && isSquareCovered(square)) || (!forCovering && !isSquareCovered(square))) {
            return false;
        }
    }
    return true;
}