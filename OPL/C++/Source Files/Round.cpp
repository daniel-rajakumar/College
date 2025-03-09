//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"

#include <iostream>
#include <stdlib.h>

#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"

Round::Round(Player& p1, Player& p2, Tournament& tournament)
    : player1(p1), player2(p2), isOver(false), tournament(tournament) {}



// void Round::play() const {
//     bool firstTime = true;
//     Player& currentPlayer = determineFirstPlayer(); // Determine the first player
//
//
//     while (!isOver) {
//         player1.takeTurn();
//         if (isRoundOver() && !firstTime) {
//             declareWinner();
//             break;
//         }
//
//         cout << endl;
//
//         player2.takeTurn();
//         if (isRoundOver() && !firstTime) {
//             declareWinner();
//             break;
//         }
//
//         cout << endl;
//         firstTime = false;
//     }
//
// }

// Determine the first player
Player& Round::determineFirstPlayer() const {
    int player1Roll, player2Roll;

    do {
        // Roll two dice for player1
        player1Roll = (rand() % 6 + 1) + (rand() % 6 + 1);
        cout << "Human rolled: " << player1Roll << endl;

        // Roll two dice for player2
        player2Roll = (rand() % 6 + 1) + (rand() % 6 + 1);
        cout << "Computer rolled: " << player2Roll << endl;

        if (player1Roll > player2Roll) {
            cout << "Human plays first!" << endl;
            return player1;
        } else if (player2Roll > player1Roll) {
            cout << "Computer plays first!" << endl;
            return player2;
        } else {
            cout << "It's a tie! Rolling again..." << endl;
        }
    } while (player1Roll == player2Roll);

    // This line is never reached, but it's required to avoid a compiler warning
    return player1;
}

void Round::play() const {
    cout << "~~~~~~~~~~~~~~~~~~" << endl;
    Player* currentPlayer = &determineFirstPlayer(); // Determine the first player
    cout << "~~~~~~~~~~~~~~~~~~" << endl;
    bool isFirst = true;


    while (!isOver) {

        currentPlayer -> takeTurn();



        // Check if the round is over after the current player's turn
        if (isRoundOver() && !isFirst) {
            declareWinner();
            break;
        }

        // Switch to the other player
        currentPlayer = (currentPlayer == &player1) ? &player2 : &player1;
        isFirst = false;
        cout << "~~~~~~~~~~~~~~~~~~" << endl;

        // Ask the user if they want to save the game
        char saveChoice;
        cout << "Do you want to save the game? (y/n): ";
        cin >> saveChoice;

        if (saveChoice == 'y' || saveChoice == 'Y') {
            string filename;
            cout << "Enter the filename to save: ";
            cin >> filename;
            tournament.saveGame(filename);
        }
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

