#include <iostream>
#include <ctime>
#include "Header Files/Tournament.h"
#include "Header Files/Board.h"

using namespace std;

/**
 * The main entry point for the game application.
 * @return Exit code.
 */
int main() {
    srand(static_cast<unsigned int>(time(nullptr)));
    Board human(11);
    Board computer(11);
    Tournament tour(human, computer);
    tour.start();
    return 0;
}
