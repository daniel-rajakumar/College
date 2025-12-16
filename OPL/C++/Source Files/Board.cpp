/**
 * @file Board.cpp
 * @brief Implementation of the Board class: covering/uncovering squares,
 *        querying board state, and finding valid square combinations.
 */

#include "../Header Files/Board.h"
#include <set>
using namespace std;

/**
 * @brief Marks a specific square as covered if it is a valid uncovered square.
 * @param square 1-based index of the square to cover
 * @return true if the square was successfully covered; false otherwise
 */
bool Board::coverSquare(const int square) {
    if (square >= 1 && square <= size && !squares[square - 1]) {
        squares[square - 1] = true;
        return true;
    }
    return false;
}

/**
 * @brief Marks a specific square as uncovered if it is currently covered.
 * @param square 1-based index of the square to uncover
 * @return true if the square was successfully uncovered; false otherwise
 */
bool Board::uncoverSquare(const int square) {
    if (square >= 1 && square <= size && squares[square - 1]) {
        squares[square - 1] = false;
        return true;
    }
    return false;
}

/**
 * @brief Checks whether a square is currently covered.
 * @param square 1-based index of the square to query
 * @return true if the specified square is covered, false otherwise
 */
bool Board::isSquareCovered(const int square) const {
    if (square >= 1 && square <= size) {
        return squares[square - 1];
    }
    return false;
}

/**
 * @brief Returns the number of squares on the board.
 * @return Board size (number of squares)
 */
int Board::getSize() const {
    return size;
}

/**
 * @brief Returns true when every square on the board is covered.
 * @return true if all squares are covered
 */
bool Board::allCovered() const {
    for (const bool square : squares) {
        if (!square) return false;
    }
    return true;
}

/**
 * @brief Returns true when every square on the board is uncovered.
 * @return true if all squares are uncovered
 */
bool Board::allUncovered() const {
    for (const bool square : squares) {
        if (square) return false;
    }
    return true;
}

/**
 * @brief Calculates the sum of all uncovered square indices for scoring.
 * @return Sum of uncovered squares
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
 * @brief Calculates the sum of all covered square indices for scoring.
 * @return Sum of covered squares
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
 * @brief Recursively finds all subsets of squares that sum to the target value.
 * @param sum Target sum to achieve from available squares
 * @param forCovering If true, consider uncovered squares to cover; otherwise consider covered squares to uncover
 * @return A set containing combinations (as sets of indices) that sum to `sum`
 */
set<set<int>> Board::findValidCombinations(const int sum, const bool forCovering) const {
    set<set<int>> combinations;

    // Iterate through all squares to find potential candidates
    for (int i = 1; i <= size; ++i) {
        // Step 1: Check if the square is available for the requested action
        if ((forCovering && !isSquareCovered(i)) || (!forCovering && isSquareCovered(i))) {

            // Step 2: Base case - exact match found
            if (i == sum) {
                combinations.insert({i});
            }
            // Step 3: Recursive case - look for remaining sum
            else if (i < sum) {
                for (set<set<int>> subCombinations = findValidCombinations(sum - i, forCovering); const set<int>& subCombination : subCombinations) {
                    // Ensure unique numbers (no repeats in combination)
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
 * @brief Validates whether the provided combination is legal for the requested action.
 * @param combination Set of 1-based square indices
 * @param forCovering true when validating for covering; false for uncovering
 * @return true if every index in combination is eligible for the requested action
 */
bool Board::isValidCombination(const set<int>& combination, bool forCovering) const {
    for (const int square : combination) {
        if ((forCovering && isSquareCovered(square)) || (!forCovering && !isSquareCovered(square))) {
            return false;
        }
    }
    return true;
}

/**
 * @brief Indicates whether only a single die may be thrown under the game rule.
 * @return true when the one-die rule applies (squares starting from ONE_DIE_RULE_START are covered)
 */
bool Board::canThrowOneDie() const {
    for (int i = Board::ONE_DIE_RULE_START; i <= size; ++i) {
        if (!isSquareCovered(i)) return false;
    }
    return true;
}