#include "../Header Files/Computer.h"
#include <iostream>
#include <string>
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"
#include <random>
#include <limits>
#include <set>

using namespace std;
using namespace ui;

// =====================================================================
// Shared Strategy Engine
// =====================================================================
namespace {

    struct StrategyResult {
        enum class Action { None, Cover, Uncover };
        Action action;
        std::set<int> combo;
    };

    int sumOf(const std::set<int>& s) {
        int total = 0;
        for (int v : s) total += v;
        return total;
    }

    std::set<int> chooseBestCombo(const std::set<std::set<int>>& combos) {
        std::set<int> best;
        int bestCount = -1;
        int bestSum   = -1;
        for (const auto& c : combos) {
            int cnt = static_cast<int>(c.size());
            int s   = sumOf(c);
            if (cnt > bestCount || (cnt == bestCount && s > bestSum)) {
                best      = c;
                bestCount = cnt;
                bestSum   = s;
            }
        }
        return best;
    }

    // Helper utilities (avoid lambdas as requested)
    char readYN_input() {
        char c;
        while (true) {
            if (std::cin >> c) {
                if (c >= 'A' && c <= 'Z') c = static_cast<char>(c - 'A' + 'a');
                if (c == 'y' || c == 'n') return c;
            }
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Please enter y or n: ";
        }
    }

    int readDie_input(const char* prompt) {
        int v;
        while (true) {
            std::cout << prompt;
            if (std::cin >> v && v >= 1 && v <= 6) return v;
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Please enter a number 1..6.\n";
        }
    }

    int highestUncoveredFunc(const Board& b) {
        for (int v = b.getSize(); v >= 1; --v)
            if (!b.isSquareCovered(v)) return v;
        return 0;
    }

    int remainingCountFunc(const Board& b) {
        int c = 0;
        for (int v = 1; v <= b.getSize(); ++v)
            if (!b.isSquareCovered(v)) ++c;
        return c;
    }

    void printCombosFunc(const std::set<std::set<int>>& combos) {
        int i = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << i++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    }

    void applyCover(Board& b, const std::set<int>& combo) {
        for (int v : combo) {
            std::cout << v << " ";
            b.coverSquare(v);
        }
    }

    void applyUncover(Board& hb, const std::set<int>& combo) {
        for (int v : combo) {
            std::cout << v << " ";
            hb.uncoverSquare(v);
        }
    }

