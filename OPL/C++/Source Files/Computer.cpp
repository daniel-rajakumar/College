//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"

#include <iostream>

Computer::Computer(Board& b) : Player(b, false), boardView(b, "Computer") {}

void Computer::takeTurn() {
    // cout << "Computer's turn!" << endl;
    boardView.display(); // Use BoardView to display the board

}
