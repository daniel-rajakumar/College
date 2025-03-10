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
    int advantageSquare = -1;
    bool isHumanTurn;
    Board& humanBoard; // Reference to the human's board
    Board& computerBoard; // Reference to the computer's board
    bool isANewGame;
    bool winnerWasFirstPlayer = false; // Track if the winner was the first player
    bool advantageApplied = false; // Track if the advantage has been applied




public:
    Tournament(Board &humanBoard, Board &computerBoard);
    void applyHandicap(bool winnerWasFirstPlayer, int winningScore); // Apply handicap for the next round
    int calculateAdvantageSquare(int winningScore); // Calculate the advantage square

    bool getIsANewGame() const;

    static void start();
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int
                      computerScore);

    void declareTournamentWinner() const;
    void saveGame(const string& filename) const;
    bool loadGame(const string& filename);
    void resetGame();

    bool getWinnerWasFirstPlayer() const;
    bool getAdvantageApplied() const;
};



#endif //TOURNAMENT_H
