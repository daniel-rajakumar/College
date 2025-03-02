//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Board.h"

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