//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Player.h"

#include <iostream>

Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}

// Roll dice
int Player::rollDie() const {
    int diceSum = 0;

    if (canThrowOneDie()) {
        cout << "YOOOOOOOOOOOOOOOOOOO" << endl;
        if (isHuman) {
            // Ask the human player if they want to roll 1 die or 2 dice
            char choice;
            cout << "Do you want to roll 1 die or 2 dice? (1/2): ";
            cin >> choice;

            if (choice == '1') {
                diceSum = rand() % 6 + 1; // Roll one die (1-6)
            } else {
                diceSum = (rand() % 6 + 1) + (rand() % 6 + 1); // Roll two dice (2-12)
            }
        } else {
            // Computer chooses to roll 1 die or 2 dice randomly
            if (rand() % 2 == 0) {
                diceSum = rand() % 6 + 1; // Roll one die (1-6)
            } else {
                diceSum = (rand() % 6 + 1) + (rand() % 6 + 1); // Roll two dice (2-12)
            }
        }
    } else {
        // Must roll two dice if any square from 7 to n is uncovered
        diceSum = (rand() % 6 + 1) + (rand() % 6 + 1); // Roll two dice (2-12)
    }

    return diceSum;
}

// Get the player's board
Board& Player::getBoard() const {
    return board;
}

// Check if all squares from 7 to n are covered
bool Player::canThrowOneDie() const {
    for (int i = 7; i <= board.getSize(); ++i) {
        if (!board.isSquareCovered(i)) {
            return false; // At least one square from 7 to n is uncovered
        }
    }
    return true; // All squares from 7 to n are covered
}