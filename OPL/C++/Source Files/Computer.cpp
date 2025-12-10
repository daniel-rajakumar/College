#include "../Header Files/Computer.h"
#include <iostream>
#include <string>
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"
#include <random>

using namespace std;
using namespace ui;

Computer::Computer(Board& b, Board& humanBoard)
    : Player(b, false), boardView(b, "Computer"), humanBoardView(humanBoard, "Human"), humanBoard(humanBoard) {}

bool Computer::takeTurn() {
    using std::cout; using std::cin; using std::endl;

    auto readYN = [&]()->char{
        char c;
        while (true) {
            if (cin >> c) {
                int tmp = std::tolower(static_cast<unsigned char>(c));
                c = static_cast<char>(tmp);
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

    while (true) {
        section("Computer Turn");

        cout << "Do you want to enter the die manually for the computer? (y/n): ";
        const char manual = readYN();

        int sum = 0;

        if (manual == 'y') {
            const bool oneDieAllowed = board.canThrowOneDie();
            int diceCount = 2;

            if (oneDieAllowed) {
                cout << "1-die is allowed (" << Board::ONE_DIE_RULE_START << ".." << board.getSize() << " are covered). Use 1 die? (y/n): ";
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

            auto coverCombos   = board.findValidCombinations(sum, /*forCovering=*/true);
            auto uncoverCombos = humanBoard.findValidCombinations(sum, /*forCovering=*/false);

            if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
                for (auto it = uncoverCombos.begin(); it != uncoverCombos.end(); ) {
                    if (it->contains(Tournament::getAdvantageSquare())) it = uncoverCombos.erase(it);
                    else ++it;
                }
            }

            if (coverCombos.empty() && uncoverCombos.empty()) {
                cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                return true;
            }

            char cu;
            while (true) {
                cout << "Do you want the computer to (c)over its squares or (u)ncover yours? (c/u): ";
                if (cin >> cu) {
                    int tmp = std::tolower(static_cast<unsigned char>(cu));
                    cu = static_cast<char>(tmp);
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
            const bool oneDieAllowed = board.canThrowOneDie();
            auto highestUncovered = [&](const Board& b){ for (int v=b.getSize(); v>=1; --v) if (!b.isSquareCovered(v)) return v; return 0; };
            auto remainingCount   = [&](const Board& b){ int c=0; for (int v=1; v<=b.getSize(); ++v) if (!b.isSquareCovered(v)) ++c; return c; };

            int diceCount = 2;
            if (oneDieAllowed && (highestUncovered(board) <= 6 || remainingCount(board) <= 3)) diceCount = 1;

            static thread_local std::mt19937_64 rng(std::random_device{}());
            std::uniform_int_distribution<int> dieDist(1,6);
            const int d1 = dieDist(rng);
            const int d2 = (diceCount==2) ? dieDist(rng) : 0;
            sum = d1 + d2;
            std::string diceWhy;
            if (!oneDieAllowed) {
                diceWhy = "must use 2 dice (1-die not allowed until 7.." + std::to_string(board.getSize()) + " are covered)";
            } else if (diceCount == 1) {
                int hi = highestUncovered(board);
                int rem = remainingCount(board);
                if (hi <= 6)      diceWhy = "1 die because highest remaining square <= 6 (aiming small)";
                else if (rem <= 3) diceWhy = "1 die because only " + std::to_string(rem) + " squares remain (lower bust risk)";
                else               diceWhy = "1 die (heuristic)";
            } else {
                diceWhy = "2 dice to reach sums > 6 (need higher targets)";
            }

            cout << "Chooses to roll " << (diceCount==1 ? "1 die" : "2 dice")
                 << " " << c(DIM) << "(" << diceWhy << ")" << c(RESET) << ".\n";
            if (diceCount==2) cout << "Rolled: " << d1 << " + " << d2 << " = " << sum << "\n";
            else              cout << "Rolled: " << d1 << " = " << sum
                                   << " " << c(DIM) << "(1-die allowed)" << c(RESET) << "\n";

            const bool canCover   = !board.findValidCombinations(sum, /*forCovering=*/true ).empty();
            const bool canUncover = !humanBoard.findValidCombinations(sum, /*forCovering=*/false).empty();

            if (!canCover && !canUncover) {
                cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                return true;
            }

            cout << c(GREEN) << "Decision: " << c(RESET)
                 << (shouldCover(sum) ? "Cover own squares" : "Uncover opponent squares") << "\n";

            if (shouldCover(sum)) coverSquares(sum);
            else                  uncoverSquares(sum);
        }

        boardView.display(
    Tournament::getAdvantageApplied() &&
    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
    Tournament::getAdvantageSquare());

        humanBoardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Human,
            Tournament::getAdvantageSquare());

        std::cout << "\n";

        if (board.allCovered()) return true;
    }
}

bool Computer::shouldCover(const int sum) const {
    const set<set<int>> coverCombos = board.findValidCombinations(sum, true);
    set<set<int>> uncoverCombos = humanBoard.findValidCombinations(sum, false);

    if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
        for (auto it = uncoverCombos.begin(); it != uncoverCombos.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) it = uncoverCombos.erase(it);
            else ++it;
        }
    }

    if (coverCombos.empty()) return false;
    if (uncoverCombos.empty()) return true;

    for (const auto &combo : coverCombos) {
        Board simulated = board;
        for (int v : combo) simulated.coverSquare(v);
        if (simulated.allCovered()) return true;
    }

    auto bestOf = [](const set<set<int>> &combos){
        set<int> bestC; size_t bestCount = 0; int bestSum = -1;
        for (const auto &c : combos) {
            size_t cnt = c.size(); int s = 0; for (int v : c) s += v;
            if (cnt > bestCount || (cnt == bestCount && s > bestSum)) { bestC = c; bestCount = cnt; bestSum = s; }
        }
        return bestC;
    };

    const auto bestCover = bestOf(coverCombos);
    const auto bestUncover = bestOf(uncoverCombos);

    return bestCover.size() >= bestUncover.size();
}

void Computer::coverSquares(const int sum) const {
    const set<set<int>> validCombinations = board.findValidCombinations(sum, true);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to cover squares. Turn ends." << endl;
        return;
    }

    for (const auto &combination : validCombinations) {
        Board simulated = board;
        for (int v : combination) simulated.coverSquare(v);
        if (simulated.allCovered()) {
            cout << "Computer chooses a WINNING cover: ";
            for (int v : combination) cout << v << " ";
            cout << "\n";
            for (int v : combination) board.coverSquare(v);
            return;
        }
    }

    set<int> selectedCombination;
    size_t maxSquares = 0;
    int maxSum = -1;
    for (const set<int>& combination : validCombinations) {
        int currentSum = 0;
        for (int val : combination) currentSum += val;
        if (combination.size() > maxSquares || (combination.size() == maxSquares && currentSum > maxSum)) {
            selectedCombination = combination;
            maxSquares = combination.size();
            maxSum = currentSum;
        }
    }

    cout << "Computer chooses to cover the following squares: ";
    for (const int square : selectedCombination) {
        cout << square << " ";
    }
    cout << "because covering more squares gives it a better chance of winning." << endl;

    for (const int square : selectedCombination) {
        board.coverSquare(square);
    }
}

void Computer::uncoverSquares(const int sum) const {
    set<set<int>> validCombinations = humanBoard.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
        for (auto it = validCombinations.begin(); it != validCombinations.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) it = validCombinations.erase(it);
            else ++it;
        }
    }

    set<int> selectedCombination;
    size_t maxSquares = 0;
    int maxSum = -1;
    for (const set<int>& combination : validCombinations) {
        int currentSum = 0;
        for (int val : combination) currentSum += val;
        if (combination.size() > maxSquares || (combination.size() == maxSquares && currentSum > maxSum)) {
            selectedCombination = combination;
            maxSquares = combination.size();
            maxSum = currentSum;
        }
    }

    cout << "Computer chooses to uncover the following squares: ";
    for (const int square : selectedCombination) cout << square << " ";
    cout << "because uncovering more squares reduces your chances of winning." << endl;

    for (const int square : selectedCombination) {
        humanBoard.uncoverSquare(square);
    }
}

void Computer::provideHelp(const int diceSum,
                           const Board& humanBoard,
                           const Board& computerBoard) const
{
    banner("Help");
    std::cout << "Dice sum: " << diceSum << "\n";

    auto printCombos = [](const std::set<std::set<int>>& combos) {
        int idx = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << idx++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    };
    auto best = [](const std::set<std::set<int>>& combos) {
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

    const auto coverCombos   = humanBoard.findValidCombinations(diceSum, /*forCovering=*/true);
    const auto uncoverCombos = computerBoard.findValidCombinations(diceSum, /*forCovering=*/false);

    section("Cover options (your board)");
    if (coverCombos.empty()) std::cout << "  none\n";
    else printCombos(coverCombos);

    section("Uncover options (opponent board)");
    if (uncoverCombos.empty()) std::cout << "  none\n";
    else printCombos(uncoverCombos);

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

    if (Tournament::getAdvantageApplied()) {
        std::cout << "\n" << c(YELLOW) << "Note:" << c(RESET)
                  << " advantage square " << Tournament::getAdvantageSquare()
                  << " is protected for one turn.\n";
    }

    hr();
}
