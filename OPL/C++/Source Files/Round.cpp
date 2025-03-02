//
// Created by Daniel Rajakumar on 3/1/25.
//

#include "../Header Files/Round.h"

#include "../Header Files/Player.h"

Round::Round(Player& p1, Player& p2) : player1(p1), player2(p2), isOver(false) {}

void Round::play() {
    while (!isOver) {
        player1.takeTurn();
        player2.takeTurn();
    }
}

bool Round::isRoundOver() const {
    return isOver;
}
