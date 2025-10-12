//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Tournament.h"
#include "../Header Files/Board.h"
#include "../Header Files/Computer.h"
#include "../Header Files/Human.h"
#include "../Header Files/Round.h"
#include <limits>

#include <iostream>
#include <ostream>
#include <fstream>
#include <sstream>

using namespace std;

bool Tournament::protectHumanAdvantage   = false;
bool Tournament::protectComputerAdvantage= false;
Tournament::Side Tournament::advantageOwner = Tournament::Side::None;

/**
 * @brief Constructs a Tournament object.
 * 
 * @param humanBoard Reference to the human's board.
 * @param computerBoard Reference to the computer's board.
 */
Tournament::Tournament(Board& humanBoard, Board& computerBoard)
    : isHumanTurn(true), humanBoard(humanBoard), computerBoard(computerBoard), isANewGame(true), firstPlayerIsHuman(true) {
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

void Tournament::setIsHumanTurn(bool humanTurn) {
    isHumanTurn = humanTurn;
}

bool Tournament::getFirstPlayerIsHuman() const {
    return firstPlayerIsHuman;
}

void Tournament::setFirstPlayerIsHuman(bool isHuman) {
    firstPlayerIsHuman = isHuman;
}

/**
 * @brief Starts the tournament.
 */

void Tournament::start() {
    // Reuse the member boards of *this* Tournament
    // Create players that reference those member boards
    Human human(humanBoard, computerBoard);
    Computer computer(computerBoard, humanBoard);

    // LOAD?
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

        if (!loadGame(filename)) {
            cout << "Starting a new game..." << endl;
            // choose size for a brand-new game
            const int boardSize = promptBoardSize();
            humanBoard    = Board(boardSize);
            computerBoard = Board(boardSize);

            applyAdvantageToNewRound();

            isANewGame = true;
        } else {
            // successfully loaded a mid-round save
            isANewGame = false;
        }
    } else {
        const int boardSize = promptBoardSize();  // ask size for new game
        humanBoard    = Board(boardSize);
        computerBoard = Board(boardSize);

        applyAdvantageToNewRound();

        isANewGame = true;
    }
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;

    // ===== Game loop (ask size again for each *new* round) =====
    char playAgain;
    do {
        Round round(human, computer, *this, isANewGame);  // <- pass *this*, not a second Tournament
        round.play();

        // Tournament::start(), after round.play()
        // if (human.getBoard().allCovered()) {
        //     updateScores(true, false, false, false,
        //                  human.getBoard().getCoveredSum(),
        //                  computer.getBoard().getUncoveredSum());
        // } else if (computer.getBoard().allCovered()) {
        //     updateScores(false, false, true, false,
        //                  human.getBoard().getUncoveredSum(),
        //                  computer.getBoard().getCoveredSum());
        // }

        cout << "\n~~~~~~~~~[SCORE BOARD]~~~~~~~~~~\n";
        cout << "Your Score: " << tournamentScoreHuman << "\n";
        cout << "Computer's Score: " << tournamentScoreComputer << "\n";
        cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n\n";

        do {
            cout << "Do you want to play another round? (y/n): ";
            cin >> playAgain;
        } while (playAgain != 'y' && playAgain != 'n');

        if (playAgain == 'y' || playAgain == 'Y') {
            clearScreen();

            // Ask for size at the start of EVERY new round
            const int boardSize = promptBoardSize();
            humanBoard    = Board(boardSize);
            computerBoard = Board(boardSize);

            applyAdvantageToNewRound();

            // Reset per-round flags
            isHumanTurn = true;
            isANewGame  = true;

            cout << "New round starting on board size " << boardSize << "...\n";
        }
    } while (playAgain == 'y' || playAgain == 'Y');

    declareTournamentWinner();
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

        file << "First Turn: " << (firstPlayerIsHuman ? "Human" : "Computer") << endl;
        file << "Next Turn: " << (isHumanTurn ? "Human" : "Computer") << endl;

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
                // ----- read "   Squares: ..." -----
                getline(file, line);
                string squares = line.substr(12);          // FIX: was 11; "   Squares: " is 12 chars

                // Pass 1: count entries to infer board size
                {
                    stringstream ss(squares);              // fresh stream bound to text
                    int v;
                    boardSize = 0;
                    while (ss >> v) ++boardSize;
                }

                // Rebuild boards to that size
                humanBoard    = Board(boardSize);
                computerBoard = Board(boardSize);

                // Pass 2: set covered/uncovered state
                {
                    stringstream ss(squares);              // rebuild with the same text
                    for (int i = 1; i <= boardSize; ++i) {
                        int v; ss >> v;
                        if (v == 0) computerBoard.coverSquare(i);
                        else        computerBoard.uncoverSquare(i);
                    }
                }

                // ----- read "   Score: ..." -----
                getline(file, line);
                tournamentScoreComputer = stoi(line.substr(10)); // "   Score: " is 10 chars
            }

            else if (line.find("Human:") != string::npos) {
                getline(file, line);
                string squares = line.substr(12);          // FIX: was 11

                {
                    stringstream ss(squares);
                    for (int i = 1; i <= boardSize; ++i) {
                        int v; ss >> v;
                        if (v == 0) humanBoard.coverSquare(i);
                        else        humanBoard.uncoverSquare(i);
                    }
                }

                getline(file, line);
                tournamentScoreHuman = stoi(line.substr(10));
            } else if (line.rfind("First Turn:", 0) == 0) {
                firstPlayerIsHuman = (line.find("Human") != string::npos);
            } else if (line.rfind("Next Turn:", 0) == 0) {
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
void Tournament::applyHandicap(const bool winnerWasFirstPlayer, const bool winnerIsHuman, const int winningScore) const {
    // compute the square to award next round
    advantageSquare = calculateAdvantageSquare(winningScore);

    // decide who gets it NEXT round based on winner and starter
    Side forWhom;
    if (winnerWasFirstPlayer) {
        // winner started first -> the OTHER side gets advantage
        forWhom = winnerIsHuman ? Side::Computer : Side::Human;
    } else {
        // winner did NOT start first -> the WINNER gets advantage
        forWhom = winnerIsHuman ? Side::Human : Side::Computer;
    }

    // queue for next round
    auto* self = const_cast<Tournament*>(this);
    self->pendingAdvantageSquare = advantageSquare;
    self->pendingAdvantageFor    = forWhom;

    // do NOT cover now; do NOT set advantageApplied now
    cout << "[Advantage queued for next round] Square "
         << advantageSquare << " -> "
         << (forWhom == Side::Human ? "Human" : "Computer") << endl;
}

// Tournament.cpp
int Tournament::promptBoardSize() {
    int n;
    while (true) {
        cout << "Enter the size of the board (9, 10, or 11): ";
        if (cin >> n && (n == 9 || n == 10 || n == 11)) return n;

        cout << "Invalid size. Please enter 9, 10, or 11.\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

// Apply any queued advantage to the freshly rebuilt boards and enable one-turn protection
void Tournament::applyAdvantageToNewRound() {
    // reset current-round flags
    advantageApplied          = false;
    advantageOwner            = Side::None;
    protectHumanAdvantage     = false;
    protectComputerAdvantage  = false;

    if (pendingAdvantageFor == Side::None || pendingAdvantageSquare <= 0) return;

    if (pendingAdvantageFor == Side::Human) {
        humanBoard.coverSquare(pendingAdvantageSquare);
        protectHumanAdvantage = true;     // opponent (Computer) cannot uncover this square until Human takes one turn
        advantageOwner = Side::Human;
    } else { // Computer
        computerBoard.coverSquare(pendingAdvantageSquare);
        protectComputerAdvantage = true;  // opponent (Human) cannot uncover this square until Computer takes one turn
        advantageOwner = Side::Computer;
    }

    advantageApplied = true;              // for your existing UI display
    // clear "pending" now that it's applied
    pendingAdvantageSquare = 0;
    pendingAdvantageFor    = Side::None;
}

// Static helpers used by Human/Computer during uncover filtering
bool Tournament::isHumanAdvantageProtected()    { return protectHumanAdvantage; }
bool Tournament::isComputerAdvantageProtected() { return protectComputerAdvantage; }
Tournament::Side Tournament::getAdvantageOwner(){ return advantageOwner; }

// Clear protection after the advantaged side completes their FIRST turn this round
void Tournament::clearAdvantageProtectionForHuman() {
    protectHumanAdvantage = false;
    if (!protectComputerAdvantage) {
        advantageApplied = false;
        advantageOwner   = Side::None;
    }
}
void Tournament::clearAdvantageProtectionForComputer() {
    protectComputerAdvantage = false;
    if (!protectHumanAdvantage) {
        advantageApplied = false;
        advantageOwner   = Side::None;
    }
}
