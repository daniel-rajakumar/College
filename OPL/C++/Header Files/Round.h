//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef ROUND_H
#define ROUND_H
#include <string>


class Tournament;
class Board;
class Player;

class Round {
private:
    Player& player1;
    Player& player2;
    bool isOver;
    bool isHumanTurn{};

public:
    // Round(Player& p1, Player& p2); // Constructor
    Round(Player &p1, Player &p2);

    void play() const;
    bool isRoundOver() const;

    void declareWinner() const;
    Player& determineFirstPlayer() const; // Determine the first player
};



#endif //ROUND_H
