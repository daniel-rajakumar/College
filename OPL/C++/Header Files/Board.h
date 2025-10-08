//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARD_H
#define BOARD_H
#include <set>
#include <vector>
using namespace std;

/**
 * @class Board
 * @brief Represents the game board.
 * 
 * The Board class provides functionality to manage the state of the board,
 * including covering and uncovering squares, and checking the state of the squares.
 */
class Board {
private:
    vector<bool> squares; ///< Vector representing the state of each square (true = covered, false = uncovered).
    int size; ///< The size of the board.

public:
    /**
     * @brief Constructs a Board object.
     * 
     * @param n The size of the board.
     */
    explicit Board(int n) : squares(n, false), size(n) {}

    /**
     * @brief Covers a specific square on the board.
     * 
     * @param square The index of the square to cover.
     */
    void coverSquare(int square);

    /**
     * @brief Uncovers a specific square on the board.
     * 
     * @param square The index of the square to uncover.
     */
    void uncoverSquare(int square);

    /**
     * @brief Checks if a specific square is covered.
     * 
     * @param square The index of the square to check.
     * @return True if the square is covered, false otherwise.
     */
    bool isSquareCovered(int square) const;

    /**
     * @brief Gets the size of the board.
     * 
     * @return The size of the board.
     */
    int getSize() const;

    /**
     * @brief Checks if all squares on the board are covered.
     * 
     * @return True if all squares are covered, false otherwise.
     */
    bool allCovered() const;

    /**
     * @brief Checks if all squares on the board are uncovered.
     * 
     * @return True if all squares are uncovered, false otherwise.
     */
    bool allUncovered() const;

    /**
     * @brief Gets the sum of the indices of all uncovered squares.
     * 
     * @return The sum of the indices of all uncovered squares.
     */
    int getUncoveredSum() const;

    /**
     * @brief Gets the sum of the indices of all covered squares.
     * 
     * @return The sum of the indices of all covered squares.
     */
    int getCoveredSum() const;

    /**
     * @brief Finds valid combinations of squares that sum to a given value.
     * 
     * @param sum The target sum.
     * @param forCovering Whether the combinations are for covering squares.
     * @return A set of valid combinations of squares that sum to the given value.
     */
    set<set<int>> findValidCombinations(int sum, bool forCovering) const;

    /**
     * @brief Checks if a given combination of squares is valid.
     * 
     * @param combination The combination of squares to check.
     * @param forCovering Whether the combination is for covering squares.
     * @return True if the combination is valid, false otherwise.
     */
    bool isValidCombination(const set<int> &combination, bool forCovering) const;
};

#endif //BOARD_H