    // -----------------------------------------------------------------
    // computeBestMove
    //  - sum: dice sum
    //  - myBoard: board of the player making the move
    //  - oppBoard: opponent's board
    //  - oppProtected: true if opponent's advantage square is protected
    //
    // Returns:
    //   StrategyResult::Action::None  -> no legal moves
    //   StrategyResult::Action::Cover -> cover 'combo' on myBoard
    //   StrategyResult::Action::Uncover -> uncover 'combo' on oppBoard
    // -----------------------------------------------------------------
    StrategyResult computeBestMove(int sum,
                                   const Board& myBoard,
                                   const Board& oppBoard,
                                   bool oppProtected)
    {
        StrategyResult res{StrategyResult::Action::None, {}};

        std::set<std::set<int>> coverCombos   = myBoard.findValidCombinations(sum, /*forCovering=*/true);
        std::set<std::set<int>> uncoverCombos = oppBoard.findValidCombinations(sum, /*forCovering=*/false);

        // Filter out combos that hit the protected advantage square on the opponent
        if (oppProtected) {
            int adv = Tournament::getAdvantageSquare();
            for (auto it = uncoverCombos.begin(); it != uncoverCombos.end(); ) {
                if (it->contains(adv)) it = uncoverCombos.erase(it);
                else ++it;
            }
        }

        // No legal moves at all
        if (coverCombos.empty() && uncoverCombos.empty()) {
            return res;
        }

        // --- Step 1: Look for immediate wins (cover or uncover) ----------------
        std::set<std::set<int>> winningCover;
        std::set<std::set<int>> winningUncover;

        for (const auto& combo : coverCombos) {
            Board sim = myBoard;
            for (int v : combo) sim.coverSquare(v);
            if (sim.allCovered()) winningCover.insert(combo);
        }

        for (const auto& combo : uncoverCombos) {
            Board simOpp = oppBoard;
            for (int v : combo) simOpp.uncoverSquare(v);
            if (simOpp.allUncovered()) winningUncover.insert(combo);
        }

        if (!winningCover.empty() || !winningUncover.empty()) {
            // If only one type of winning move exists, use it
            if (!winningCover.empty() && winningUncover.empty()) {
                res.action = StrategyResult::Action::Cover;
                res.combo  = chooseBestCombo(winningCover);
                return res;
            }
            if (winningCover.empty() && !winningUncover.empty()) {
                res.action = StrategyResult::Action::Uncover;
                res.combo  = chooseBestCombo(winningUncover);
                return res;
            }

            // Both types can win: choose by same heuristic (count -> sum)
            std::set<int> bestWinCover   = chooseBestCombo(winningCover);
            std::set<int> bestWinUncover = chooseBestCombo(winningUncover);

            int countCover   = static_cast<int>(bestWinCover.size());
            int countUncover = static_cast<int>(bestWinUncover.size());

            if (countCover > countUncover) {
                res.action = StrategyResult::Action::Cover;
                res.combo  = bestWinCover;
            } else if (countUncover > countCover) {
                res.action = StrategyResult::Action::Uncover;
                res.combo  = bestWinUncover;
            } else {
                int sumCover   = sumOf(bestWinCover);
                int sumUncover = sumOf(bestWinUncover);
                if (sumCover >= sumUncover) {
                    res.action = StrategyResult::Action::Cover;
                    res.combo  = bestWinCover;
                } else {
                    res.action = StrategyResult::Action::Uncover;
                    res.combo  = bestWinUncover;
                }
            }
            return res;
        }

        // --- Step 2: No immediate win: heuristic best move ---------------------
        if (coverCombos.empty()) {
            res.action = StrategyResult::Action::Uncover;
            res.combo  = chooseBestCombo(uncoverCombos);
            return res;
        }
        if (uncoverCombos.empty()) {
            res.action = StrategyResult::Action::Cover;
            res.combo  = chooseBestCombo(coverCombos);
            return res;
        }

        std::set<int> bestCover   = chooseBestCombo(coverCombos);
        std::set<int> bestUncover = chooseBestCombo(uncoverCombos);

        int countCover   = static_cast<int>(bestCover.size());
        int countUncover = static_cast<int>(bestUncover.size());

        if (countCover > countUncover) {
            res.action = StrategyResult::Action::Cover;
            res.combo  = bestCover;
        } else if (countUncover > countCover) {
            res.action = StrategyResult::Action::Uncover;
            res.combo  = bestUncover;
        } else {
            int sumCover   = sumOf(bestCover);
            int sumUncover = sumOf(bestUncover);
            if (sumCover >= sumUncover) {
                res.action = StrategyResult::Action::Cover;
                res.combo  = bestCover;
            } else {
                res.action = StrategyResult::Action::Uncover;
                res.combo  = bestUncover;
            }
        }

        return res;
    }

} // anonymous namespace

// =====================================================================
// Computer methods
// =====================================================================

Computer::Computer(Board& b, Board& humanBoard)
    : Player(b, false),
      boardView(b, "Computer"),
      humanBoardView(humanBoard, "Human"),
      humanBoard(humanBoard) {}

