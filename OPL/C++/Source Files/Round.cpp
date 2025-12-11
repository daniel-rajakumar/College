#include "../Header Files/Round.h"
#include <iostream>
#include <stdlib.h>
#include "../Header Files/Player.h"
#include "../Header Files/Tournament.h"
#include "../Header Files/BoardView.h"
#include "../Header Files/TextUI.h"


using namespace std;
using namespace ui;

Round::Round(Player& p1, Player& p2, Tournament& tournament, const bool isANewGame)
    : player1(p1), player2(p2), isOver(false), tournament(tournament), isANewGame(isANewGame) {}

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

void Round::play() const {
    Player* currentPlayer;
    if (tournament.getIsHumanTurn())
        currentPlayer = &player1;
    else
        currentPlayer = &player2;

    const Player* firstPlayer = nullptr;
    if (isANewGame) {
        cout << "~~~~~~~~[Who Goes First?]~~~~~~~~~\n";
        Player& fp = determineFirstPlayer();        // roll once
        firstPlayer = &fp;
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

    // if (isRoundOver()) {
    //     bool winnerIsHuman = false;
    //     if (player1.getBoard().allCovered() || player2.getBoard().allUncovered()) {
    //         winnerIsHuman = true;
    //     } else if (player2.getBoard().allCovered() || player1.getBoard().allUncovered()) {
    //         winnerIsHuman = false;
    //     }
    //     bool winnerWasFirst = (tournament.getFirstPlayerIsHuman() == winnerIsHuman);
    //     const Player* winnerPtr = winnerIsHuman ? static_cast<const Player*>(&player1)
    //                                             : static_cast<const Player*>(&player2);
    //     declareWinner(winnerPtr, winnerWasFirst);
    //     return;
    // }

    int movesSinceLastCheck = 0;

    while (true) {
        currentPlayer->takeTurn();

        if (Tournament::getAdvantageApplied()) {
            if (Tournament::getAdvantageOwner() == Tournament::Side::Human && currentPlayer->getIsHuman()) {
                Tournament::clearAdvantageProtectionForHuman();
            } else if (Tournament::getAdvantageOwner() == Tournament::Side::Computer && !currentPlayer->getIsHuman()) {
                Tournament::clearAdvantageProtectionForComputer();
            }
        }

        movesSinceLastCheck++;

        if (movesSinceLastCheck % 2 == 0) {
            if (player1.getBoard().allCovered() || player2.getBoard().allCovered() ||
                player1.getBoard().allUncovered() || player2.getBoard().allUncovered()) {
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

        currentPlayer = (currentPlayer == &player1) ? &player2 : &player1;

        tournament.setIsHumanTurn(currentPlayer->getIsHuman());
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



        if (isRoundOver()) {
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

    }


}

bool Round::isRoundOver() const {
    return player1.getBoard().allCovered() || player2.getBoard().allCovered() ||
           player1.getBoard().allUncovered() || player2.getBoard().allUncovered();
}

void Round::declareWinner(const Player* currentPlayer, const bool winnerWasFirstPlayer) const {
    if (player1.getBoard().allCovered()) {
        cout << "Human wins by covering all their squares!" << endl;
        tournament.updateScores(true, false, false, false,
                                player1.getBoard().getCoveredSum(),
                                player2.getBoard().getUncoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, /*winnerIsHuman=*/true, player2.getBoard().getUncoveredSum());
    } else if (player2.getBoard().allCovered()) {
        cout << "Computer wins by covering all their squares!" << endl;
        tournament.updateScores(false, false, true, false,
                                player1.getBoard().getUncoveredSum(),
                                player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer, /*winnerIsHuman=*/false, player1.getBoard().getUncoveredSum());

    } else if (player2.getBoard().allUncovered()) {
        cout << "Human wins by uncovering all the computer's squares!" << endl;
        // humanScore = HUMAN COVERED sum
        tournament.updateScores(false, true, false, false,
                                player1.getBoard().getCoveredSum(),
                                0);
        tournament.applyHandicap(winnerWasFirstPlayer,
                                 /*winnerIsHuman=*/true,
                                 player1.getBoard().getCoveredSum());

    } else if (player1.getBoard().allUncovered()) {
        cout << "Computer wins by uncovering all the human's squares!" << endl;
        tournament.updateScores(false, false, false, true,
                                0,
                                player2.getBoard().getCoveredSum());
        tournament.applyHandicap(winnerWasFirstPlayer,
                                 /*winnerIsHuman=*/false,
                                 player2.getBoard().getCoveredSum());
    }
}
