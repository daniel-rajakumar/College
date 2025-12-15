#pragma once
#include <string>

enum class StoneColor
{
    Empty = 0,
    White = 1,
    Black = 2,
    Clear = 3
};

inline bool isPlayableStone(StoneColor c)
{
    return c == StoneColor::White || c == StoneColor::Black || c == StoneColor::Clear;
}

inline std::string stoneColorToString(StoneColor c)
{
    switch (c)
    {
    case StoneColor::White: return "WHITE";
    case StoneColor::Black: return "BLACK";
    case StoneColor::Clear: return "CLEAR";
    case StoneColor::Empty: return "EMPTY";
    default: return "UNKNOWN";
    }
}
