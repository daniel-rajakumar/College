#include <iostream>
#include <ctime>
#include "Header Files/Tournament.h"

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
    Tournament::start(); // Start the tournament
    return 0;
}
