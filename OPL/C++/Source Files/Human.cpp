//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Human.h"

#include <iostream>

Human::Human(Board& b) : Player(b, true), boardView(b, "Human") {}

void Human::takeTurn() {

    const int diceSum = rand() % 6 + 1; // Random number between 1 and 6
    cout << "You rolled: " << diceSum << endl;

    // Choose to cover or uncover squares
    cout << "Do you want to cover your squares or uncover the opponent's squares? (c/u): ";
    char choice;
    cin >> choice;

   if (choice == 'c') {
        // Implement logic to cover squares
    } else if (choice == 'u') {
        // Implement logic to uncover squares
    }

    boardView.display(); // Use BoardView to display the board
}
