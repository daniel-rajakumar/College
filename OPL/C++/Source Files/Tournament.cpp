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
    : isHumanTurn(true), humanBoard(humanBoard), computerBoard(computerBoard), isANewGame(false) {
}

// Initialize static variables
bool Tournament::advantageApplied = false;
int Tournament::advantageSquare = 0;

bool Tournament::getAdvantageApplied() {
    return advantageApplied;
}

int Tournament::getAdvantageSquare() {
    return advantageSquare;
}

void clearScreen() {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

bool Tournament::getIsANewGame() const {
    return isANewGame;
}

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
    cout << "~~~~~~~~~~~~[LOAD?]~~~~~~~~~~~~" << endl;
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
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;

    clearScreen();
    // Start the game loop
    char playAgain;
    do {
        Round round(human, computer, tournament, tournament.getIsANewGame());
        round.play();

        // Update scores based on the round result
        if (human.getBoard().allCovered()) {
            tournament.updateScores(true, false, false, false, human.getBoard().getCoveredSum(), computer.getBoard().getUncoveredSum());
        } else if (computer.getBoard().allUncovered()) {
            tournament.updateScores(false, true, false, false, human.getBoard().getCoveredSum(), computer.getBoard().getUncoveredSum());
        } else if (computer.getBoard().allCovered()) {
            tournament.updateScores(false, false, true, false, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        } else if (human.getBoard().allUncovered()) {
            tournament.updateScores(false, false, false, true, human.getBoard().getUncoveredSum(), computer.getBoard().getCoveredSum());
        }

        cout << endl;
        cout << "~~~~~~~~~[SCORE BOARD]~~~~~~~~~~" << endl;
        cout << "Your Score: " << tournament.tournamentScoreHuman << endl;
        cout << "Computer's Score: " << tournament.tournamentScoreComputer << endl;
        cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl;
        cout << endl;

        // Ask the human player if they want to play another round
        cout << "Do you want to play another round? (y/n): ";
        cin >> playAgain;

        if (playAgain == 'y' || playAgain == 'Y') {
            clearScreen();
            tournament.resetGame();
        }
    } while (playAgain == 'y' || playAgain == 'Y');

    // Declare the tournament winner
    tournament.declareTournamentWinner();
}


void Tournament::updateScores(const bool humanWonByCover, const bool humanWonByUncover, const bool computerWonByCover, const bool computerWonByUncover, const int humanScore, const int computerScore) {
    if (humanWonByCover) {
        // Human wins by covering all their squares
        // Human's score increases by the sum of the computer's uncovered squares
        tournamentScoreHuman += computerScore;
    } else if (humanWonByUncover) {
        // Human wins by uncovering all the computer's squares
        // Human's score increases by the sum of the human's covered squares
        tournamentScoreHuman += humanScore;
    }

    if (computerWonByCover) {
        // Computer wins by covering all its squares
        // Computer's score increases by the sum of the human's uncovered squares
        tournamentScoreComputer += humanScore;
    } else if (computerWonByUncover) {
        // Computer wins by uncovering all the human's squares
        // Computer's score increases by the sum of the computer's covered squares
        tournamentScoreComputer += computerScore;
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


void Tournament::resetGame() {
    // Reset the boards
    humanBoard = Board(humanBoard.getSize()); // Reset human board
    computerBoard = Board(computerBoard.getSize()); // Reset computer board

    // Reset scores
    // tournamentScoreHuman = 0;
    // tournamentScoreComputer = 0;

    // Reset turn and new game flag
    isHumanTurn = true;
    isANewGame = true;

    cout << "Game state has been reset. Starting a new game..." << endl;

    cout << "[ Human: " << tournamentScoreHuman << ", Computer: " << tournamentScoreComputer << " ]"<<  endl;

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
        isANewGame = false;
        return true;
    } else {
        cerr << "Unable to load game from " << filename << endl;
        return false;
    }
}



// Calculate the advantage square based on the sum of the digits of the winning score
int Tournament::calculateAdvantageSquare(int winningScore) {
    int sum = 0;
    while (winningScore > 0) {
        sum += winningScore % 10; // Add the last digit
        winningScore /= 10; // Remove the last digit
    }
    return sum;
}

void Tournament::applyHandicap(bool winnerWasFirstPlayer, int winningScore) {
    // Calculate the advantage square
    advantageSquare = calculateAdvantageSquare(winningScore);

    // Determine who gets the advantage
    if (winnerWasFirstPlayer) {
        // If the winner was the first player, the opponent gets the advantage
        if (isHumanTurn) {
            cout << "Computer gets the advantage. Square " << advantageSquare << " on the computer's board will be covered." << endl;
            computerBoard.coverSquare(advantageSquare); // Cover the square on the computer's board
        } else {
            cout << "Human gets the advantage. Square " << advantageSquare << " on the human's board will be covered." << endl;
            humanBoard.coverSquare(advantageSquare); // Cover the square on the human's board
        }
    } else {
        // If the winner was the second player, the winner keeps the advantage
        if (isHumanTurn) {
            cout << "Human keeps the advantage. Square " << advantageSquare << " on the human's board will be covered." << endl;
            humanBoard.coverSquare(advantageSquare); // Cover the square on the human's board
        } else {
            cout << "Computer keeps the advantage. Square " << advantageSquare << " on the computer's board will be covered." << endl;
            computerBoard.coverSquare(advantageSquare); // Cover the square on the computer's board
        }
    }

    advantageApplied = true; // Mark that the advantage has been applied
}