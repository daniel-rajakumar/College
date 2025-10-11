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
    using namespace ui;
    using std::cout; using std::cin;

    // small input helpers
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

    // ======= FULL HUMAN TURN (loop rolls until stuck) =======
    while (true) {
        section("Human Turn");

        // --- per-roll: manual or random, and 1/2 dice choice if allowed
        cout << "Do you want to enter the die manually? (y/n): ";
        const char manual = readYN();

        const bool oneDieAllowed = board.canThrowOneDie();
        int diceCount = 2;

        if (oneDieAllowed) {
            cout << "You may use 1 die (7.." << board.getSize() << " are covered). Use 1 die? (y/n): ";
            diceCount = (readYN()=='y') ? 1 : 2;
        } else {
            cout << "1-die is NOT allowed (must use 2 dice).\n";
            diceCount = 2;
        }

        int d1 = 0, d2 = 0, sum = 0;
        if (manual == 'y') {
            d1 = readDie("Enter die 1 (1-6): ");
            d2 = (diceCount==2) ? readDie("Enter die 2 (1-6): ") : 0;
        } else {
            d1 = (std::rand() % 6) + 1;
            d2 = (diceCount==2) ? ((std::rand() % 6) + 1) : 0;
        }
        sum = d1 + d2;

        cout << "You rolled: " << d1;
        if (diceCount==2) cout << " + " << d2 << " = " << sum << "\n";
        else              cout << " = " << sum << " " << c(DIM) << "(1-die)" << c(RESET) << "\n";

        // --- check legal moves for this roll
        bool canCover   = !board.findValidCombinations(sum, true ).empty();
        bool canUncover = !computerBoard.findValidCombinations(sum, false).empty();

        if (!canCover && !canUncover) {
            cout << "No legal moves for this roll. Your turn ends.\n";
            return true; // end of the entire human turn
        }

        // --- show boards (Computer on top)
        banner("Current Board State");
        computerBoardView.display(
    Tournament::getAdvantageApplied() &&
    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
    Tournament::getAdvantageSquare());

        boardView.display(
            Tournament::getAdvantageApplied() &&
            Tournament::getAdvantageOwner() == Tournament::Side::Human,
            Tournament::getAdvantageSquare());


        // --- optional help
        cout << "Do you want help from the computer? (y/n): ";
        if (readYN()=='y') {
            const Computer helper(computerBoard, board);
            helper.provideHelp(sum, board, computerBoard);
            cout << "\n";
        }

        // --- choose cover/uncover; re-prompt if choice isn’t available for this roll
        char choice = 0;
        while (true) {
            cout << "Cover your squares or uncover the opponent's squares? (c/u): ";
            if (cin >> choice) {
                choice = std::tolower(choice);
                if ((choice=='c' && canCover) || (choice=='u' && canUncover)) break;
            }
            cin.clear();
            cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            cout << "That action isn't available with this roll.\n";
        }

        // --- execute one move
        if (choice=='c') coverSquares(sum);
        else             uncoverSquares(sum);

        // --- show boards after this move, then loop to roll again
        banner("Board After Your Move");
        computerBoardView.display( Tournament::getAdvantageApplied() &&
                                    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
                                    Tournament::getAdvantageSquare());

        boardView.display( Tournament::getAdvantageApplied() &&
                            Tournament::getAdvantageOwner() == Tournament::Side::Human,
                            Tournament::getAdvantageSquare());
        cout << "\n";

        // Early-out if you just finished the board (Round will detect anyway)
        if (board.allCovered()) return true;
    }
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
