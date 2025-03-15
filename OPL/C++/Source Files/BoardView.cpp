//
// Created by Daniel Rajakumar on 3/1/25.
//

#include <iostream>
#include <utility>
#include "../Header Files/BoardView.h"
using namespace std;

/**
 * @brief Constructs a BoardView object.
 * 
 * @param b Reference to the board.
 * @param name Name of the player who owns the board.
 */
BoardView::BoardView(const Board& b, const string& name) : board(b), playerName(name) {}

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
void BoardView::display(bool highlightAdvantageSquare, int advantageSquare) const {
    cout << playerName << "'s Board:" << endl;
    for (int i = 1; i <= board.getSize(); ++i) {
        if (board.isSquareCovered(i)) {
            if (highlightAdvantageSquare && i == advantageSquare) {
                cout << "[" << i << "]";
            } else {
                cout << "_";
            }
        } else {
            cout << i;
        }
        cout << " ";
    }
    cout << endl;
}