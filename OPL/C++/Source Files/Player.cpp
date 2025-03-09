//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Player.h"

#include <iostream>

Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}


int Player::rollDie() const {
    int diceSum = 0;

    // Check if all squares from 7 to n are covered
    bool allHighSquaresCovered = true;
    for (int i = 7; i <= board.getSize(); ++i) {
        if (!board.isSquareCovered(i)) {
            allHighSquaresCovered = false;
            break;
        }
    }

    // Roll one die if all high squares are covered, otherwise roll two dice
    if (allHighSquaresCovered) {
        cout << "rolling one die" << endl;
        diceSum = rand() % 6 + 1; // Roll one die (1-6)
    } else {
        cout << "rolling two die" << endl;
        diceSum = (rand() % 6 + 1) + (rand() % 6 + 1); // Roll two dice (2-12)
    }

    return diceSum;
}

// Get the player's board
Board& Player::getBoard() const {
    return board;
}
