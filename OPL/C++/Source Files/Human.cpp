//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Human.h"
#include <iostream>
#include "../Header Files/Computer.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

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
    section("Human Turn");

    // Roll dice (your rollDie() returns the total)
    const int sum = rollDie();
    std::cout << "You rolled: " << sum << "\n";


    const bool canCover = !board.findValidCombinations(sum, true).empty();

    if (bool canUncover = !computerBoard.findValidCombinations(sum, false).empty(); !canCover && !canUncover) {
        cout << "You cannot cover any of your squares or uncover any of the opponent's squares. Your turn ends." << endl;
        return true;
    }

    // Display boards with the advantage square highlighted
    banner("Current Board State");
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
        computer.provideHelp(sum, board, computerBoard);
        cout << endl;
    }

    // Choose to cover or uncover squares
    // Choose to cover or uncover squares
    char choice;
    do {
        std::cout << "Cover your squares or uncover the opponent's squares? (c/u): ";
        std::cin >> choice;
        choice = std::tolower(choice);
    } while (choice != 'c' && choice != 'u');

    if (choice == 'c') {
        coverSquares(sum);
    } else {
        uncoverSquares(sum);
    }

    banner("Board After Your Move");
    boardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    computerBoardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    std::cout << "\n";

    return false;
}

/**
 * @brief Covers squares on the board based on the sum.
 * 
 * @param sum The sum of the dice.
 */
void Human::coverSquares(const int sum) const {
    using namespace ui;

    std::set<std::set<int>> validCombinations = board.findValidCombinations(sum, true);
    section("Valid cover options");

    if (validCombinations.empty()) {
        std::cout << "  none\n";
        std::cout << "No valid moves to cover squares. Turn ends.\n";
        return;
    }

    // print options
    auto printCombos = [](const std::set<std::set<int>>& combos) {
        int idx = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << idx++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    };
    printCombos(validCombinations);

    // choose a valid index (re-prompt until valid)
    int choice = 0;
    const int maxIdx = static_cast<int>(validCombinations.size());
    while (true) {
        std::cout << "Enter the number of the combination you want to use (1-" << maxIdx << "): ";
        if (std::cin >> choice && choice >= 1 && choice <= maxIdx) break;
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Invalid choice. Try again.\n";
    }

    // apply selection
    auto it = validCombinations.begin();
    std::advance(it, choice - 1);
    const std::set<int> selected = *it;

    for (int v : selected) board.coverSquare(v);

    std::cout << c(GREEN) << "Covered: " << c(RESET);
    for (int v : selected) std::cout << v << " ";
    std::cout << "\n";
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

    if (Tournament::getAdvantageApplied() && Tournament::isComputerAdvantageProtected()) {
        for (auto it = validCombinations.begin(); it != validCombinations.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) it = validCombinations.erase(it);
            else ++it;
        }
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
