/**
 * @file BoardView.h
 * @brief Provides a lightweight view/renderer for a Board associated with a player.
 */

#ifndef BOARDVIEW_H
#define BOARDVIEW_H
#include "Board.h"
#include <string>

/**
 * @class BoardView
 * @brief Responsible for printing a board to the terminal for a named player.
 */
class BoardView {
private:
    const Board& board; /**< Reference to the underlying board to display */
    std::string playerName; /**< Display name for the player */

public:
    /**
     * @brief Constructs a BoardView for the provided board and player name.
     * @param b Reference to the board to display
     * @param name Name of the player shown with the board
     */
    BoardView(const Board &b, std::string name);

    /**
     * @brief Displays the board using default formatting.
     */
    void display() const;

    /**
     * @brief Displays the board and highlights an advantage square when requested.
     * @param highlightAdvantageSquare Whether to highlight the advantage square
     * @param advantageSquare Index of the advantage square to highlight
     */
    void display(bool highlightAdvantageSquare, int advantageSquare) const;
};

#endif
