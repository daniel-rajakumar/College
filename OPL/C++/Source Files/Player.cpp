//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Player.h"

#include <iostream>

Player::Player(Board& b, const bool human) : board(b), isHuman(human) {}


int Player::rollDie() const {
    int diceSum = 0;
    char choice, isManual;
    int choiceOne, choiceTwo;

    if (canThrowOneDie() && isHuman) {
        do {
            cout << "Do you want to roll 1 die or 2 dice? (1/2): ";
            cin >> choice;
        } while (choice != '1' && choice != '2');
    } else {
        choice = '2';
    }

    if (isHuman) {
        do {
            cout << "Do you want to enter the die manually? (y/n): ";
            cin >> isManual;
        } while (isManual != 'y' && isManual != 'n');
    } else {
        do {
            cout << "Do you want to enter the die manually for the computer? (y/n): ";
            cin >> isManual;
        } while (isManual != 'y' && isManual != 'n');
    }

    if (isManual == 'y') {
        if (choice == '1') {
            do {
                if (isHuman) {
                    cout << "Enter the value for 1 die (1-6): ";
                } else {
                    cout << "Enter the value for 1 die for the computer (1-6): ";
                }
                cin >> choiceOne;
            } while (choiceOne < 1 || choiceOne > 6);
            diceSum = choiceOne;
        } else {
            do {
                if (isHuman) {
                    cout << "Enter the values for 2 dice (each 1-6): ";
                } else {
                    cout << "Enter the values for 2 dice for the computer (each 1-6): ";
                }
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
            diceSum = (rand() % 6 + 1) + (rand() % 6 + 1);
            if (!isHuman) {
                cout << "Computer rolls 2 dice: " << (diceSum - (rand() % 6 + 1)) << " and " << (rand() % 6 + 1) << endl;
            }
        }
    }

    return diceSum;
}

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