// ---------------------------------------------------------------------
// Computer::takeTurn
// ---------------------------------------------------------------------
bool Computer::takeTurn() {
    using std::cout; using std::cin; using std::endl;

    cout << "Do you want to enter the die manually for the computer? (y/n): ";
    const char manual = readYN_input();

    int sum = 0;

    // =============================================================
    // MANUAL MODE (for testing)
    // =============================================================
    if (manual == 'y') {
        const bool oneDieAllowed = board.canThrowOneDie();
        int diceCount = 2;

        if (oneDieAllowed) {
            cout << "1-die is allowed (" << Board::ONE_DIE_RULE_START << ".."
                 << board.getSize() << " are covered). Use 1 die? (y/n): ";
            diceCount = (readYN_input()=='y') ? 1 : 2;
        } else {
            cout << "1-die is NOT allowed (must use 2 dice).\n";
            diceCount = 2;
        }

        const int d1 = readDie_input("Enter die 1 (1-6): ");
        const int d2 = (diceCount==2) ? readDie_input("Enter die 2 (1-6): ") : 0;
        sum = d1 + d2;
        cout << "Computer (manual) rolled: " << d1
             << ((diceCount==2) ? " + " : " = ")
             << ((diceCount==2) ? std::to_string(d2) + " = " : "")
             << sum << "\n";

        auto coverCombos   = board.findValidCombinations(sum, /*forCovering=*/true);
        auto uncoverCombos = humanBoard.findValidCombinations(sum, /*forCovering=*/false);

        // Respect advantage protection for HUMAN (opponent)
        if (Tournament::getAdvantageApplied() && Tournament::isHumanAdvantageProtected()) {
            int adv = Tournament::getAdvantageSquare();
            for (auto it = uncoverCombos.begin(); it != uncoverCombos.end(); ) {
                if (it->contains(adv)) it = uncoverCombos.erase(it);
                else ++it;
            }
        }

        if (coverCombos.empty() && uncoverCombos.empty()) {
            cout << "Computer has no legal moves for this roll. Its turn ends.\n";
            return true;
        }

        // Use the same automated strategy engine to pick the best action and combo
        bool oppProtected =
            Tournament::getAdvantageApplied() &&
            Tournament::isHumanAdvantageProtected();

        StrategyResult best = computeBestMove(sum, board, humanBoard, oppProtected);

        if (best.action == StrategyResult::Action::None) {
            cout << "Computer has no legal moves for this roll. Its turn ends.\n";
            return true;
        }

        cout << c(GREEN) << "Computer: " << c(RESET)
             << (best.action == StrategyResult::Action::Cover
                 ? "Cover own squares"
                 : "Uncover opponent squares");
        cout << " (";
        if (best.action == StrategyResult::Action::Cover) applyCover(board, best.combo);
        else applyUncover(humanBoard, best.combo);
        cout << ")\n";
    }

    // =============================================================
    // AUTOMATIC AI MODE
    // =============================================================
    else {
        const bool oneDieAllowed = board.canThrowOneDie();


        int diceCount = 2;
        if (oneDieAllowed &&
            (highestUncoveredFunc(board) <= 6 || remainingCountFunc(board) <= 3))
         {
             diceCount = 1;
         }

        static thread_local std::mt19937_64 rng(std::random_device{}());
        std::uniform_int_distribution<int> dieDist(1,6);
        const int d1 = dieDist(rng);
        const int d2 = (diceCount==2) ? dieDist(rng) : 0;
        sum = d1 + d2;

        std::string diceWhy;
        if (!oneDieAllowed) {
            diceWhy = "must use 2 dice (1-die not allowed until 7.."
                    + std::to_string(board.getSize())
                    + " are covered)";
        } else if (diceCount == 1) {
            int hi  = highestUncoveredFunc(board);
            int rem = remainingCountFunc(board);
            if (hi <= 6)
                diceWhy = "1 die because highest remaining square <= 6 (aiming small)";
            else if (rem <= 3)
                diceWhy = "1 die because only " + std::to_string(rem) + " squares remain (lower bust risk)";
            else
                diceWhy = "1 die (heuristic)";
        } else {
            diceWhy = "2 dice to reach sums > 6 (need higher targets)";
        }

        cout << "Chooses to roll " << (diceCount==1 ? "1 die" : "2 dice")
             << " " << c(DIM) << "(" << diceWhy << ")" << c(RESET) << ".\n";
        if (diceCount==2)
            cout << "Rolled: " << d1 << " + " << d2 << " = " << sum << "\n";
        else
            cout << "Rolled: " << d1 << " = " << sum
                 << " " << c(DIM) << "(1-die allowed)" << c(RESET) << "\n";

        bool oppProtected =
            Tournament::getAdvantageApplied() &&
            Tournament::isHumanAdvantageProtected();

        StrategyResult best =
            computeBestMove(sum, board, humanBoard, oppProtected);

        if (best.action == StrategyResult::Action::None) {
            cout << "Computer has no legal moves for this roll. Its turn ends.\n";
            return true;
        }

        cout << c(GREEN) << "Decision: " << c(RESET)
             << (best.action == StrategyResult::Action::Cover
                 ? "Cover own squares"
                 : "Uncover opponent squares")
             << " (manual mode auto-select)\n";

        // Preserve the 'winning' messaging, then apply moves using helpers
        bool isWinning = false;
        if (best.action == StrategyResult::Action::Cover) {
            Board sim = board;
            for (int v : best.combo) sim.coverSquare(v);
            isWinning = sim.allCovered();
            if (isWinning) cout << "Computer chooses a WINNING cover: ";
            else cout << "Computer chooses to cover: ";
        } else {
            Board simOpp = humanBoard;
            for (int v : best.combo) simOpp.uncoverSquare(v);
            isWinning = simOpp.allUncovered();
            if (isWinning) cout << "Computer chooses a WINNING uncover: ";
            else cout << "Computer chooses to uncover: ";
        }

        if (best.action == StrategyResult::Action::Cover) applyCover(board, best.combo);
        else applyUncover(humanBoard, best.combo);
        cout << "\n";
    }

    // Show resulting boards
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

// ---------------------------------------------------------------------
// shouldCover: kept for compatibility, uses shared brain
// ---------------------------------------------------------------------
bool Computer::shouldCover(const int sum) const {
    bool oppProtected =
        Tournament::getAdvantageApplied() &&
        Tournament::isHumanAdvantageProtected();

    StrategyResult res =
        computeBestMove(sum, board, humanBoard, oppProtected);

    return res.action == StrategyResult::Action::Cover;
}

// ---------------------------------------------------------------------
// coverSquares: kept for compatibility (not used by AI anymore)
// ---------------------------------------------------------------------
void Computer::coverSquares(const int sum) const {
    const std::set<std::set<int>> validCombinations =
        board.findValidCombinations(sum, true);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to cover squares. Turn ends."
             << endl;
        return;
    }

    // Try to win if possible
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

    std::set<int> selectedCombination;
    size_t maxSquares = 0;
    int maxSum        = -1;
    for (const std::set<int>& combination : validCombinations) {
        int currentSum = 0;
        for (int val : combination) currentSum += val;
        if (combination.size() > maxSquares ||
            (combination.size() == maxSquares && currentSum > maxSum))
        {
            selectedCombination = combination;
            maxSquares          = combination.size();
            maxSum              = currentSum;
        }
    }

    cout << "Computer chooses to cover the following squares: ";
    for (const int square : selectedCombination) cout << square << " ";
    cout << "because covering more squares gives it a better chance of winning."
         << endl;

    for (const int square : selectedCombination) board.coverSquare(square);
}

