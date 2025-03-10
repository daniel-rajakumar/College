//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Player.h"

#include <iostream>

Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}


// Roll dice
int Player::rollDie() const {
    int diceSum = 0;
    char choice, isManual;
    int choiceOne, choiceTwo;

    if (canThrowOneDie() && isHuman) {
        // Ask the human player if they want to roll 1 die or 2 dice
        do {
            std::cout << "Do you want to roll 1 die or 2 dice? (1/2): ";
            std::cin >> choice;
        } while (choice != '1' && choice != '2');
    } else {
        // Computer or must roll two dice
        choice = '2';
    }

    // Ask if the player wants to enter the die manually
    do {
        std::cout << "Do you want to enter the die manually? (y/n): ";
        std::cin >> isManual;
    } while (isManual != 'y' && isManual != 'n');

    if (isManual == 'y') {
        if (choice == '1') {
            // Validate input for 1 die (must be between 1 and 6)
            do {
                std::cout << "Enter the value for 1 die (1-6): ";
                std::cin >> choiceOne;
            } while (choiceOne < 1 || choiceOne > 6);
            diceSum = choiceOne;
        } else {
            // Validate input for 2 dice (each die must be between 1 and 6)
            do {
                std::cout << "Enter the values for 2 dice (each 1-6): ";
                std::cin >> choiceOne >> choiceTwo;
            } while (choiceOne < 1 || choiceOne > 6 || choiceTwo < 1 || choiceTwo > 6);
            diceSum = choiceOne + choiceTwo;
        }
    } else {
        if (choice == '1') {
            diceSum = rand() % 6 + 1; // Roll one die (1-6)
        } else {
            diceSum = (rand() % 6 + 1) + (rand() % 6 + 1); // Roll two dice (2-12)
        }
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
            return false;
        }
    }
    return true;
}


bool Player::getIsHuman() const {
    return isHuman;
}