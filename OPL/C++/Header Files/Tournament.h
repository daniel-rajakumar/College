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


    void applyHandicap(int winnerScore);

public:
    Tournament(Board &humanBoard, Board &computerBoard);

    bool getIsANewGame() const;

    static void start();
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int
                      computerScore);

    void declareTournamentWinner() const;
    void saveGame(const string& filename) const;
    bool loadGame(const string& filename);
    void resetGame();
};



#endif //TOURNAMENT_H
