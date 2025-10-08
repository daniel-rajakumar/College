//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"
#include <iostream>
#include <stdlib.h>
#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

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
// Round.cpp
void Round::play() const {
    // decide whose turn it is
    Player* currentPlayer;
    if (tournament.getIsHumanTurn())
        currentPlayer = &player2;    // if "human to play next", computer must have been starter last time
    else
        currentPlayer = &player1;

    // remember who actually started (for handicap logic on NEW rounds)
    const Player* firstPlayer = nullptr;
    if (isANewGame) {
        cout << "~~~~~~~~[Who Goes First?]~~~~~~~~~\n";
        Player& fp = determineFirstPlayer();        // roll once
        firstPlayer = &fp;
        currentPlayer = &fp;
        cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
    }

    section("Starting Board State");

    BoardView humanView(player1.getBoard(), "Human");
    BoardView compView (player2.getBoard(), "Computer");

    humanView.display(Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    compView.display (Tournament::getAdvantageApplied(), Tournament::getAdvantageSquare());
    std::cout << "\n";

    while (true) {
        // one player takes a turn
        bool endedTurn = currentPlayer->takeTurn();  // true = no move available (forced pass), false = normal turn
        (void)endedTurn; // we don't use this to end the round

        // NEW: if the advantaged side just played, clear their one-turn protection
        if (Tournament::getAdvantageApplied()) {
            if (Tournament::getAdvantageOwner() == Tournament::Side::Human && currentPlayer->getIsHuman()) {
                Tournament::clearAdvantageProtectionForHuman();
            } else if (Tournament::getAdvantageOwner() == Tournament::Side::Computer && !currentPlayer->getIsHuman()) {
                Tournament::clearAdvantageProtectionForComputer();
            }
        }

        // check only the TRUE round end condition
        if (player1.getBoard().allCovered() || player2.getBoard().allCovered()) {
            bool winnerWasFirst = (firstPlayer != nullptr) && (currentPlayer == firstPlayer);
            declareWinner(currentPlayer, winnerWasFirst);
            break;
        }

        // pass play to the other side regardless of whether they moved or were forced to pass
        currentPlayer = (currentPlayer == &player1) ? &player2 : &player1;

        // optional: only offer save when it's the human's turn
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
    return player1.getBoard().allCovered() || player2.getBoard().allCovered();
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
                                player1.getBoard().getCoveredSum(),
                                player2.getBoard().getUncoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player2.getBoard().getUncoveredSum());
    } else if (player2.getBoard().allCovered()) {
        cout << "Computer wins by covering all their squares!" << endl;
        tournament.updateScores(false, false, true, false,
                                player1.getBoard().getUncoveredSum(),
                                player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, player1.getBoard().getUncoveredSum());
    }
}


