//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Computer.h"

Computer::Computer(Board& b) : Player(b, false), boardView(b, "Computer") {}

void Computer::takeTurn() {
}
