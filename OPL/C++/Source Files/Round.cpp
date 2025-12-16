/**
 * @file Round.cpp
 * @brief Coordinates a single round of play between two players.
 */

#include "../Header Files/Round.h"
#include <iostream>
#include <stdlib.h>
#include <limits>
#include <cctype>
#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

/**
 * @brief Construct a Round controller.
 * @param p1 Reference to player 1
 * @param p2 Reference to player 2
 * @param tournament Reference to tournament state
 * @param isANewGame True when this round is part of a fresh game setup
 */
Round::Round(Player& p1, Player& p2, Tournament& tournament, const bool isANewGame)
    : player1(p1), player2(p2), isOver(false), tournament(tournament), isANewGame(isANewGame) {}

/**
 * @brief Decide who goes first by rolling two dice until a non-tie occurs.
 * @return Reference to the Player who won the toss (goes first)
 */
Player& Round::determineFirstPlayer() const {
    int player1Roll, player2Roll;

    do {
        player1Roll = (rand() % 6 + 1) + (rand() % 6 + 1);
        cout << "Human rolled: " << player1Roll << endl;

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
 * @brief Main loop to execute the round, handling setup, turns, and save/load prompts.
 */
void Round::play() const {
    Player* currentPlayer;
    if (tournament.getIsHumanTurn())
        currentPlayer = &player1;
    else
        currentPlayer = &player2;

    if (isANewGame) {
        cout << "~~~~~~~~[Who Goes First?]~~~~~~~~~\n";

        // Offer the user a choice: roll dice or explicitly pick human/computer
        cout << "Options:\n";
        cout << "  r) Roll dice to decide\n";
        cout << "  h) Human goes first\n";
        cout << "  c) Computer goes first\n";
        cout << "Enter choice (r/h/c): ";

        char choice = '\0';
        char lc = '\0';
        while (true) {
            if (!(cin >> choice)) {
                cin.clear();
                cin.ignore(numeric_limits<streamsize>::max(), '\n');
                cout << "Invalid input. Enter r, h or c: ";
                continue;
            }
            lc = static_cast<char>(std::tolower(static_cast<unsigned char>(choice)));
            if (lc == 'r' || lc == 'h' || lc == 'c') {
                break;
            }
            cin.clear();
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            cout << "Invalid input. Enter r, h or c: ";
        }

        Player* fp = nullptr;
        if (lc == 'r') {
            // Roll to decide (existing behavior)
            Player& winner = determineFirstPlayer();
            fp = &winner;
        } else if (lc == 'h') {
            cout << "Human will go first!" << endl;
            fp = &player1;
        } else { // lc == 'c'
            cout << "Computer will go first!" << endl;
            fp = &player2;
        }

        currentPlayer = fp;
        tournament.setFirstPlayerIsHuman(currentPlayer->getIsHuman());
        tournament.setIsHumanTurn(currentPlayer->getIsHuman());
        cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";
    }

    section("Starting Board State");
    BoardView humanView(player1.getBoard(), "Human");
    BoardView compView (player2.getBoard(), "Computer");

    compView.display (
    Tournament::getAdvantageApplied() &&
    Tournament::getAdvantageOwner() == Tournament::Side::Computer,
    Tournament::getAdvantageSquare());

    humanView.display(
        Tournament::getAdvantageApplied() &&
        Tournament::getAdvantageOwner() == Tournament::Side::Human,
        Tournament::getAdvantageSquare());

    std::cout << "\n";

    tournament.setIsHumanTurn(currentPlayer->getIsHuman());

    int movesSinceLastCheck = 0;

    while (true) {
        // Step 1: Execute Turn
        currentPlayer->takeTurn();

        // Step 2: Handle Advantage Protection Expiry
        // Protection should expire after the OPPONENT of the advantage owner has completed their turn.
        // That means we clear the protection when the player who just played is the opponent
        // (i.e. currentPlayer is NOT the advantage owner).
        if (Tournament::getAdvantageApplied()) {
            if (Tournament::getAdvantageOwner() == Tournament::Side::Human && !currentPlayer->getIsHuman()) {
                // Human had advantage; opponent (computer) just played -> clear human protection
                Tournament::clearAdvantageProtectionForHuman();
            } else if (Tournament::getAdvantageOwner() == Tournament::Side::Computer && currentPlayer->getIsHuman()) {
                // Computer had advantage; opponent (human) just played -> clear computer protection
                Tournament::clearAdvantageProtectionForComputer();
            }
        }

        movesSinceLastCheck++;

        // Step 3: Check for Win Condition (Optimized check frequency)
        if (movesSinceLastCheck % 2 == 0) {
            if (isRoundOver()) {
                bool winnerIsHuman = false;
                if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
                    winnerIsHuman = true;
                } else if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
                    winnerIsHuman = false;
                }
                const Player* winnerPtr = winnerIsHuman ? static_cast<const Player*>(&player1)
                                                        : static_cast<const Player*>(&player2);
                bool winnerWasFirst = (tournament.getFirstPlayerIsHuman() == winnerIsHuman);
                declareWinner(winnerPtr, winnerWasFirst);
                break;
            }
        }

        // Step 4: Switch Player
        currentPlayer = (currentPlayer == &player1) ? &player2 : &player1;
        tournament.setIsHumanTurn(currentPlayer->getIsHuman());

        // Step 5: Final Win Check (run BEFORE prompting to save)
        if (((!isANewGame) || (movesSinceLastCheck % 2 == 0)) && isRoundOver()) {
            bool winnerIsHuman = false;
            if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
                winnerIsHuman = true;
            } else if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
                winnerIsHuman = false;
            }
            bool winnerWasFirst = (tournament.getFirstPlayerIsHuman() == winnerIsHuman);
            const Player* winnerPtr = winnerIsHuman ? static_cast<const Player*>(&player1)
                                                    : static_cast<const Player*>(&player2);
            declareWinner(winnerPtr, winnerWasFirst);
            return;
        }

        // Step 5: Save Prompt
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

