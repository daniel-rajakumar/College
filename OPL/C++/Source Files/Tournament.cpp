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
#include <fstream>
#include <sstream>
using namespace std;

Tournament::Tournament(Board& humanBoard, Board& computerBoard)
    : isHumanTurn(true), humanBoard(humanBoard), computerBoard(computerBoard) {}



void Tournament::start() {
    // Initialize boards
    Board humanBoard(9); // Example: 9 squares
    Board computerBoard(9);

    // Initialize players
    Human human(humanBoard, computerBoard);
    Computer computer(computerBoard, humanBoard);

    // Initialize tournament
    Tournament tournament(humanBoard, computerBoard);

    // Ask the user if they want to load a saved game
    char loadChoice;
    cout << "Do you want to load a saved game? (y/n): ";
    cin >> loadChoice;

    if (loadChoice == 'y' || loadChoice == 'Y') {
        string filename;
        cout << "Enter the filename to load: ";
        cin >> filename;

        if (!tournament.loadGame(filename)) {
            cout << "Starting a new game..." << endl;
        }
    }

    // Start the game loop
    char playAgain;
    do {
        Round round(human, computer, tournament);
        round.play();

        // Update scores based on the round result
        if (human.getBoard().allCovered()) {
            tournament.updateScores(true, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (computer.getBoard().allUncovered()) {
            tournament.updateScores(true, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (computer.getBoard().allCovered()) {
            tournament.updateScores(false, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (human.getBoard().allUncovered()) {
            tournament.updateScores(false, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        }


        // Ask the human player if they want to play another round
        cout << "Do you want to play another round? (y/n): ";
        cin >> playAgain;
    } while (playAgain == 'y' || playAgain == 'Y');

    // Declare the tournament winner
    tournament.declareTournamentWinner();
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





// Save the game state to a file
void Tournament::saveGame(const string& filename) const {
    string filePath = filename; // Save in the res folder
    if (ofstream file(filename); file.is_open()) {
        // Save computer's board and score
        file << "Computer:" << endl;
        file << "   Squares: ";
        for (int i = 1; i <= computerBoard.getSize(); ++i) {
            if (computerBoard.isSquareCovered(i)) {
                file << "0 ";
            } else {
                file << i << " ";
            }
        }
        file << endl;
        file << "   Score: " << tournamentScoreComputer << endl;

        // Save human's board and score
        file << "Human:" << endl;
        file << "   Squares: ";
        for (int i = 1; i <= humanBoard.getSize(); ++i) {
            if (humanBoard.isSquareCovered(i)) {
                file << "0 ";
            } else {
                file << i << " ";
            }
        }
        file << endl;
        file << "   Score: " << tournamentScoreHuman << endl;

        // Save turn information
        file << "First Turn: " << (isHumanTurn ? "Human" : "Computer") << endl;
        file << "Next Turn: " << (isHumanTurn ? "Human" : "Computer") << endl;

        file.close();
        cout << "Game saved successfully to " << filename << endl;
    } else {
        cerr << "Unable to save game to " << filename << endl;
    }
}

// Load the game state from a file
bool Tournament::loadGame(const string& filename) {
    if (ifstream file(filename); file.is_open()) {
        string line;
        while (getline(file, line)) {
            if (line.find("Computer:") != string::npos) {
                // Load computer's board
                getline(file, line); // Read the squares line
                stringstream ss(line.substr(11)); // Skip "   Squares: "
                int square;
                for (int i = 1; i <= computerBoard.getSize(); ++i) {
                    ss >> square;
                    if (square == 0) {
                        computerBoard.coverSquare(i);
                    } else {
                        computerBoard.uncoverSquare(i);
                    }
                }

                // Load computer's score
                getline(file, line); // Read the score line
                tournamentScoreComputer = stoi(line.substr(10)); // Skip "   Score: "
            } else if (line.find("Human:") != string::npos) {
                // Load human's board
                getline(file, line); // Read the squares line
                stringstream ss(line.substr(11)); // Skip "   Squares: "
                int square;
                for (int i = 1; i <= humanBoard.getSize(); ++i) {
                    ss >> square;
                    if (square == 0) {
                        humanBoard.coverSquare(i);
                    } else {
                        humanBoard.uncoverSquare(i);
                    }
                }

                // Load human's score
                getline(file, line); // Read the score line
                tournamentScoreHuman = stoi(line.substr(10)); // Skip "   Score: "
            } else if (line.find("First Turn:") != string::npos) {
                // Load first turn information
                isHumanTurn = (line.find("Human") != string::npos);
            } else if (line.find("Next Turn:") != string::npos) {
                // Load next turn information
                isHumanTurn = (line.find("Human") != string::npos);
            }
        }
        file.close();
        cout << "Game loaded successfully from " << filename << endl;
        return true;
    } else {
        cerr << "Unable to load game from " << filename << endl;
        return false;
    }
}