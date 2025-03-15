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

/**
 * @brief Constructs a Tournament object.
 * 
 * @param humanBoard Reference to the human's board.
 * @param computerBoard Reference to the computer's board.
 */
Tournament::Tournament(Board& humanBoard, Board& computerBoard)
    : isHumanTurn(true), humanBoard(humanBoard), computerBoard(computerBoard), isANewGame(true) {
}

// Static member initialization
bool Tournament::advantageApplied = false;
int Tournament::advantageSquare = 0;

/**
 * @brief Gets whether the advantage has been applied.
 * 
 * @return True if the advantage has been applied, false otherwise.
 */
bool Tournament::getAdvantageApplied() {
    return advantageApplied;
}

/**
 * @brief Gets the advantage square.
 * 
 * @return The advantage square.
 */
int Tournament::getAdvantageSquare() {
    return advantageSquare;
}

/**
 * @brief Clears the console screen.
 */
void clearScreen() {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

/**
 * @brief Gets whether it is a new game.
 * 
 * @return True if it is a new game, false otherwise.
 */
bool Tournament::getIsANewGame() const {
    return isANewGame;
}

/**
 * @brief Gets whether it is the human player's turn.
 * 
 * @return True if it is the human player's turn, false otherwise.
 */
bool Tournament::getIsHumanTurn() const {
    return isHumanTurn;
}

/**
 * @brief Starts the tournament.
 */
void Tournament::start() {
    Board humanBoard(11);
    Board computerBoard(11);

    Human human(humanBoard, computerBoard);
    Computer computer(computerBoard, humanBoard);

    Tournament tournament(humanBoard, computerBoard);

    // Ask the user if they want to load a saved game
    char loadChoice;
    cout << "~~~~~~~~~~~~[LOAD?]~~~~~~~~~~~~" << endl;
    do {
        cout << "Do you want to load a saved game? (y/n): ";
        cin >> loadChoice;
    } while (loadChoice != 'y' && loadChoice != 'n');

    if (loadChoice == 'y' || loadChoice == 'Y') {
        string filename;
        cout << "Enter the filename to load: ";
        cin >> filename;

        if (!tournament.loadGame(filename)) {
            cout << "Starting a new game..." << endl;
        }
    } else {
        int boardSize;
        do {
            cout << "Enter the size of the board (9, 10, or 11): ";
            cin >> boardSize;
        } while (boardSize != 9 && boardSize != 10 && boardSize != 11);

        humanBoard = Board(boardSize);
        computerBoard = Board(boardSize);
    }
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;

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
        do {
            cout << "Do you want to play another round? (y/n): ";
            cin >> playAgain;
        } while (playAgain != 'y' && playAgain != 'n');

        if (playAgain == 'y' || playAgain == 'Y') {
            clearScreen();
            tournament.resetGame();
        }
    } while (playAgain == 'y' || playAgain == 'Y');

    // Declare the tournament winner
    tournament.declareTournamentWinner();
}

/**
 * @brief Updates the scores based on the outcome of the round.
 * 
 * @param humanWonByCover True if the human won by covering squares.
 * @param humanWonByUncover True if the human won by uncovering squares.
 * @param computerWonByCover True if the computer won by covering squares.
 * @param computerWonByUncover True if the computer won by uncovering squares.
 * @param humanScore The human player's score.
 * @param computerScore The computer player's score.
 */
void Tournament::updateScores(const bool humanWonByCover, const bool humanWonByUncover, const bool computerWonByCover, const bool computerWonByUncover, const int humanScore, const int computerScore) {
    if (humanWonByCover) {
        tournamentScoreHuman += computerScore;
    } 
    if (humanWonByUncover) {
        tournamentScoreHuman += humanScore;
    } 
    if (computerWonByCover) {
        tournamentScoreComputer += humanScore;
    } 
    if (computerWonByUncover) {
        tournamentScoreComputer += computerScore;
    }
}

/**
 * @brief Declares the winner of the tournament.
 */
void Tournament::declareTournamentWinner() const {
    if (tournamentScoreHuman > tournamentScoreComputer) {
        cout << "You win the tournament with a score of " << tournamentScoreHuman << "!" << endl;
    } else if (tournamentScoreComputer > tournamentScoreHuman) {
        cout << "Computer wins the tournament with a score of " << tournamentScoreComputer << "!" << endl;
    } else {
        cout << "The tournament is a draw!" << endl;
    }
}

