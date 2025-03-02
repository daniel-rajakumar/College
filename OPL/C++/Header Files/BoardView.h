//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARDVIEW_H
#define BOARDVIEW_H
#include "Board.h"
using namespace std;

class BoardView {
private:
    const Board& board; // Reference to the Board object
    string playerName;  // Name of the player (Human or Computer)

public:
    BoardView(const Board &b, const string &name);

    void display() const;
};



#endif //BOARDVIEW_H
