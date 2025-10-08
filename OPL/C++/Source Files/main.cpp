#include <iostream>
#include <ctime>
#include "../Header Files/Tournament.h"
#include "../Header Files/Board.h"

using namespace std;

/**
 * @brief The main function to start the tournament.
 * 
 * This function initializes the random number generator and starts the tournament.
 * 
 * @return 0 on successful execution.
 */
int main() {
    srand(static_cast<unsigned int>(time(nullptr))); // Seed the random number generator
    Board human(11);        // initial size will be replaced by prompt
    Board computer(11);
    Tournament tour(human, computer);
    tour.start();           // call the *member* start()
    return 0;
}
