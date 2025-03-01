//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef TOURNAMENT_H
#define TOURNAMENT_H

#include <string>
using namespace std;


class Tournament {
private:
    int tournamentScoreHuman = 0;
    int tournamentScoreComputer = 0;
    bool advantage = false;
    int advantageSquare = -1;

    void applyHandicap(int winnerScore);
    void updateScores(bool humanWonByCover, int humanScore, int computerScore);

public:
    void start();
    void saveGame(const string& filename) const;
    bool loadGame(const string& filename);
};



#endif //TOURNAMENT_H
