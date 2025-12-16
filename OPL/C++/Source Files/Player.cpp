/**
 * @file Player.cpp
 * @brief Core Player utilities: constructor, die rolling, and accessors.
 */

#include "../Header Files/Player.h"
#include <iostream>

using namespace std;

/**
 * @brief Construct a Player with an associated board and human flag.
 * @param b Reference to the player's board
 * @param human true when the player is human
 */
Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}

/**
 * @brief Roll a die (or two) with optional manual entry for testing.
 *        When the player is human and the one-die rule applies, the user
 *        may choose to roll 1 or 2 dice.
 * @return Sum of the rolled die/dice
 */
int Player::rollDie() const {
    int diceSum = 0;
    char choice, isManual;

    if (canThrowOneDie() && isHuman) {
        do {
            cout << "Do you want to roll 1 die or 2 dice? (1/2): ";
            cin >> choice;
        } while (choice != '1' && choice != '2');
    } else {
        choice = '2';
    }

    do {
        cout << "Do you want to enter the die manually? (y/n): ";
        cin >> isManual;
    } while (isManual != 'y' && isManual != 'n');

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
 * @brief Get a const reference to the player's board.
 * @return const Board&
 */
const Board& Player::getBoard() const {
    return board;
}

/**
 * @brief Returns whether the one-die rule is currently applicable.
 * @return true when the one-die rule applies
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
 * @brief Returns whether this Player is a human.
 * @return true if the player is human
 */
bool Player::getIsHuman() const {
    return isHuman;
}