#pragma once
#include <string>
#include "Board.h"
#include "Stone.h"
#include "PocketCoord.h"

enum class NextPlayerTag { Human, Computer };

struct SavePlayer
{
    StoneColor mainColor = StoneColor::White;
    int score = 0;
    int remainWhite = 0;
    int remainBlack = 0;
    int remainClear = 0;
    int roundsWon = 0;
    std::string name;
};

struct SaveGame
{
    SavePlayer human;
    SavePlayer computer;

    NextPlayerTag nextPlayer = NextPlayerTag::Human;
    bool hasLastMove = false;
    PocketCoord lastMove;

    Board board;
};
