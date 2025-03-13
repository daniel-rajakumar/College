//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"

#include <iostream>

#include "../Header Files/Tournament.h"

Computer::Computer(Board& b, Board& humanBoard)
    : Player(b, false), boardView(b, "Computer"), humanBoardView(humanBoard, "Human"), humanBoard(humanBoard) {}




void Computer::takeTurn() {
    // cout << "Computer's turn!" << endl;

    // Roll dice
    int diceSum = rollDie(); // Use the rollDie function
    cout << "Computer rolled: " << diceSum << endl;

    bool canCover = !board.findValidCombinations(diceSum, true).empty();
    bool canUncover = !humanBoard.findValidCombinations(diceSum, false).empty();

    if (!canCover && !canUncover) {
        cout << "Computer cannot cover any of its squares or uncover any of your squares. Its turn ends." << endl;
        return;
    }


    // Decide to cover or uncover squares
    if (shouldCover(diceSum)) {
        coverSquares(diceSum);
    } else {
        uncoverSquares(diceSum);
    }

    cout << "~~~~~~~~~~~[BOARD]~~~~~~~~~" << endl;
    boardView.display(Tournament::getAdvantageApplied() && true, Tournament::getAdvantageSquare());
    humanBoardView.display(Tournament::getAdvantageApplied() && true, Tournament::getAdvantageSquare());
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;
}

// Decide whether to cover / uncover
bool Computer::shouldCover(const int sum) const {
    // cover > uncover (most of the time)
    const set<set<int>> coverCombinations = board.findValidCombinations(sum, true);
    return !coverCombinations.empty();
}

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
        // humanBoard.coverSquare(square);
    }
    cout << "Computer covered squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}




// Uncover squares on the human's board
void Computer::uncoverSquares(int sum) {
    set<set<int>> validCombinations = humanBoard.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    // Remove combinations that include the advantage square if the advantage has been applied
    if (Tournament::getAdvantageApplied()) {
        for (auto it = validCombinations.begin(); it != validCombinations.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) {
                it = validCombinations.erase(it); // Remove the combination
            } else {
                ++it;
            }
        }
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

    // Uncover the selected squares on the human's board
    for (int square : selectedCombination) {
        humanBoard.uncoverSquare(square);
    }
    cout << "Computer uncovered squares: ";
    for (int square : selectedCombination) {
        cout << square << " ";
    }
    cout << endl;
}



void Computer::provideHelp(int diceSum, Board& humanBoard, Board& computerBoard) const {
    cout << "Computer's suggestion:" << endl;

    // Decide whether to cover or uncover
    if (shouldCover(diceSum)) {
        cout << "You should cover your squares." << endl;

        // Find valid combinations to cover
        set<set<int>> coverCombinations = humanBoard.findValidCombinations(diceSum, true);

        if (coverCombinations.empty()) {
            cout << "No valid moves to cover squares." << endl;
        } else {
            // Suggest the combination with the most squares
            set<int> bestCombination;
            int maxSquares = 0;
            for (const set<int>& combination : coverCombinations) {
                if (combination.size() > maxSquares) {
                    bestCombination = combination;
                    maxSquares = combination.size();
                }
            }

            cout << "You can cover the following squares: ";
            for (int square : bestCombination) {
                cout << square << " ";
            }
            cout << endl;
        }
    } else {
        cout << "You should uncover the opponent's squares." << endl;

        // Find valid combinations to uncover
        set<set<int>> uncoverCombinations = computerBoard.findValidCombinations(diceSum, false);

        if (uncoverCombinations.empty()) {
            cout << "No valid moves to uncover squares." << endl;
        } else {
            // Suggest the combination with the most squares
            set<int> bestCombination;
            int maxSquares = 0;
            for (const set<int>& combination : uncoverCombinations) {
                if (combination.size() > maxSquares) {
                    bestCombination = combination;
                    maxSquares = combination.size();
                }
            }

            cout << "You can uncover the following squares: ";
            for (int square : bestCombination) {
                cout << square << " ";
            }
            cout << endl;
        }
    }
}