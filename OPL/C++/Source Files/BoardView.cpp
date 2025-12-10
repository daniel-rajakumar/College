#include <iostream>
#include <utility>
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"

using namespace std;

BoardView::BoardView(const Board& b, string  name) : board(b), playerName(std::move(name)) {}

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