/**
 * @brief Resets the game state.
 */
void Tournament::resetGame() {
    humanBoard = Board(humanBoard.getSize());
    computerBoard = Board(computerBoard.getSize());

    isHumanTurn = true;
    isANewGame = true;

    cout << "Game state has been reset! Starting a new game..." << endl;
    cout << "[ Human: " << tournamentScoreHuman << ", Computer: " << tournamentScoreComputer << " ]" << endl;
}

/**
 * @brief Saves the game state to a file.
 * 
 * @param filename The name of the file to save the game state to.
 */
void Tournament::saveGame(const string& filename) const {
    if (ofstream file(filename); file.is_open()) {
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

        file << "First Turn: " << (isHumanTurn ? "Human" : "Computer") << endl;
        file << "Next Turn: " << (!isHumanTurn ? "Human" : "Computer") << endl;

        file.close();
        cout << "Game saved successfully to " << filename << endl;
    } else {
        cerr << "Unable to save game to " << filename << endl;
    }
}

/**
 * @brief Loads the game state from a file.
 * 
 * @param filename The name of the file to load the game state from.
 * @return True if the game state was successfully loaded, false otherwise.
 */
bool Tournament::loadGame(const string& filename) {
    if (ifstream file(filename); file.is_open()) {
        string line;
        int boardSize = 0;

        while (getline(file, line)) {
            if (line.find("Computer:") != string::npos) {
                getline(file, line);
                stringstream ss(line.substr(11));
                int square;
                boardSize = 0;
                while (ss >> square) {
                    boardSize++;
                }

                humanBoard = Board(boardSize);
                computerBoard = Board(boardSize);

                ss.clear();
                ss.seekg(0);
                for (int i = 1; i <= boardSize; ++i) {
                    ss >> square;
                    if (square == 0) {
                        computerBoard.coverSquare(i);
                    } else {
                        computerBoard.uncoverSquare(i);
                    }
                }

                getline(file, line);
                tournamentScoreComputer = stoi(line.substr(10));
            } else if (line.find("Human:") != string::npos) {
                getline(file, line);
                stringstream ss(line.substr(11));
                for (int i = 1; i <= boardSize; ++i) {
                    int square;
                    ss >> square;
                    if (square == 0) {
                        humanBoard.coverSquare(i);
                    } else {
                        humanBoard.uncoverSquare(i);
                    }
                }

                getline(file, line);
                tournamentScoreHuman = stoi(line.substr(10));
            } else if (line.find("First Turn:") != string::npos) {
                isHumanTurn = (line.find("Human") != string::npos);
            } else if (line.find("Next Turn:") != string::npos) {
                isHumanTurn = !(line.find("Human") != string::npos);
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

/**
 * @brief Calculates the advantage square based on the sum of the digits of the winning score.
 * 
 * @param winningScore The winning score.
 * @return The calculated advantage square.
 */
int Tournament::calculateAdvantageSquare(int winningScore) {
    int sum = 0;
    while (winningScore > 0) {
        sum += winningScore % 10; // Add the last digit
        winningScore /= 10; // Remove the last digit
    }
    return sum;
}

/**
 * @brief Applies a handicap based on the winner and winning score.
 * 
 * @param winnerWasFirstPlayer True if the winner was the first player.
 * @param winningScore The winning score.
 */
void Tournament::applyHandicap(const bool winnerWasFirstPlayer, const int winningScore) const {
    advantageSquare = calculateAdvantageSquare(winningScore);

    if (winnerWasFirstPlayer) {
        if (isHumanTurn) {
            cout << "Computer gets the advantage. Square " << advantageSquare << " on the computer's board will be covered." << endl;
            computerBoard.coverSquare(advantageSquare); // Cover the square on the computer's board
        } else {
            cout << "Human gets the advantage. Square " << advantageSquare << " on the human's board will be covered." << endl;
            humanBoard.coverSquare(advantageSquare); // Cover the square on the human's board
        }
    } else {
        if (isHumanTurn) {
            cout << "Human keeps the advantage. Square " << advantageSquare << " on the human's board will be covered." << endl;
            humanBoard.coverSquare(advantageSquare); // Cover the square on the human's board
        } else {
            cout << "Computer keeps the advantage. Square " << advantageSquare << " on the computer's board will be covered." << endl;
            computerBoard.coverSquare(advantageSquare); // Cover the square on the computer's board
        }
    }

    advantageApplied = true;
}
