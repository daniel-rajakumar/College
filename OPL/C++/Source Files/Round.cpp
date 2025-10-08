//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"
#include <iostream>
#include <stdlib.h>
#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"

using namespace std;

/**
 * @brief Constructs a Round object.
 * 
 * @param p1 Reference to the first player.
 * @param p2 Reference to the second player.
 * @param tournament Reference to the tournament.
 * @param isANewGame Flag indicating if it is a new game.
 */
Round::Round(Player& p1, Player& p2, Tournament& tournament, const bool isANewGame)
    : player1(p1), player2(p2), isOver(false), tournament(tournament), isANewGame(isANewGame) {}

/**
 * @brief Determines the first player for the round.
 * 
 * @return Reference to the first player.
 */
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
        }
        if (player2Roll > player1Roll) {
            cout << "Computer plays first!" << endl;
            return player2;
        }
        cout << "It's a tie! Rolling again..." << endl;
    } while (player1Roll == player2Roll);

    return player1;
}

/**
 * @brief Plays the round.
 */
void Round::play() const {
    Player* currentPlayer;

    if (tournament.getIsHumanTurn())
        currentPlayer = &player2;
    else
        currentPlayer = &player1;

    // Track who actually started (for NEW games)
    const Player* firstPlayer = nullptr;

    if (isANewGame) {
        cout << "~~~~~~~~[Who Goes First?]~~~~~~~~~" << endl;
        Player& fp = determineFirstPlayer();
        firstPlayer = &fp;
        currentPlayer = &fp;
        cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;
    }

    bool isFirst = true;
    while (!isOver) {
        const bool turnEnds = currentPlayer->takeTurn();

        // Check if the round is over after the current player's turn
        if (isRoundOver() && isFirst) {
            const bool winnerWasFirst = (firstPlayer != nullptr) && (currentPlayer == firstPlayer);
            declareWinner(currentPlayer, winnerWasFirst);
            break;
        }

        // Switch to the other player
        if (turnEnds) {
            currentPlayer = (currentPlayer == &player1) ? &player2 : &player1;
            isFirst = false;
        }

        // Prompt to save the game if it's the human player's turn
        if (currentPlayer->getIsHuman()) {
            char saveChoice;
            cout << "Do you want to save the game? (y/n): ";
            cin >> saveChoice;

            if (saveChoice == 'y' || saveChoice == 'Y') {
                string filename;
                cout << "Enter the filename to save: ";
                cin >> filename;
                tournament.saveGame(filename);
                exit(0);
            }
        }
    }
}

/**
 * @brief Checks if the round is over.
 * 
 * @return True if the round is over, false otherwise.
 */
bool Round::isRoundOver() const {
    if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
        return true;
    }

    if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
        return true;
    }

    return false;
}

/**
 * @brief Declares the winner of the round.
 * 
 * @param currentPlayer Pointer to the current player.
 */
void Round::declareWinner(const Player* currentPlayer, const bool winnerWasFirstPlayer) const {
    if (player1.getBoard().allCovered()) {
        cout << "Human wins by covering all their squares!" << endl;
        tournament.updateScores(true, false, false, false,
                               player1.getBoard().getCoveredSum(), player2.getBoard().getUncoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player2.getBoard().getUncoveredSum());
    } else if (player2.getBoard().allUncovered()) {
        cout << "Human wins by uncovering all the computer's squares!" << endl;
        tournament.updateScores(false, true, false, false,
                               player1.getBoard().getCoveredSum(), player2.getBoard().getUncoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player1.getBoard().getCoveredSum());
    } else if (player2.getBoard().allCovered()) {
        cout << "Computer wins by covering all their squares!" << endl;
        tournament.updateScores(false, false, true, false,
                               player1.getBoard().getUncoveredSum(), player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player1.getBoard().getUncoveredSum());
    } else if (player1.getBoard().allUncovered()) {
        cout << "Computer wins by uncovering all the human's squares!" << endl;
        tournament.updateScores(false, false, false, true,
                               player1.getBoard().getUncoveredSum(), player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player2.getBoard().getCoveredSum());
    }
}

