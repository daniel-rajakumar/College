//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"

#include <iostream>

#include "../Header Files/Player.h"

Round::Round(Player& p1, Player& p2) : player1(p1), player2(p2), isOver(false) {}

void Round::play() const {
    while (!isOver) {
        player1.takeTurn();
        if (isRoundOver()) {
            declareWinner();
            break;
        }

        cout << endl;

        player2.takeTurn();
        if (isRoundOver()) {
            declareWinner();
            break;
        }

        cout << endl;
    }
}

// Check if the round is over
bool Round::isRoundOver() const {
    // Check if player1 has covered all their squares or uncovered all of player2's squares
    if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
        return true;
    }

    // Check if player2 has covered all their squares or uncovered all of player1's squares
    if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
        return true;
    }

    return false;
}

// Declare the winner of the round
void Round::declareWinner() const {
    if (player1.getBoard().allCovered()) {
        cout << "Human wins by covering all their squares!" << endl;
    } else if (player2.getBoard().allUncovered()) {
        cout << "Human wins by uncovering all the computer's squares!" << endl;
    } else if (player2.getBoard().allCovered()) {
        cout << "Computer wins by covering all their squares!" << endl;
    } else if (player1.getBoard().allUncovered()) {
        cout << "Computer wins by uncovering all the human's squares!" << endl;
    }
}
