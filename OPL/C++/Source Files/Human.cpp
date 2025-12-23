/**
 * @file Human.cpp
 * @brief Implementation of the Human player: interactive input and move selection.
 */

#include "../Header Files/Human.h"
#include <iostream>
#include "../Header Files/Computer.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/TextUI.h"
#include <random>
#include <limits>

namespace {
    /**
     * @brief Read a 'y'/'n' response from stdin for human prompts.
     * @return Lowercase 'y' or 'n'
     */
    char readYN_input_human() {
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

    /**
     * @brief Prompt the human to enter a die value between 1 and 6.
     * @param prompt Text prompt shown to the user
     * @return Valid die value
     */
    int readDie_input_human(const char* prompt) {
        int v;
        while (true) {
            std::cout << prompt;
            if (std::cin >> v && v >= 1 && v <= 6) return v;
            std::cin.clear();
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            std::cout << "Please enter a number 1..6.\n";
        }
    }

    /**
     * @brief Print combinations for the human to choose from.
     * @param combos Set of combinations (each combination is a set of ints)
     */
    void printCombosFunc_human(const std::set<std::set<int>>& combos) {
        int idx = 1;
        for (const auto& c : combos) {
            std::cout << "  [" << idx++ << "] ";
            for (int v : c) std::cout << v << " ";
            std::cout << "\n";
        }
    }
}

using namespace std;
using namespace ui;

/**
 * @brief Construct a Human player bound to their board and the opponent board.
 * @param b Reference to the human's board
 * @param computerBoard Reference to the computer's board
 */
Human::Human(Board& b, Board& computerBoard)
    : Player(b, true), boardView(b, "Human"), computerBoardView(computerBoard, "Computer"), computerBoard(computerBoard) {}

/**
 * @brief Handle the interactive human turn: roll dice (manual or random),
 *        optionally request help, and choose cover/uncover moves.
 * @return true if the human's turn ends normally
 */
bool Human::takeTurn() {
    using namespace ui;
    using std::cout; using std::cin;

    while (true) {
        section("Human Turn");

        // Step 1: Dice configuration
        cout << "Do you want to enter the die manually? (y/n): ";
        const char manual = readYN_input_human();

        const bool oneDieAllowed = board.canThrowOneDie();
        int diceCount = 2;

        if (oneDieAllowed) {
            cout << "You may use 1 die (" << Board::ONE_DIE_RULE_START << ".." << board.getSize() << " are covered). Use 1 die? (y/n): ";
            diceCount = (readYN_input_human()=='y') ? 1 : 2;
        } else {
            cout << "1-die is NOT allowed (must use 2 dice).\n";
            diceCount = 2;
        }

        // Step 2: Roll dice (manual or random)
        int d1 = 0, d2 = 0, sum = 0;
        if (manual == 'y') {
            d1 = readDie_input_human("Enter die 1 (1-6): ");
            d2 = (diceCount==2) ? readDie_input_human("Enter die 2 (1-6): ") : 0;
        } else {
            static thread_local std::mt19937_64 rng(std::random_device{}());
            std::uniform_int_distribution<int> dieDist(1,6);
            d1 = dieDist(rng);
            d2 = (diceCount==2) ? dieDist(rng) : 0;
        }
        sum = d1 + d2;

        cout << "You rolled: " << d1;
        if (diceCount==2) cout << " + " << d2 << " = " << sum << "\n";
        else              cout << " = " << sum << " " << c(DIM) << "(1-die)" << c(RESET) << "\n";

        // Step 3: Check validity of move
        bool canCover   = !board.findValidCombinations(sum, true ).empty();
        bool canUncover = !computerBoard.findValidCombinations(sum, false).empty();

        if (!canCover && !canUncover) {
            cout << "No legal moves for this roll. Your turn ends.\n";
            return true;
        }

        // Step 4: Display current state
        banner("Current Board State");
        computerBoardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Computer,
            Tournament::getAdvantageSquare());

        boardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Human,
            Tournament::getAdvantageSquare());

