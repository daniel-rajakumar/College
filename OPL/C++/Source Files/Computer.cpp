//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"
#include <iostream>
#include "../Header Files/Tournament.h"

using namespace std;

/**
 * @brief Constructs a Computer object.
 * 
 * @param b Reference to the computer's board.
 * @param humanBoard Reference to the human player's board.
 */
Computer::Computer(Board& b, Board& humanBoard)
    : Player(b, false), boardView(b, "Computer"), humanBoardView(humanBoard, "Human"), humanBoard(humanBoard) {}

/**
 * @brief Takes a turn for the computer player.
 * 
 * @return True if the turn was successful, false otherwise.
 */
#include "../Header Files/Computer.h"
#include <iostream>
#include <cstdlib>            // <-- add this for std::rand
#include "../Header Files/Tournament.h"

using namespace std;

bool Computer::takeTurn() {
    // Decide dice count
    const bool oneDieAllowed = board.canThrowOneDie();
    const int diceCount = oneDieAllowed ? 1 : 2;

    // Roll
    const int d1  = (std::rand() % 6) + 1;
    const int d2  = (diceCount == 2) ? ((std::rand() % 6) + 1) : 0;
    const int sum = d1 + d2;

    cout << "Computer chooses to roll " << diceCount << " die"
         << (diceCount == 1 ? "" : "s") << ".\n";
    if (diceCount == 2) {
        cout << "Computer rolled: " << d1 << " + " << d2 << " = " << sum << endl;
    } else {
        cout << "Computer rolled: " << d1 << " = " << sum << endl;
        cout << "(1-die option available because 7.." << board.getSize()
             << " are covered.)" << endl;
    }

    const bool canCover   = !board.findValidCombinations(sum, true ).empty();
    const bool canUncover = !humanBoard.findValidCombinations(sum, false).empty();

    if (!canCover && !canUncover) {
        cout << "Computer cannot cover any of its squares or uncover any of your squares. Its turn ends." << endl;
        return true;
    }

    if (shouldCover(sum)) {
        cout << "Computer decides to cover its own squares to maximize its advantage." << endl;
        coverSquares(sum);
    } else {
        cout << "Computer decides to uncover your squares to minimize your advantage." << endl;
        uncoverSquares(sum);
    }

    cout << "~~~~~~~~~~~[BOARD]~~~~~~~~~" << endl;
    boardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    humanBoardView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;

    return false;
}



/**
 * @brief Determines if the computer should cover squares based on the sum.
 * 
 * @param sum The sum of the dice.
 * @return True if the computer should cover squares, false otherwise.
 */
bool Computer::shouldCover(const int sum) const {
    const set<set<int>> coverCombinations = board.findValidCombinations(sum, true);
    return !coverCombinations.empty();
}

/**
 * @brief Covers squares on the board based on the sum.
 * 
 * @param sum The sum of the dice.
 */
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

    cout << "Computer chooses to cover the following squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << "because covering more squares gives it a better chance of winning." << endl;

    // Cover the selected squares
    for (const int square : selectedCombination) {
        board.coverSquare(square);
    }
}

/**
 * @brief Uncovers squares on the human's board based on the sum.
 * 
 * @param sum The sum of the dice.
 */
void Computer::uncoverSquares(const int sum) const {
    set<set<int>> validCombinations = humanBoard.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    // Remove combinations that include the advantage square if the advantage has been applied
    if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
        for (auto it = validCombinations.begin(); it != validCombinations.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) it = validCombinations.erase(it);
            else ++it;
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

    cout << "Computer chooses to uncover the following squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << "because uncovering more squares reduces your chances of winning." << endl;

    // Uncover the selected squares on the human's board
    for (const int square : selectedCombination) {
        humanBoard.uncoverSquare(square);
    }
}

/**
 * @brief Provides help to the human player by suggesting moves.
 * 
 * @param diceSum The sum of the dice.
 * @param humanBoard Reference to the human player's board.
 * @param computerBoard Reference to the computer's board.
 */
void Computer::provideHelp(const int diceSum, const Board& humanBoard, const Board& computerBoard) const {
    cout << "Computer's suggestion:" << endl;

    // Decide whether to cover or uncover
    if (shouldCover(diceSum)) {
        cout << "You should cover your squares." << endl;

        // Find valid combinations to cover

        if (const set<set<int>> coverCombinations = humanBoard.findValidCombinations(diceSum, true); coverCombinations.empty()) {
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
            for (const int square : bestCombination) {
                cout << square << " ";
            }
            cout << endl;
        }
    } else {
        cout << "You should uncover the opponent's squares." << endl;

        // Find valid combinations to uncover
        if (const set<set<int>> uncoverCombinations = computerBoard.findValidCombinations(diceSum, false); uncoverCombinations.empty()) {
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
            for (const int square : bestCombination) {
                cout << square << " ";
            }
            cout << endl;
        }
    }
}