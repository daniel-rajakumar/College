//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Human.h"

#include <iostream>

Human::Human(Board& b, const Board& computerBoard)
    : Player(b, true), boardView(b, "Human"), computerBoardView(computerBoard, "Computer") {}


void Human::takeTurn() {
    const int die = Player::rollDie();
    cout << "Your rolled " << die << endl;;

    // Choose to cover or uncover squares
    cout << "Do you want to cover your squares or uncover the opponent's squares? (c/u): ";
    char choice;
    cin >> choice;

    if (choice == 'c') {
        coverSquares(die);
    } else if (choice == 'u') {
        uncoverSquares(die);
    }

    boardView.display(); // Use BoardView to display the board
    computerBoardView.display(); // Computer's board (assuming you have access to it)
}



// Cover squares
void Human::coverSquares(int sum) {
    set<set<int>> validCombinations = board.findValidCombinations(sum, true);

    if (validCombinations.empty()) {
        cout << "No valid moves to cover squares. Turn ends." << endl;
        return;
    }

    // Display valid combinations
    cout << "Valid combinations to cover:" << endl;
    int index = 1;
    for (const set<int>& combination : validCombinations) {
        cout << index << ": ";
        for (const int square : combination) {
            cout << square << " ";
        }
        cout << endl;
        index++;
    }

    // Prompt the player to choose a combination
    int choice;
    cout << "Enter the number of the combination you want to use: ";
    cin >> choice;

    // Validate the choice
    if (choice < 1 || choice > validCombinations.size()) {
        cout << "Invalid choice. Turn ends." << endl;
        return;
    }

    // Get the selected combination
    auto it = validCombinations.begin();
    advance(it, choice - 1);
    const set<int> selectedCombination = *it;

    // Cover the selected squares
    for (const int square : selectedCombination) {
        board.coverSquare(square);
    }
    cout << "Covered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}

// Uncover squares
void Human::uncoverSquares(const int sum) {
    set<set<int>> validCombinations = board.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "No valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    // Display valid combinations
    cout << "Valid combinations to uncover:" << endl;
    int index = 1;
    for (const set<int>& combination : validCombinations) {
        cout << index << ": ";
        for (const int square : combination) {
            cout << square << " ";
        }
        cout << endl;
        index++;
    }

    // Prompt the player to choose a combination
    int choice;
    cout << "Enter the number of the combination you want to use: ";
    cin >> choice;

    // Validate the choice
    if (choice < 1 || choice > validCombinations.size()) {
        cout << "Invalid choice. Turn ends." << endl;
        return;
    }

    // Get the selected combination
    auto it = validCombinations.begin();
    advance(it, choice - 1);
    const set<int> selectedCombination = *it;

    // Uncover the selected squares
    for (const int square : selectedCombination) {
        board.uncoverSquare(square);
    }
    cout << "Uncovered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}