/**
 * @file BoardView.cpp
 * @brief Rendering helpers for showing a Board in the terminal for a named player.
 */

#include <iostream>
#include <utility>
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"

using namespace std;

/**
 * @brief Constructs a BoardView for the given board and player name.
 * @param b Reference to the board to display
 * @param name Display name for the player
 */
BoardView::BoardView(const Board& b, string  name) : board(b), playerName(std::move(name)) {}

/**
 * @brief Displays the board using a simple textual layout.
 */
void BoardView::display() const {
    cout << playerName << "'s Board:" << endl;
    for (int i = 1; i <= board.getSize(); ++i) {
        if (board.isSquareCovered(i)) {
            cout << "_";
        } else {
            cout << i;
        }
        cout << " ";
    }
    cout << endl;
}

/**
 * @brief Displays the board and optionally highlights an advantage square.
 * @param advantageApplied If true, the advantage square will be annotated
 * @param advantageSquare Index of the advantage square to annotate
 */
void BoardView::display(const bool advantageApplied, const int advantageSquare) const {
    std::cout << playerName << ": [ ";

    for (int i = 1; i <= board.getSize(); ++i) {
        const bool covered = board.isSquareCovered(i);

        if (covered) std::cout << "_";
        else         std::cout << i;

        if (advantageApplied && i == advantageSquare) std::cout << "*";

        if (i < board.getSize()) std::cout << ", ";
        else                     std::cout << " ]\n";
    }
}