// ---------------------------------------------------------------------
// uncoverSquares: kept for compatibility (not used by AI anymore)
// ---------------------------------------------------------------------
void Computer::uncoverSquares(const int sum) const {
    std::set<std::set<int>> validCombinations =
        humanBoard.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "Computer has no valid moves to uncover squares. Turn ends."
             << endl;
        return;
    }

    if (Tournament::getAdvantageApplied() &&
        Tournament::isHumanAdvantageProtected())
    {
        int adv = Tournament::getAdvantageSquare();
        for (auto it = validCombinations.begin();
             it != validCombinations.end(); )
        {
            if (it->contains(adv)) it = validCombinations.erase(it);
            else ++it;
        }

        if (validCombinations.empty()) {
            cout << "Computer has no valid moves to uncover squares. Turn ends."
                 << endl;
            return;
        }
    }

    // Try to win if possible
    for (const auto &combination : validCombinations) {
        Board simulated = humanBoard;
        for (int v : combination) simulated.uncoverSquare(v);
        if (simulated.allUncovered()) {
            cout << "Computer chooses a WINNING uncover: ";
            for (int v : combination) cout << v << " ";
            cout << "\n";
            for (int v : combination) humanBoard.uncoverSquare(v);
            return;
        }
    }

    std::set<int> selectedCombination;
    size_t maxSquares = 0;
    int maxSum        = -1;
    for (const std::set<int>& combination : validCombinations) {
        int currentSum = 0;
        for (int val : combination) currentSum += val;
        if (combination.size() > maxSquares ||
            (combination.size() == maxSquares && currentSum > maxSum))
        {
            selectedCombination = combination;
            maxSquares          = combination.size();
            maxSum              = currentSum;
        }
    }

    cout << "Computer chooses to uncover the following squares: ";
    for (const int square : selectedCombination) cout << square << " ";
    cout << "because uncovering more squares reduces your chances of winning."
         << endl;

    for (const int square : selectedCombination)
        humanBoard.uncoverSquare(square);
}

