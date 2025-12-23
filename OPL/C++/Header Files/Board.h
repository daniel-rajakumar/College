/**
 * @file Board.h
 * @brief Defines the Board class which represents a player's board of numbered
 * squares and provides operations to cover/uncover squares and validate moves.
 */

#ifndef BOARD_H
#define BOARD_H
#include <set>
#include <vector>

/**
 * @class Board
 * @brief Manages a sequence of numbered squares that can be covered or uncovered.
 *
 * The Board stores whether each square is covered and provides helpers to
 * calculate sums, validate combinations of squares for covering/uncovering,
 * and determine when throwing a single die is allowed.
 */
class Board {
public:
    static constexpr int ONE_DIE_RULE_START = 7; /**< Minimum board value where one-die rule applies */

    /** Default constructor - creates an empty board. */
    Board() : squares(), size(0) {}

    /**
     * @brief Constructs a board with n squares (1..n)
     * @param n Number of squares on the board
     */
    explicit Board(int n) : squares(n, false), size(n) {}
    Board(const Board&) = default;

    /**
     * @brief Cover the given square index (1-based).
     * @param square The square to cover (1..size)
     * @return true if the square was successfully covered, false otherwise
     */
    bool coverSquare(int square);

    /**
     * @brief Uncover the given square index (1-based).
     * @param square The square to uncover (1..size)
     * @return true if the square was successfully uncovered, false otherwise
     */
    bool uncoverSquare(int square);

    /**
     * @brief Query whether a square is covered.
     * @param square The square to query (1..size)
     * @return true if the square is currently covered
     */
    bool isSquareCovered(int square) const;

    /**
     * @brief Returns the board size (number of squares).
     * @return Number of squares on the board
     */
    int getSize() const;

    /**
     * @brief Returns true when every square on the board is covered.
     */
    bool allCovered() const;

    /**
     * @brief Returns true when every square on the board is uncovered.
     */
    bool allUncovered() const;

    /**
     * @brief Returns the sum of all uncovered squares.
     * @return Sum of uncovered square indices
     */
    int getUncoveredSum() const;

    /**
     * @brief Returns the sum of all covered squares.
     * @return Sum of covered square indices
     */
    int getCoveredSum() const;

    /**
     * @brief Find all valid combinations of square indices that sum to `sum`.
     * @param sum Target sum to construct from square indices
     * @param forCovering true when searching combinations for covering; false for uncovering
     * @return A set of combinations (each combination is a set of indices)
     */
    std::set<std::set<int>> findValidCombinations(int sum, bool forCovering) const;

    /**
     * @brief Determines whether the given combination is valid for covering/uncovering.
     * @param combination Set of indices representing the combination
     * @param forCovering true when validating for covering, false for uncovering
     * @return true if the combination is valid
     */
    bool isValidCombination(const std::set<int> &combination, bool forCovering) const;

    /**
     * @brief Returns whether the one-die rule applies (i.e. only one die may be thrown).
     * @return true if one-die throws are allowed for this board state
     */
    bool canThrowOneDie() const;

protected:
    // Protected members (none currently, but place here if added)

private:
    std::vector<bool> squares; /**< true == covered */
    int size; /**< number of squares on the board */
};

#endif