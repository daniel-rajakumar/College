#ifndef BOARDVIEW_H
#define BOARDVIEW_H
#include "Board.h"
#include <string>

class BoardView {
private:
    const Board& board;
    std::string playerName;

public:
    BoardView(const Board &b, std::string name);
    void display() const;
    void display(bool highlightAdvantageSquare, int advantageSquare) const;
};

#endif
