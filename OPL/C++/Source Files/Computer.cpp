//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"

#include <iostream>

Computer::Computer(Board& b, Board& humanBoard)
    : Player(b, false), boardView(b, "Computer"), humanBoardView(humanBoard, "Human") {}




void Computer::takeTurn() {
    // cout << "Computer's turn!" << endl;

    // Roll dice
    int diceSum = rollDie(); // Use the rollDie function
    cout << "Computer rolled: " << diceSum << endl;

    // Decide to cover or uncover squares
    if (shouldCover(diceSum)) {
        coverSquares(diceSum);
    } else {
        uncoverSquares(diceSum);
    }

    boardView.display(); // Use BoardView to display the board
    humanBoardView.display(); // Use BoardView to display the board
}

// Decide whether to cover or uncover
bool Computer::shouldCover(const int sum) const {
    // Prefer covering if possible
    const set<set<int>> coverCombinations = board.findValidCombinations(sum, true);
    return !coverCombinations.empty();
}

// Cover squares
void Computer::coverSquares(const int sum) const {
    const set<set<int>> validCombinations = board.findValidCombinations(sum, true);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to cover squares. Turn ends." << endl;
        return;
    }

    // Choose the combination with the most squares
    set<int> selectedCombination;
    int maxSquares = 0;
    for (const set<int>& combination : validCombinations) {
        if (combination.size() > maxSquares) {
            selectedCombination = combination;
            maxSquares = combination.size();
        }
    }

    // Cover the selected squares
    for (const int square : selectedCombination) {
        board.coverSquare(square);
    }
    cout << "Computer covered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}

// Uncover squares
void Computer::uncoverSquares(const int sum) const {
    const set<set<int>> validCombinations = board.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    // Choose the combination with the most squares
    set<int> selectedCombination;
    int maxSquares = 0;
    for (const set<int>& combination : validCombinations) {
        if (combination.size() > maxSquares) {
            selectedCombination = combination;
            maxSquares = combination.size();
        }
    }

    // Uncover the selected squares
    for (const int square : selectedCombination) {
        board.uncoverSquare(square);
    }
    cout << "Computer uncovered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}
