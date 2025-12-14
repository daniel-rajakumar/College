#include "../Header Files/Round.h"
#include <iostream>
#include <stdlib.h>
#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

// *********************************************************************
// Function Name: Round
// Purpose: Constructor for the Round class.
// Parameters:
//   p1 - Reference to the first player (usually Human).
//   p2 - Reference to the second player (usually Computer).
//   tournament - Reference to the main tournament object.
//   isANewGame - Flag indicating if this is the start of a new game/match.
// *********************************************************************
Round::Round(Player& p1, Player& p2, Tournament& tournament, const bool isANewGame)
    : player1(p1), player2(p2), isOver(false), tournament(tournament), isANewGame(isANewGame) {}

// *********************************************************************
// Function Name: determineFirstPlayer
// Purpose: Decides who goes first by rolling dice until there is a winner.
// Returns: Reference to the Player who won the toss.
// *********************************************************************
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

// *********************************************************************
// Function Name: play
// Purpose: Main game loop for the round. Handles turns, saving, and checking for win conditions.
// *********************************************************************
void Round::play() const {
    Player* currentPlayer;
    if (tournament.getIsHumanTurn())
        currentPlayer = &player1;
    else
        currentPlayer = &player2;

    if (isANewGame) {
        cout << "~~~~~~~~[Who Goes First?]~~~~~~~~~\n";
        Player& fp = determineFirstPlayer();        // roll once
        currentPlayer = &fp;
        tournament.setFirstPlayerIsHuman(fp.getIsHuman());
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

        // Immediate win detection: if the player who just moved caused a win
        // (they covered all their own squares OR they uncovered all the opponent's squares),
        // declare the winner immediately. This ensures an uncovering win is handled
        // the instant it happens.
        // if (isRoundOver()) {
        //     // Determine who the winner is (same logic as declareWinner)
        //     bool winnerIsHuman = false;
        //     if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
        //         winnerIsHuman = true;
        //     } else if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
        //         winnerIsHuman = false;
        //     }
        //
        //     // If the winner matches the player who just moved, declare immediately.
        //     if (winnerIsHuman == currentPlayer->getIsHuman()) {
        //         const Player* winnerPtr = winnerIsHuman ? static_cast<const Player*>(&player1)
        //                                                 : static_cast<const Player*>(&player2);
        //         bool winnerWasFirst = (tournament.getFirstPlayerIsHuman() == winnerIsHuman);
        //         declareWinner(winnerPtr, winnerWasFirst);
        //         return;
        //     }
        //     // Otherwise, fall through; periodic checks will handle it later.
        // }

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
        // If this is a freshly started game (isANewGame == true), avoid declaring a winner
        // until both players have taken at least one turn (i.e., only allow this final
        // check when movesSinceLastCheck is even). For loaded/serialized games allow the
        // check immediately. Doing this now ensures we don't prompt the user to save
        // after the round is already over.
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

// *********************************************************************
// Function Name: isRoundOver
// Purpose: Checks if any win condition has been met for the round.
// Returns: true if the round is over.
// *********************************************************************
bool Round::isRoundOver() const {
    return player1.getBoard().allCovered() || player2.getBoard().allCovered() ||
           player1.getBoard().allUncovered() || player2.getBoard().allUncovered();
}

// *********************************************************************
// Function Name: declareWinner
// Purpose: Announces the winner, calculates score, and updates tournament state.
// Parameters:
//   currentPlayer - Pointer to the winning player.
//   winnerWasFirstPlayer - Boolean indicating if the winner went first (for handicap).
// *********************************************************************
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