//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Human.h"
#include <iostream>
#include "../Header Files/Computer.h"
#include "../Header Files/Tournament.h"

using namespace std;

/**
 * @brief Constructs a Human object.
 * 
 * @param b Reference to the human player's board.
 * @param computerBoard Reference to the computer's board.
 */
Human::Human(Board& b, Board& computerBoard)
    : Player(b, true), boardView(b, "Human"), computerBoardView(computerBoard, "Computer"), computerBoard(computerBoard) {}

/**
 * @brief Takes a turn for the human player.
 * 
 * @return True if the turn was successful, false otherwise.
 */
bool Human::takeTurn() {
    // Roll dice
    const int die = rollDie();
    cout << "You rolled " << die << endl;

    const bool canCover = !board.findValidCombinations(die, true).empty();

    if (bool canUncover = !computerBoard.findValidCombinations(die, false).empty(); !canCover && !canUncover) {
        cout << "You cannot cover any of your squares or uncover any of the opponent's squares. Your turn ends." << endl;
        return true;
    }

    // Display boards with the advantage square highlighted
    cout << "\n\nCurrent Board State:" << endl;
    boardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    computerBoardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());

    // Ask if the player wants help from the computer
    char helpChoice;
    do {
        cout << "Do you want help from the computer? (y/n): ";
        cin >> helpChoice;
    } while (helpChoice != 'y' && helpChoice != 'n');

    if (helpChoice == 'y' || helpChoice == 'Y') {
        // Call the computer's provideHelp method
        const Computer computer(computerBoard, board);
        computer.provideHelp(die, board, computerBoard);
        cout << endl;
    }

    // Choose to cover or uncover squares
    cout << "Do you want to cover your squares or uncover the opponent's squares? (c/u): ";
    char choice;
    cin >> choice;

    if (choice == 'c') {
        coverSquares(die);
    } else if (choice == 'u') {
        uncoverSquares(die);
    }

    cout << "~~~~~~~~~~~[BOARD]~~~~~~~~~" << endl;
    boardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    computerBoardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;
    return false;
}

/**
 * @brief Covers squares on the board based on the sum.
 * 
 * @param sum The sum of the dice.
 */
void Human::coverSquares(const int sum) const {
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

    int choice;
    cout << "Enter the number of the combination you want to use: ";
    cin >> choice;

    // Validate the choice
    if (choice < 1 || choice > validCombinations.size()) {
        cout << "Invalid choice. Turn ends." << endl;
        return;
    }

    auto it = validCombinations.begin();
    advance(it, choice - 1);
    const set<int> selectedCombination = *it;

    for (const int square : selectedCombination) {
        board.coverSquare(square);
    }
    cout << "Covered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}

/**
 * @brief Uncovers squares on the computer's board based on the sum.
 * 
 * @param sum The sum of the dice.
 */
void Human::uncoverSquares(const int sum) const {
    set<set<int>> validCombinations = computerBoard.findValidCombinations(sum, false);

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

    int choice;
    cout << "Enter the number of the combination you want to use: ";
    cin >> choice;

    if (choice < 1 || choice > validCombinations.size()) {
        cout << "Invalid choice. Turn ends." << endl;
        return;
    }

    auto it = validCombinations.begin();
    advance(it, choice - 1);
    const set<int> selectedCombination = *it;

    for (const int square : selectedCombination) {
        computerBoard.uncoverSquare(square);
    }
    cout << "Uncovered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}
