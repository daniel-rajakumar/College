#pragma once
#include <string>
#include "Stone.h"
#include "Move.h"

class Round;
class Tournament;

enum class PlayerType { Human, Computer };

class Player
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    Player();
    Player(const std::string& name);

    // destructor
    virtual ~Player() = default;

    // selector(s)
    std::string getName() const;
    int getScore() const;
    int getRoundsWon() const;
    StoneColor getMainColor() const;
    int getRemaining(StoneColor stone) const;

    // mutator(s)
    bool setName(const std::string& name);
    bool setScore(int score);
    bool addScore(int delta);
    bool setRoundsWon(int roundsWon);
    bool addRoundWin();
    bool setMainColor(StoneColor mainColor);

    bool setRemaining(StoneColor stone, int count);
    bool decrementStone(StoneColor stone);

    // utility functions
    virtual PlayerType getType() const = 0;
    virtual Move chooseMove(const Round& round, const Tournament& tournament) = 0;

protected:
    // (none)

private:
    std::string m_name;
    int m_score;
    int m_roundsWon;
    StoneColor m_mainColor;
    int m_whiteRemaining;
    int m_blackRemaining;
    int m_clearRemaining;
};
