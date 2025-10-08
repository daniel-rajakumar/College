//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef BOARDVIEW_H
#define BOARDVIEW_H
#include "Board.h"
using namespace std;

/**
 * @class BoardView
 * @brief Represents a view of a board in the game.
 * 
 * The BoardView class provides functionality to display the board
 * and its state to the player.
 */
class BoardView {
private:
    const Board& board; ///< Reference to the board being viewed.
    string playerName; ///< Name of the player who owns the board.

public:
    /**
     * @brief Constructs a BoardView object.
     * 
     * @param b Reference to the board.
     * @param name Name of the player who owns the board.
     */
    BoardView(const Board &b, string name);

    /**
     * @brief Displays the board.
     */
    void display() const;

    /**
     * @brief Displays the board with an option to highlight an advantage square.
     * 
     * @param highlightAdvantageSquare Whether to highlight the advantage square.
     * @param advantageSquare The square to highlight if highlighting is enabled.
     */
    void display(bool highlightAdvantageSquare, int advantageSquare) const;
};

#endif //BOARDVIEW_H
