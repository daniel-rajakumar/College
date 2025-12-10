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

Tournament::Tournament(Board& humanBoard, Board& computerBoard)
    : isHumanTurn(true), humanBoard(humanBoard), computerBoard(computerBoard), isANewGame(true), firstPlayerIsHuman(true) {
}

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


void Tournament::start() {
    Human human(humanBoard, computerBoard);
    Computer computer(computerBoard, humanBoard);

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
            const int boardSize = promptBoardSize();
            humanBoard    = Board(boardSize);
            computerBoard = Board(boardSize);

            applyAdvantageToNewRound();

            isANewGame = true;
        } else {
            isANewGame = false;
        }
    } else {
        const int boardSize = promptBoardSize();
        humanBoard    = Board(boardSize);
        computerBoard = Board(boardSize);

        applyAdvantageToNewRound();

        isANewGame = true;
    }
    cout << "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~" << endl << endl;

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

            const int boardSize = promptBoardSize();
            humanBoard    = Board(boardSize);
            computerBoard = Board(boardSize);

            applyAdvantageToNewRound();

            isHumanTurn = true;
            isANewGame  = true;

            cout << "New round starting on board size " << boardSize << "...\n";
        }
    } while (playAgain == 'y' || playAgain == 'Y');

    declareTournamentWinner();
}

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
    humanBoard = Board(humanBoard.getSize());
    computerBoard = Board(computerBoard.getSize());

    isHumanTurn = true;
    isANewGame = true;

    cout << "Game state has been reset! Starting a new game..." << endl;
    cout << "[ Human: " << tournamentScoreHuman << ", Computer: " << tournamentScoreComputer << " ]" << endl;
}

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

bool Tournament::loadGame(const string& filename) {
    if (ifstream file(filename); file.is_open()) {
        string line;
        int boardSize = 0;


        while (getline(file, line)) {
            if (line.find("Computer:") != string::npos) {
                getline(file, line);
                string squares = line.substr(12);

                {
                    stringstream ss(squares);
                    int v;
                    boardSize = 0;
                    while (ss >> v) ++boardSize;
                }

                humanBoard    = Board(boardSize);
                computerBoard = Board(boardSize);

                {
                    stringstream ss(squares);
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

        cout << "FirstPlayer: " << (firstPlayerIsHuman ? "Human" : "Computer") << ", Next Player: " << (isHumanTurn ? "Human" : "Computer") << endl;
        isANewGame = false;
        return true;
    } else {
        cerr << "Unable to load game from " << filename << endl;
        return false;
    }
}

int Tournament::calculateAdvantageSquare(int winningScore) {
    int sum = 0;
    while (winningScore > 0) {
        sum += winningScore % 10;
        winningScore /= 10;
    }
    return sum;
}

void Tournament::applyHandicap(bool winnerWasFirstPlayer, bool winnerIsHuman, int winningScore) const {
    advantageSquare = calculateAdvantageSquare(winningScore);

    Side forWhom;
    if (winnerWasFirstPlayer) {
        // winner started first -> the OTHER side gets advantage
        forWhom = winnerIsHuman ? Side::Computer : Side::Human;
    } else {
        // winner did NOT start first -> the WINNER gets advantage
        forWhom = winnerIsHuman ? Side::Human : Side::Computer;
    }

    auto* self = const_cast<Tournament*>(this);
    self->pendingAdvantageSquare = advantageSquare;
    self->pendingAdvantageFor    = forWhom;

    cout << "[Advantage queued for next round] Square "
         << advantageSquare << " -> "
         << (forWhom == Side::Human ? "Human" : "Computer") << endl;
}

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

void Tournament::applyAdvantageToNewRound() {
    advantageApplied          = false;
    advantageOwner            = Side::None;
    protectHumanAdvantage     = false;
    protectComputerAdvantage  = false;

    if (pendingAdvantageFor == Side::None || pendingAdvantageSquare <= 0) return;

    if (pendingAdvantageFor == Side::Human) {
        humanBoard.coverSquare(pendingAdvantageSquare);
        protectHumanAdvantage = true;
        advantageOwner = Side::Human;
    } else {
        computerBoard.coverSquare(pendingAdvantageSquare);
        protectComputerAdvantage = true;
        advantageOwner = Side::Computer;
    }

    advantageApplied = true;
    pendingAdvantageSquare = 0;
    pendingAdvantageFor    = Side::None;
}

bool Tournament::isHumanAdvantageProtected()    { return protectHumanAdvantage; }
bool Tournament::isComputerAdvantageProtected() { return protectComputerAdvantage; }
Tournament::Side Tournament::getAdvantageOwner(){ return advantageOwner; }

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
