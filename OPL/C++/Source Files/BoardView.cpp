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
            cout << "_";
        } else {
            cout << i;
        }
    }
    cout << endl;
}

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