/**
 * @brief Checks whether any of the win conditions for the round are met.
 * @return true if the round is over
 */
bool Round::isRoundOver() const {
    return player1.getBoard().allCovered() || player2.getBoard().allCovered() ||
           player1.getBoard().allUncovered() || player2.getBoard().allUncovered();
}

/**
 * @brief Determine which side won and update the tournament accordingly; also display messages.
 * @param currentPlayer Pointer to the player that most recently moved
 * @param winnerWasFirstPlayer True if the winner had been the first player this round
 */
void Round::declareWinner(const Player* currentPlayer, const bool winnerWasFirstPlayer) const {

    cout << "\n\n~~~~~~~~~~~~[Round Over]~~~~~~~~~~~~" << endl;
    if (player1.getBoard().allCovered()) {
        // Human wins by covering all own squares
        int score = player2.getBoard().getUncoveredSum();
        cout << "Human wins by covering all their squares! (+" << score << " points)" << endl;
        tournament.updateScores(true, false, false, false,
                                player1.getBoard().getCoveredSum(),
                                score);
        tournament.applyHandicap(winnerWasFirstPlayer, /*winnerIsHuman=*/true, score);

    } else if (player2.getBoard().allCovered()) {
        // Computer wins by covering all own squares
        int score = player1.getBoard().getUncoveredSum();
        cout << "Computer wins by covering all their squares! (+" << score << " points)" << endl;
        tournament.updateScores(false, false, true, false,
                                score,
                                player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, /*winnerIsHuman=*/false, score);

    } else if (player2.getBoard().allUncovered()) {
        // Human wins by uncovering all computer squares
        int score = player1.getBoard().getCoveredSum();
        cout << "Human wins by uncovering all the computer's squares! (+" << score << " points)" << endl;
        tournament.updateScores(false, true, false, false,
                                score,
                                0);
        tournament.applyHandicap(winnerWasFirstPlayer,
                                 /*winnerIsHuman=*/true,
                                 score);

    } else if (player1.getBoard().allUncovered()) {
        // Computer wins by uncovering all human squares
        int score = player2.getBoard().getCoveredSum();
        cout << "Computer wins by uncovering all the human's squares! (+" << score << " points)" << endl;
        tournament.updateScores(false, false, false, true,
                                0,
                                score);
        tournament.applyHandicap(winnerWasFirstPlayer,
                                 /*winnerIsHuman=*/false,
                                 score);
    }
}