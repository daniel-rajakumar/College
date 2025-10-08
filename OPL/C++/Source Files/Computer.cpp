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
    // Decide dice count (smarter)
    const bool oneDieAllowed = board.canThrowOneDie();

    // heuristic helpers
    auto highestUncovered = [&](const Board& b) {
        for (int v = b.getSize(); v >= 1; --v)
            if (!b.isSquareCovered(v)) return v;
        return 0;
    };
    auto remainingCount = [&](const Board& b) {
        int c = 0;
        for (int v = 1; v <= b.getSize(); ++v)
            if (!b.isSquareCovered(v)) ++c;
        return c;
    };

    // policy:
    // - if 1-die allowed AND (highest target ≤ 6 OR only a few remain), prefer 1 die; else 2 dice
    int diceCount = 2;
    if (oneDieAllowed) {
        if (highestUncovered(board) <= 6 || remainingCount(board) <= 3)
            diceCount = 1;
    }


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
    auto printCombos = [](const std::set<std::set<int>>& combos) {
        int idx = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << idx++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    };

    // compute all options
    const auto coverCombos   = humanBoard.findValidCombinations(diceSum, /*cover=*/true);
    const auto uncoverCombos = computerBoard.findValidCombinations(diceSum, /*cover=*/false);

    std::cout << "=== Help === (sum = " << diceSum << ")\n";

    if (coverCombos.empty() && uncoverCombos.empty()) {
        std::cout << "No legal moves. You must pass.\n";
        return;
    }

    // show all options
    if (!coverCombos.empty()) {
        std::cout << "Cover options (your board):\n";
        printCombos(coverCombos);
    } else {
        std::cout << "Cover options (your board): none\n";
    }

    if (!uncoverCombos.empty()) {
        std::cout << "Uncover options (opponent board):\n";
        printCombos(uncoverCombos);
    } else {
        std::cout << "Uncover options (opponent board): none\n";
    }

    // choose recommendation:
    auto best = [](const std::set<std::set<int>>& combos) {
        // primary: most squares; secondary: highest total
        std::set<int> bestC;
        int bestCount = -1, bestSum = -1;
        for (const auto& c : combos) {
            int cnt = (int)c.size();
            int sum = 0; for (int v : c) sum += v;
            if (cnt > bestCount || (cnt == bestCount && sum > bestSum)) {
                bestC = c; bestCount = cnt; bestSum = sum;
            }
        }
        return bestC;
    };

    // strategy: prefer covering if possible; if not, uncover; explain why
    if (!coverCombos.empty()) {
        const auto rec = best(coverCombos);
        std::cout << "\nRecommended: COVER -> ";
        int sum = 0; for (int v : rec) { std::cout << v << " "; sum += v; }
        std::cout << "\nReason: maximizes number of squares covered (tie-break by higher values) "
                     "to reduce your uncovered total and pressure opponent.\n";
    } else {
        const auto rec = best(uncoverCombos);
        std::cout << "\nRecommended: UNCOVER -> ";
        int sum = 0; for (int v : rec) { std::cout << v << " "; sum += v; }
        std::cout << "\nReason: maximizes number of squares removed from opponent (tie-break by higher values) "
                     "to raise their uncovered total.\n";
    }

    // mention advantage protection when applicable
    if (Tournament::getAdvantageApplied()) {
        std::cout << "\nNote: Advantage square " << Tournament::getAdvantageSquare()
                  << " is temporarily protected for one turn for the advantaged player.\n";
    }
    std::cout << "=============\n";
}
