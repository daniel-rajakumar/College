#include "../Header Files/Computer.h"
#include <iostream>
#include <string>
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"
#include <random>
#include <limits>
#include <set>
#include <utility>

using namespace std;
using namespace ui;

// =====================================================================
// Shared Strategy Engine  (NOW JAVA-LIKE)
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

    int highestSquareOf(const std::set<int>& s) {
        int hi = 0;
        for (int v : s) if (v > hi) hi = v;
        return hi;
    }

    // Java-style "best": max (count), then max (highestSquare)
    std::set<int> chooseBestComboJava(const std::set<std::set<int>>& combos) {
        std::set<int> best;
        int bestCount = -1;
        int bestHigh  = -1;

        for (const auto& c : combos) {
            int cnt  = static_cast<int>(c.size());
            int high = highestSquareOf(c);

            if (cnt > bestCount || (cnt == bestCount && high > bestHigh)) {
                best      = c;
                bestCount = cnt;
                bestHigh  = high;
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
    // computeBestMove (JAVA-LIKE VERSION)
    //
    // Matches your Java chooseMove() logic:
    //  1) If any cover combo size == myUncoveredCount => cover it
    //  2) Else if any uncover combo size == oppCoveredCount => uncover it
    //  3) Else candidates = cover if any cover exists else uncover
    //  4) Choose best by: max(count), then max(highestSquare)
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

        // Java Step 1: winning cover by "count == myUncoveredCount"
        int myUncoveredCount = 0;
        for (int i = 1; i <= myBoard.getSize(); i++) {
            if (!myBoard.isSquareCovered(i)) myUncoveredCount++;
        }
        for (const auto& combo : coverCombos) {
            if (static_cast<int>(combo.size()) == myUncoveredCount) {
                res.action = StrategyResult::Action::Cover;
                res.combo  = combo; // closest to "first match" behavior
                return res;
            }
        }

        // Java Step 2: winning uncover by "count == oppCoveredCount"
        int oppCoveredCount = 0;
        for (int i = 1; i <= oppBoard.getSize(); i++) {
            if (oppBoard.isSquareCovered(i)) oppCoveredCount++;
        }
        for (const auto& combo : uncoverCombos) {
            if (static_cast<int>(combo.size()) == oppCoveredCount) {
                res.action = StrategyResult::Action::Uncover;
                res.combo  = combo;
                return res;
            }
        }

        // Java Step 3: prefer cover if available
        const std::set<std::set<int>>* candidates = nullptr;
        StrategyResult::Action chosenAction = StrategyResult::Action::None;

        if (!coverCombos.empty()) {
            candidates = &coverCombos;
            chosenAction = StrategyResult::Action::Cover;
        } else {
            candidates = &uncoverCombos;
            chosenAction = StrategyResult::Action::Uncover;
        }

        if (!candidates || candidates->empty()) {
            return res;
        }

        // Java Step 4: best candidate by (count, then highestSquare)
        res.action = chosenAction;
        res.combo  = chooseBestComboJava(*candidates);
        return res;
    }

    // Helper to check whether applying the combo in 'res' would immediately
    // win for the acting player (cover all own squares) or for the opponent
    // (uncover all opponent squares).
    inline bool isComboWinning(const StrategyResult& res, const Board& myBoard, const Board& oppBoard) {
        if (res.action == StrategyResult::Action::Cover) {
            Board sim = myBoard;
            for (int v : res.combo) sim.coverSquare(v);
            return sim.allCovered();
        } else if (res.action == StrategyResult::Action::Uncover) {
            Board simOpp = oppBoard;
            for (int v : res.combo) simOpp.uncoverSquare(v);
            return simOpp.allUncovered();
        }
        return false;
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

    // Show the same colored section header as the human turn (once per turn)
    section("Computer Turn");

    // The computer should keep taking rolls until it has no legal moves
    // (same behavior as the human). Loop each roll/decision cycle here.
    while (true) {
         cout << "Do you want to enter the die manually for the computer? (y/n): ";
         const char manual = readYN_input();

         int sum = 0;

         // =============================================================
         // MANUAL MODE (for testing)
         // =============================================================
         if (manual == 'y') {
              const bool oneDieAllowed = board.canThrowOneDie();
              int diceCount;

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

            // Java-like strategy engine
            bool oppProtected =
                Tournament::getAdvantageApplied() &&
                Tournament::isHumanAdvantageProtected();

            StrategyResult best = computeBestMove(sum, board, humanBoard, oppProtected);

            if (best.action == StrategyResult::Action::None) {
                cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                return true;
            }

            // Build a human-friendly explanation for the chosen move
            bool isWinning = isComboWinning(best, board, humanBoard);

            cout << c(GREEN)
                 << (best.action == StrategyResult::Action::Cover ? "Computer chooses to COVER: " : "Computer chooses to UNCOVER: ")
                 << c(RESET);
            for (int v : best.combo) cout << v << " ";
            cout << "\n";

            int chosenCount = static_cast<int>(best.combo.size());
            int chosenSum = sumOf(best.combo);
            if (isWinning) {
                cout << c(YELLOW) << "Reason: This move immediately wins the round." << c(RESET) << "\n";
            } else {
                cout << "Reason: Chosen as the strongest option — affects " << chosenCount
                     << " squares (total value " << chosenSum << ").\n";
            }

            if (best.action == StrategyResult::Action::Cover) applyCover(board, best.combo);
            else applyUncover(humanBoard, best.combo);

            if (isWinning) {
                cout << c(YELLOW) << "Note: This move wins the round." << c(RESET) << "\n";
            }
         }

          // =============================================================
          // AUTOMATIC AI MODE
          // =============================================================
         else {
             const bool oneDieAllowed = board.canThrowOneDie();

             int diceCount;
             if (oneDieAllowed &&
                 (highestUncoveredFunc(board) <= 6 || remainingCountFunc(board) <= 3))
              {
                  diceCount = 1;
              } else {
                  diceCount = 2;
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

             StrategyResult best = computeBestMove(sum, board, humanBoard, oppProtected);

             if (best.action == StrategyResult::Action::None) {
                 cout << "Computer has no legal moves for this roll. Its turn ends.\n";
                 return true;
             }

             bool isWinningA = isComboWinning(best, board, humanBoard);

             cout << c(GREEN)
                  << (best.action == StrategyResult::Action::Cover ? "Computer decides to COVER: " : "Computer decides to UNCOVER: ")
                  << c(RESET);
             for (int v : best.combo) cout << v << " ";
             cout << "\n";

             int chosenCount = static_cast<int>(best.combo.size());
             int chosenSum = sumOf(best.combo);
             if (isWinningA) {
                 cout << c(YELLOW) << "Reason: This move immediately wins the round." << c(RESET) << "\n";
             } else {
                 cout << "Reason: Chosen as the strongest option — affects " << chosenCount
                      << " squares (total value " << chosenSum << ").\n";
             }

             if (best.action == StrategyResult::Action::Cover) applyCover(board, best.combo);
             else applyUncover(humanBoard, best.combo);

             if (isWinningA) {
                 cout << c(YELLOW) << "Note: This move wins the round." << c(RESET) << "\n";
             }
             cout << "\n";
        }

        // Show resulting boards after the move
        boardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Computer,
            Tournament::getAdvantageSquare());

        humanBoardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Human,
            Tournament::getAdvantageSquare());

        std::cout << "\n";

        // If the computer covered all its squares, end turn
        if (board.allCovered()) return true;

        // If the computer's move uncovered all human squares, end turn so
        // the Round can detect and declare the winner immediately.
        if (humanBoard.allUncovered()) return true;

        // Otherwise loop to allow the computer to roll again.
    }

    return true;
}

// ---------------------------------------------------------------------
// shouldCover: kept for compatibility, uses shared brain (NOW JAVA-LIKE)
// ---------------------------------------------------------------------
bool Computer::shouldCover(const int sum) const {
    bool oppProtected =
        Tournament::getAdvantageApplied() &&
        Tournament::isHumanAdvantageProtected();

    StrategyResult res =
        computeBestMove(sum, board, humanBoard, oppProtected);

    bool result = (res.action == StrategyResult::Action::Cover);
    return result;
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
    std::cout << "Dice sum: " << diceSum << "\n\n";

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

    section("Possible moves to COVER (your board)");
    if (coverCombos.empty()) std::cout << "  none\n";
    else printCombosFunc(coverCombos);

    section("Possible moves to UNCOVER (opponent board)");
    if (uncoverCombos.empty()) std::cout << "  none\n";
    else printCombosFunc(uncoverCombos);

    if (coverCombos.empty() && uncoverCombos.empty()) {
        std::cout << "\nNo legal moves available. You must pass this turn.\n";
        if (Tournament::getAdvantageApplied()) {
            std::cout << "\n" << c(YELLOW) << "Note:" << c(RESET)
                      << " advantage square " << Tournament::getAdvantageSquare()
                      << " is protected for one turn.\n";
        }
        hr();
        return;
    }

    // Use the SAME (java-like) strategy engine as the AI to compute the recommendation
    StrategyResult best = computeBestMove(diceSum, humanBoard, computerBoard, oppProtected);

    // Compute simple metrics for the recommended move and alternatives
    auto explainCombo = [](const std::set<int>& combo) {
        int cnt = static_cast<int>(combo.size());
        int s = 0; for (int v : combo) s += v;
        return std::pair<int,int>(cnt, s);
    };

    if (best.action == StrategyResult::Action::None) {
        std::cout << "\nNo legal moves. You must pass.\n";
        hr();
        return;
    }

    // Present the recommendation in human friendly language
    std::cout << "\n" << c(GREEN) << "RECOMMENDATION: " << c(RESET);
    if (best.action == StrategyResult::Action::Cover) {
        std::cout << "Cover these squares: ";
    } else {
        std::cout << "Uncover these opponent squares: ";
    }
    for (int v : best.combo) std::cout << v << " ";
    std::cout << "\n\n";

    // Provide a concise human-friendly 'why' (one or two sentences)
    auto [chosenCount, chosenSum] = explainCombo(best.combo);
    if (isComboWinning(best, humanBoard, computerBoard)) {
        std::cout << c(DIM) << "Why: This move immediately wins the round." << c(RESET) << "\n";
    } else {
        std::cout << c(DIM) << "Why: Chosen as the strongest option — affects " << chosenCount
                  << " squares (value " << chosenSum << ")." << c(RESET) << "\n";
    }

    hr();
}
