//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"

#include <iostream>

#include "../Header Files/Player.h"

Round::Round(Player& p1, Player& p2) : player1(p1), player2(p2), isOver(false) {}

void Round::play() const {
    char hello;
    while (!isOver) {
        player1.takeTurn();
        player2.takeTurn();
        cout << "\n";
    }
}

bool Round::isRoundOver() const {
    return isOver;
}
