//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARDVIEW_H
#define BOARDVIEW_H
#include "Board.h"
using namespace std;

class BoardView {
private:
    const Board& board;
    string playerName;

public:
    BoardView(const Board &b, const string &name);

    void display() const;

    void display(bool highlightAdvantageSquare, int advantageSquare) const;
};



#endif //BOARDVIEW_H