// ---------------------------------------------------------------------
// provideHelp: uses EXACTLY the same strategy engine as the AI
// ---------------------------------------------------------------------
void Computer::provideHelp(const int diceSum,
                           const Board& humanBoard,
                           const Board& computerBoard) const
{
    banner("Help");
    std::cout << "Dice sum: " << diceSum << "\n";

    // All legal options BEFORE recommendation
    std::set<std::set<int>> coverCombos =
        humanBoard.findValidCombinations(diceSum, /*forCovering=*/true);
    std::set<std::set<int>> uncoverCombos =
        computerBoard.findValidCombinations(diceSum, /*forCovering=*/false);

    bool oppProtected =
        Tournament::getAdvantageApplied() &&
        Tournament::isComputerAdvantageProtected();

    if (oppProtected) {
        int adv = Tournament::getAdvantageSquare();
        for (auto it = uncoverCombos.begin();
             it != uncoverCombos.end(); )
        {
            if (it->contains(adv)) it = uncoverCombos.erase(it);
            else ++it;
        }
    }

    section("Cover options (your board)");
    if (coverCombos.empty()) std::cout << "  none\n";
    else printCombosFunc(coverCombos);

    section("Uncover options (opponent board)");
    if (uncoverCombos.empty()) std::cout << "  none\n";
    else printCombosFunc(uncoverCombos);

    if (coverCombos.empty() && uncoverCombos.empty()) {
        std::cout << "\nNo legal moves. You must pass.\n";
        if (Tournament::getAdvantageApplied()) {
            std::cout << "\n" << c(YELLOW) << "Note:" << c(RESET)
                      << " advantage square " << Tournament::getAdvantageSquare()
                      << " is protected for one turn.\n";
        }
        hr();
        return;
    }

    // Use the SAME strategy engine as the AI
    StrategyResult best =
        computeBestMove(diceSum, humanBoard, computerBoard, oppProtected);

    if (best.action == StrategyResult::Action::None) {
        std::cout << "\nNo legal moves. You must pass.\n";
        hr();
        return;
    }

    if (best.action == StrategyResult::Action::Cover) {
        std::cout << "\n" << c(GREEN) << "Recommended: COVER  " << c(RESET);
        for (int v : best.combo) std::cout << v << " ";
        std::cout << "\n" << c(DIM)
                  << "Reason: This move is evaluated as strongest by the same "
                     "strategy the computer uses (wins first, then max squares, "
                     "then highest values).\n"
                  << c(RESET);
    } else {
        std::cout << "\n" << c(GREEN) << "Recommended: UNCOVER  " << c(RESET);
        for (int v : best.combo) std::cout << v << " ";
        std::cout << "\n" << c(DIM)
                  << "Reason: This move is evaluated as strongest by the same "
                     "strategy the computer uses (wins first, then max squares, "
                     "then highest values).\n"
                  << c(RESET);
    }

    if (Tournament::getAdvantageApplied()) {
        std::cout << "\n" << c(YELLOW) << "Note:" << c(RESET)
                  << " advantage square " << Tournament::getAdvantageSquare()
                  << " is protected for one turn.\n";
    }

    hr();
}
