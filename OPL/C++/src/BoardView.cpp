//
// Created by Daniel Rajakumar on 3/1/25.
//

#include <iostream>
#include <utility>
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"

using namespace std;

/**
 * @brief Constructs a BoardView object.
 * 
 * @param b Reference to the board.
 * @param name Name of the player who owns the board.
 */
BoardView::BoardView(const Board& b, string  name) : board(b), playerName(std::move(name)) {}

/**
 * @brief Displays the board.
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
 * @brief Displays the board with an option to highlight an advantage square.
 * 
 * @param highlightAdvantageSquare Whether to highlight the advantage square.
 * @param advantageSquare The square to highlight if highlighting is enabled.
 */
void BoardView::display(const bool advantageApplied, const int advantageSquare) const {
    std::cout << playerName << ": [ ";

    for (int i = 1; i <= board.getSize(); ++i) {
        const bool covered = board.isSquareCovered(i);

        // value to print
        if (covered) std::cout << "_";
        else         std::cout << i;

        // (optional) mark advantage square; remove this block if you don't want a mark
        if (advantageApplied && i == advantageSquare) std::cout << "*";

        if (i < board.getSize()) std::cout << ", ";
        else                     std::cout << " ]\n";
    }
}
