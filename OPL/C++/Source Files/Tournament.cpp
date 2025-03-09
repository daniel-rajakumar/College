//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Tournament.h"
#include "../Header Files/Board.h"
#include "../Header Files/Computer.h"
#include "../Header Files/Human.h"
#include "../Header Files/Round.h"

#include <iostream>
#include <ostream>
using namespace std;

void Tournament::start() {
    int numOfSquares = 0;
    char playAgain = ' ';
    cout << "Enter Number of Squares: ";
    cin >> numOfSquares;

    do {
        Board humanBoard(numOfSquares);
        Board computerBoard(numOfSquares);

        Human human(humanBoard, computerBoard);
        Computer computer(computerBoard, humanBoard);

        Round round(human, computer);
        round.play();


        // Update scores based on the round result
        if (human.getBoard().allCovered()) {
            updateScores(true, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (computer.getBoard().allUncovered()) {
            updateScores(true, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (computer.getBoard().allCovered()) {
            updateScores(false, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (human.getBoard().allUncovered()) {
            updateScores(false, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        }

        // Ask the human player if they want to play another round
        cout << "Do you want to play another round? (y/n): ";
        cin >> playAgain;
    } while (playAgain == 'y' || playAgain == 'Y');

    declareTournamentWinner();
}


// Update scores
void Tournament::updateScores(const bool humanWonByCover, const int humanScore, const int computerScore) {
    if (humanWonByCover) {
        tournamentScoreHuman += computerScore; // Human wins by covering their squares
    } else {
        tournamentScoreHuman += humanScore; // Human wins by uncovering the computer's squares
    }

    if (!humanWonByCover) {
        tournamentScoreComputer += humanScore; // Computer wins by covering its squares
    } else {
        tournamentScoreComputer += computerScore; // Computer wins by uncovering the human's squares
    }
}

// Declare the tournament winner
void Tournament::declareTournamentWinner() const {
    if (tournamentScoreHuman > tournamentScoreComputer) {
        cout << "You win the tournament with a score of " << tournamentScoreHuman << "!" << endl;
    } else if (tournamentScoreComputer > tournamentScoreHuman) {
        cout << "Computer wins the tournament with a score of " << tournamentScoreComputer << "!" << endl;
    } else {
        cout << "The tournament is a draw!" << endl;
    }
}