        // Step 5: Offer Help
        cout << "Do you want help from the computer? (y/n): ";
        if (readYN_input_human()=='y') {
            const Computer helper(computerBoard, board);
            helper.provideHelp(sum, board, computerBoard);
            cout << "\n";
        }

        // Step 6: Choose Action (Cover vs Uncover)
        char choice = 0;
        while (true) {
            cout << "Cover your squares or uncover the opponent's squares? (c/u): ";
            if (cin >> choice) {
                // ASCII lowercase convert
                if (choice >= 'A' && choice <= 'Z') choice = static_cast<char>(choice - 'A' + 'a');
                if ((choice=='c' && canCover) || (choice=='u' && canUncover)) break;
            }
            cin.clear();
            cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            cout << "That action isn't available with this roll.\n";
        }

        if (choice=='c') coverSquares(sum);
        else             uncoverSquares(sum);

        // Step 7: Display end state
        banner("Board After Your Move");
        computerBoardView.display( Tournament::getAdvantageApplied() &&
                                    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
                                    Tournament::getAdvantageSquare());

        boardView.display( Tournament::getAdvantageApplied() &&
                            Tournament::getAdvantageOwner() == Tournament::Side::Human,
                            Tournament::getAdvantageSquare());
        cout << "\n";

        // If the human uncovered all the computer's squares, end turn so the
        // Round can detect and declare the winner immediately.
        if (computerBoard.allUncovered()) {
            return true;
        }

        if (board.allCovered()) return true;
    }
}

/**
 * @brief Display valid cover options and prompt the human for a selection.
 * @param sum Dice sum used to compute valid cover combinations
 */
void Human::coverSquares(const int sum) const {
    using namespace ui;

    // Step 1: Find options
    std::set<std::set<int>> validCombinations = board.findValidCombinations(sum, true);
    section("Valid cover options");

    if (validCombinations.empty()) {
        std::cout << "  none\n";
        std::cout << "No valid moves to cover squares. Turn ends.\n";
        return;
    }

    printCombosFunc_human(validCombinations);

    // Step 2: Get User Selection
    int choice = 0;
    const int maxIdx = static_cast<int>(validCombinations.size());
    while (true) {
        std::cout << "Enter the number of the combination you want to use (1-" << maxIdx << "): ";
        if (std::cin >> choice && choice >= 1 && choice <= maxIdx) break;
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Invalid choice. Try again.\n";
    }

    // Step 3: Execute Move
    auto it = validCombinations.begin();
    std::advance(it, choice - 1);
    const std::set<int> selected = *it;

    for (int v : selected) board.coverSquare(v);

    std::cout << c(GREEN) << "Covered: " << c(RESET);
    for (int v : selected) std::cout << v << " ";
    std::cout << "\n";
}

/**
 * @brief Display valid uncover options (filtering advantage protections) and prompt the human for a selection.
 * @param sum Dice sum used to compute valid uncover combinations
 */
void Human::uncoverSquares(const int sum) const {
    // Step 1: Find options
    set<set<int>> validCombinations = computerBoard.findValidCombinations(sum, false);

    if (validCombinations.empty()) {
        cout << "No valid moves to uncover squares. Turn ends." << endl;
        return;
    }

    // Step 2: Filter Advantage Square
    if (Tournament::getAdvantageApplied() && Tournament::isComputerAdvantageProtected()) {
        for (auto it = validCombinations.begin(); it != validCombinations.end(); ) {
            if (it->contains(Tournament::getAdvantageSquare())) it = validCombinations.erase(it);
            else ++it;
        }
    }
    if (validCombinations.empty()) {
        std::cout << c(YELLOW) << "No valid uncover options this roll." << c(RESET)
                  << " Advantage square " << Tournament::getAdvantageSquare()
                  << " is protected for one turn.\n";
        return;
    }

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

    // Step 3: Get User Selection
    int choice = 0;
    const int maxIdx = static_cast<int>(validCombinations.size());
    while (true) {
        cout << "Enter the number of the combination you want to use (1-" << maxIdx << "): ";
        if (cin >> choice && choice >= 1 && choice <= maxIdx) break;

        cin.clear();
        cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        cout << "Invalid choice. Try again.\n";
    }

    // Step 4: Execute Move
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

