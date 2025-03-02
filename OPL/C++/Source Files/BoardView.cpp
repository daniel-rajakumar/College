//
// Created by Daniel Rajakumar on 3/1/25.
//

#include <iostream>
#include <utility>
using namespace std;

#include "../Header Files/BoardView.h"

BoardView::BoardView(const Board& b, const string& name) : board(b), playerName(name) {}

void BoardView::display() const {
    // cout << playerName << "'s Board:" << endl;
    for (int i = 1; i <= board.getSize(); ++i) {
        if (board.isSquareCovered(i)) {
            cout << "_"; // Covered square
        } else {
            cout << i; // Uncovered square
        }
    }
    cout << endl;
}
