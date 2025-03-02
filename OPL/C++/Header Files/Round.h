//
// Created by Daniel Rajakumar on 3/1/25.
//

#ifndef ROUND_H
#define ROUND_H


class Player;

class Round {
private:
    Player& player1;
    Player& player2;
    bool isOver;

public:
    Round(Player& p1, Player& p2); // Constructor
    void play() const;
    bool isRoundOver() const;
};



#endif //ROUND_H
