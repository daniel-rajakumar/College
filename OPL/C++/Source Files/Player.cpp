//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Player.h"
#include <iostream>

using namespace std;

/**
 * @brief Constructs a Player object.
 * 
 * @param b Reference to the player's board.
 * @param human Flag indicating if the player is human.
 */
Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}

/**
 * @brief Rolls a die or dice and returns the result.
 * 
 * @return The result of the die roll.
 */
int Player::rollDie() const {
    int diceSum = 0;
    char choice, isManual;

    // Determine if the player can choose to roll one die
    if (canThrowOneDie() && isHuman) {
        do {
            cout << "Do you want to roll 1 die or 2 dice? (1/2): ";
            cin >> choice;
        } while (choice != '1' && choice != '2');
    } else {
        choice = '2';
    }

    // Ask if the player wants to enter the die value manually
    do {
        cout << "Do you want to enter the die manually? (y/n): ";
        cin >> isManual;
    } while (isManual != 'y' && isManual != 'n');

    // Handle manual die entry
    if (isManual == 'y') {
        int choiceOne;
        if (choice == '1') {
            do {
                cout << "Enter the value for 1 die (1-6): ";
                cin >> choiceOne;
            } while (choiceOne < 1 || choiceOne > 6);
            diceSum = choiceOne;
        } else {
            int choiceTwo;
            do {
                cout << "Enter the values for 2 dice (each 1-6): ";
                cin >> choiceOne >> choiceTwo;
            } while (choiceOne < 1 || choiceOne > 6 || choiceTwo < 1 || choiceTwo > 6);
            diceSum = choiceOne + choiceTwo;
        }
    } else {
        // Generate random die values
        if (choice == '1') {
            diceSum = rand() % 6 + 1;
            if (!isHuman) {
                cout << "Computer rolls 1 die: " << diceSum << endl;
            }
        } else {
            const int die1 = rand() % 6 + 1;
            const int die2 = rand() % 6 + 1;
            diceSum = die1 + die2;
            if (!isHuman) {
                cout << "Computer rolls 2 dice: " << die1 << " and " << die2 << endl;
            }
        }
    }

    return diceSum;
}

/**
 * @brief Gets the player's board.
 * 
 * @return Reference to the player's board.
 */
const Board& Player::getBoard() const {
    return board;
}

/**
 * @brief Checks if the player can throw one die.
 * 
 * @return True if the player can throw one die, false otherwise.
 */
bool Player::canThrowOneDie() const {
    for (int i = 7; i <= board.getSize(); ++i) {
        if (!board.isSquareCovered(i)) {
            return false;
        }
    }
    return true;
}

/**
 * @brief Gets whether the player is human.
 * 
 * @return True if the player is human, false otherwise.
 */
bool Player::getIsHuman() const {
    return isHuman;
}