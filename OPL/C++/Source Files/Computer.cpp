//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"
#include <iostream>
#include <string>
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

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
#include <string>
#include <cstdlib>            // <-- add this for std::rand
#include "../Header Files/Tournament.h"

using namespace std;

bool Computer::takeTurn() {
    using std::cout; using std::cin; using std::endl;

    // ---- input helpers (declare once, used every roll) ----
    auto readYN = [&]()->char{
        char c;
        while (true) {
            if (cin >> c) {
                c = std::tolower(c);
                if (c=='y' || c=='n') return c;
            }
            cin.clear();
            cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            cout << "Please enter y or n: ";
        }
    };
    auto readDie = [&](const char* prompt)->int{
        int v;
        while (true) {
            cout << prompt;
            if (cin >> v && v>=1 && v<=6) return v;
            cin.clear();
            cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            cout << "Please enter a number 1..6.\n";
        }
    };
    auto chooseIndex = [&](int maxIdx)->int{
        int idx;
        while (true) {
            cout << "Enter the number of the combination you want to use (1-" << maxIdx << "): ";
            if (cin >> idx && idx>=1 && idx<=maxIdx) return idx;
            cin.clear();
            cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            cout << "Invalid choice. Try again.\n";
        }
    };
    auto printCombos = [](const std::set<std::set<int>>& combos){
        int i=1;
        for (const auto& c : combos) {
            std::cout << "  [" << i++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    };

    // ======= FULL COMPUTER TURN (loop rolls until stuck) =======
    while (true) {
        section("Computer Turn");

        // Ask each roll whether to drive manually (mirrors Human flow)
        cout << "Do you want to enter the die manually for the computer? (y/n): ";
        const char manual = readYN();

        int sum = 0;

        if (manual == 'y') {
            const bool oneDieAllowed = board.canThrowOneDie();
            int diceCount = 2;

            if (oneDieAllowed) {
                cout << "1-die is allowed (7.." << board.getSize() << " are covered). Use 1 die? (y/n): ";
                diceCount = (readYN()=='y') ? 1 : 2;
            } else {
                cout << "1-die is NOT allowed (must use 2 dice).\n";
                diceCount = 2;
            }

            const int d1 = readDie("Enter die 1 (1-6): ");
            const int d2 = (diceCount==2) ? readDie("Enter die 2 (1-6): ") : 0;
            sum = d1 + d2;
            cout << "Computer (manual) rolled: " << d1
                 << (diceCount==2 ? " + " : " = ")
                 << (diceCount==2 ? std::to_string(d2)+" = " : "")
                 << sum << "\n";

            // compute options
            auto coverCombos   = board.findValidCombinations(sum, /*cover=*/true);
            auto uncoverCombos = humanBoard.findValidCombinations(sum, /*cover=*/false);

            // filter uncover by one-turn protection on the human advantage
            if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
                for (auto it = uncoverCombos.begin(); it != uncoverCombos.end(); ) {
                    if (it->contains(Tournament::getAdvantageSquare())) it = uncoverCombos.erase(it);
                    else ++it;
                }
            }

            if (coverCombos.empty() && uncoverCombos.empty()) {
                cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                return true; // end of the entire computer turn
            }

            // choose cover/uncover like human
            char cu;
            while (true) {
                cout << "Do you want the computer to (c)over its squares or (u)ncover yours? (c/u): ";
                if (cin >> cu) {
                    cu = std::tolower(cu);
                    if (cu=='c' && !coverCombos.empty()) break;
                    if (cu=='u' && !uncoverCombos.empty()) break;
                }
                cin.clear();
                cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                cout << "That action isn't available with this roll.\n";
            }

            if (cu=='c') {
                section("Valid combinations to cover");
                printCombos(coverCombos);
                int idx = chooseIndex(static_cast<int>(coverCombos.size()));
                auto it = coverCombos.begin(); std::advance(it, idx-1);
                for (int v : *it) board.coverSquare(v);
                cout << c(GREEN) << "Computer covers: " << c(RESET);
                for (int v : *it) cout << v << " "; cout << "\n";
            } else {
                section("Valid combinations to uncover");
                printCombos(uncoverCombos);
                int idx = chooseIndex(static_cast<int>(uncoverCombos.size()));
                auto it = uncoverCombos.begin(); std::advance(it, idx-1);
                for (int v : *it) humanBoard.uncoverSquare(v);
                cout << c(GREEN) << "Computer uncovers: " << c(RESET);
                for (int v : *it) cout << v << " "; cout << "\n";
            }
        }
        else {
            // ---- AI path for this roll ----
            const bool oneDieAllowed = board.canThrowOneDie();
            auto highestUncovered = [&](const Board& b){ for (int v=b.getSize(); v>=1; --v) if (!b.isSquareCovered(v)) return v; return 0; };
            auto remainingCount   = [&](const Board& b){ int c=0; for (int v=1; v<=b.getSize(); ++v) if (!b.isSquareCovered(v)) ++c; return c; };

            int diceCount = 2;
            if (oneDieAllowed && (highestUncovered(board) <= 6 || remainingCount(board) <= 3)) diceCount = 1;

            const int d1 = (std::rand()%6)+1;
            const int d2 = (diceCount==2) ? ((std::rand()%6)+1) : 0;
            sum = d1 + d2;
            // Explain WHY 1 vs 2 dice
            std::string diceWhy;
            if (!oneDieAllowed) {
                diceWhy = "must use 2 dice (1-die not allowed until 7.." + std::to_string(board.getSize()) + " are covered)";
            } else if (diceCount == 1) {
                int hi = highestUncovered(board);
                int rem = remainingCount(board);
                if (hi <= 6)      diceWhy = "1 die because highest remaining square <= 6 (aiming small)";
                else if (rem <= 3) diceWhy = "1 die because only " + std::to_string(rem) + " squares remain (lower bust risk)";
                else               diceWhy = "1 die (heuristic)";
            } else { // diceCount == 2 with 1-die allowed
                diceWhy = "2 dice to reach sums > 6 (need higher targets)";
            }


            cout << "Chooses to roll " << (diceCount==1 ? "1 die" : "2 dice")
                 << " " << c(DIM) << "(" << diceWhy << ")" << c(RESET) << ".\n";
            if (diceCount==2) cout << "Rolled: " << d1 << " + " << d2 << " = " << sum << "\n";
            else              cout << "Rolled: " << d1 << " = " << sum
                                   << " " << c(DIM) << "(1-die allowed)" << c(RESET) << "\n";

            const bool canCover   = !board.findValidCombinations(sum, true ).empty();
            const bool canUncover = !humanBoard.findValidCombinations(sum, false).empty();

            if (!canCover && !canUncover) {
                cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                return true; // end of the entire computer turn
            }

            cout << c(GREEN) << "Decision: " << c(RESET)
                 << (shouldCover(sum) ? "Cover own squares" : "Uncover opponent squares") << "\n";

            if (shouldCover(sum)) coverSquares(sum);
            else                  uncoverSquares(sum);
        }

        // After one move, show boards then loop to roll again.
        boardView.display(
    Tournament::getAdvantageApplied() &&
    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
    Tournament::getAdvantageSquare());

        humanBoardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Human,
            Tournament::getAdvantageSquare());

        std::cout << "\n";

        // If computer already finished its board, we'll exit now; Round will detect win.
        if (board.allCovered()) return true;
    }
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
void Computer::provideHelp(const int diceSum,
                           const Board& humanBoard,
                           const Board& computerBoard) const
{
    // pretty header
    banner("Help");
    std::cout << "Dice sum: " << diceSum << "\n";

    // helpers
    auto printCombos = [](const std::set<std::set<int>>& combos) {
        int idx = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << idx++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    };
    auto best = [](const std::set<std::set<int>>& combos) {
        // primary: most squares; secondary: highest total
        std::set<int> bestC;
        int bestCount = -1, bestSum = -1;
        for (const auto& c : combos) {
            int cnt = static_cast<int>(c.size());
            int sum = 0; for (int v : c) sum += v;
            if (cnt > bestCount || (cnt == bestCount && sum > bestSum)) {
                bestC = c; bestCount = cnt; bestSum = sum;
            }
        }
        return bestC;
    };

    // compute options
    const auto coverCombos   = humanBoard.findValidCombinations(diceSum, /*cover=*/true);
    const auto uncoverCombos = computerBoard.findValidCombinations(diceSum, /*cover=*/false);

    // lists
    section("Cover options (your board)");
    if (coverCombos.empty()) std::cout << "  none\n";
    else printCombos(coverCombos);

    section("Uncover options (opponent board)");
    if (uncoverCombos.empty()) std::cout << "  none\n";
    else printCombos(uncoverCombos);

    // recommendation
    if (!coverCombos.empty()) {
        const auto rec = best(coverCombos);
        std::cout << "\n" << c(GREEN) << "Recommended: COVER  " << c(RESET);
        for (int v : rec) std::cout << v << " ";
        std::cout << "\n" << c(DIM)
                  << "Reason: maximize number of squares; tie-break by higher values.\n"
                  << c(RESET);
    } else if (!uncoverCombos.empty()) {
        const auto rec = best(uncoverCombos);
        std::cout << "\n" << c(GREEN) << "Recommended: UNCOVER  " << c(RESET);
        for (int v : rec) std::cout << v << " ";
        std::cout << "\n" << c(DIM)
                  << "Reason: remove as many as possible; tie-break by higher values.\n"
                  << c(RESET);
    } else {
        std::cout << "\nNo legal moves. You must pass.\n";
    }

    // advantage note (one-turn protection)
    if (Tournament::getAdvantageApplied()) {
        std::cout << "\n" << c(YELLOW) << "Note:" << c(RESET)
                  << " advantage square " << Tournament::getAdvantageSquare()
                  << " is protected for one turn.\n";
    }

    hr();
}

