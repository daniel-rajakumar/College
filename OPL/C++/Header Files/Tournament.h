//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef TOURNAMENT_H
#define TOURNAMENT_H

#include <string>
class Board;
using namespace std;


class Tournament {
private:
    int tournamentScoreHuman = 0;
    int tournamentScoreComputer = 0;
    bool advantage = false;
    bool isHumanTurn;
    Board& humanBoard; // Reference to the human's board
    Board& computerBoard; // Reference to the computer's board
    bool isANewGame;
    static bool advantageApplied; // Static variable to track if the advantage has been applied
    static int advantageSquare;   // Static variable for the advantage square



public:
    Tournament(Board &humanBoard, Board &computerBoard);
    // void applyHandicap(bool winnerWasFirstPlayer, int winningScore); // Apply handicap for the next round
    int calculateAdvantageSquare(int winningScore); // Calculate the advantage square

    bool getIsANewGame() const;

    static void start();
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int
                      computerScore);

    void declareTournamentWinner() const;
    void saveGame(const string& filename) const;
    bool loadGame(const string& filename);
    void resetGame();

    static bool getAdvantageApplied(); // Static getter for advantageApplied
    static int getAdvantageSquare();   // Static getter for advantageSquare
    void applyHandicap(bool winnerWasFirstPlayer, int winningScore); // Static method to apply handicap
};



#endif //TOURNAMENT_H
