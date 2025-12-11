#include "../Header Files/Board.h"
#include <set>
using namespace std;

// *********************************************************************
// Function Name: coverSquare
// Purpose: Marks a specific square as covered if valid.
// Returns: true if successful, false if invalid or already covered.
// *********************************************************************
bool Board::coverSquare(const int square) {
    if (square >= 1 && square <= size && !squares[square - 1]) {
        squares[square - 1] = true;
        return true;
    }
    return false;
}

// *********************************************************************
// Function Name: uncoverSquare
// Purpose: Marks a specific square as uncovered if valid.
// Returns: true if successful, false if invalid or already uncovered.
// *********************************************************************
bool Board::uncoverSquare(const int square) {
    if (square >= 1 && square <= size && squares[square - 1]) {
        squares[square - 1] = false;
        return true;
    }
    return false;
}

// *********************************************************************
// Function Name: isSquareCovered
// Purpose: Checks if a square is currently covered.
// Returns: true if covered, false otherwise.
// *********************************************************************
bool Board::isSquareCovered(const int square) const {
    if (square >= 1 && square <= size) {
        return squares[square - 1];
    }
    return false;
}

// *********************************************************************
// Function Name: getSize
// Purpose: Returns the board size (9, 10, or 11).
// *********************************************************************
int Board::getSize() const {
    return size;
}

// *********************************************************************
// Function Name: allCovered
// Purpose: Checks if all squares on the board are covered.
// *********************************************************************
bool Board::allCovered() const {
    for (const bool square : squares) {
        if (!square) return false;
    }
    return true;
}

// *********************************************************************
// Function Name: allUncovered
// Purpose: Checks if all squares on the board are uncovered.
// *********************************************************************
bool Board::allUncovered() const {
    for (const bool square : squares) {
        if (square) return false;
    }
    return true;
}

// *********************************************************************
// Function Name: getUncoveredSum
// Purpose: Calculates the sum of all uncovered squares (for scoring).
// *********************************************************************
int Board::getUncoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (!isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

// *********************************************************************
// Function Name: getCoveredSum
// Purpose: Calculates the sum of all covered squares (for scoring).
// *********************************************************************
int Board::getCoveredSum() const {
    int sum = 0;
    for (int i = 1; i <= size; ++i) {
        if (isSquareCovered(i)) {
            sum += i;
        }
    }
    return sum;
}

// *********************************************************************
// Function Name: findValidCombinations
// Purpose: Recursively finds all subsets of squares that sum to the target value.
// Parameters:
//   sum - The target sum.
//   forCovering - If true, looks for uncovered squares to cover. If false, looked for covered squares to uncover.
// *********************************************************************
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

// *********************************************************************
// Function Name: isValidCombination
// Purpose: Validates if a given combination of squares is legal for the action.
// *********************************************************************
bool Board::isValidCombination(const set<int>& combination, bool forCovering) const {
    for (const int square : combination) {
        if ((forCovering && isSquareCovered(square)) || (!forCovering && !isSquareCovered(square))) {
            return false;
        }
    }
    return true;
}

// *********************************************************************
// Function Name: canThrowOneDie
// Purpose: Checks if the "One Die Rule" applies (squares 7-N must be covered).
// *********************************************************************
bool Board::canThrowOneDie() const {
    for (int i = Board::ONE_DIE_RULE_START; i <= size; ++i) {
        if (!isSquareCovered(i)) return false;
    }
    return true;
}