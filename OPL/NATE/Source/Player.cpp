#include "Player.h"
#include "Constants.h"

Player::Player()
    : m_name(""), m_score(0), m_roundsWon(0),
    m_mainColor(StoneColor::White),
    m_whiteRemaining(Constants::START_WHITE),
    m_blackRemaining(Constants::START_BLACK),
    m_clearRemaining(Constants::START_CLEAR)
{
}

Player::Player(const std::string& name)
    : Player()
{
    setName(name);
}

std::string Player::getName() const { return m_name; }
int Player::getScore() const { return m_score; }
int Player::getRoundsWon() const { return m_roundsWon; }
StoneColor Player::getMainColor() const { return m_mainColor; }

int Player::getRemaining(StoneColor stone) const
{
    if (stone == StoneColor::White) return m_whiteRemaining;
    if (stone == StoneColor::Black) return m_blackRemaining;
    if (stone == StoneColor::Clear) return m_clearRemaining;
    return 0;
}

bool Player::setName(const std::string& name)
{
    if (name.empty()) return false;
    m_name = name;
    return true;
}

bool Player::setScore(int score)
{
    if (score < 0) return false;
    m_score = score;
    return true;
}

bool Player::addScore(int delta)
{
    if (delta < 0) return false;
    return setScore(m_score + delta);
}

bool Player::setRoundsWon(int roundsWon)
{
    if (roundsWon < 0) return false;
    m_roundsWon = roundsWon;
    return true;
}

bool Player::addRoundWin()
{
    return setRoundsWon(m_roundsWon + 1);
}

bool Player::setMainColor(StoneColor mainColor)
{
    if (mainColor != StoneColor::White && mainColor != StoneColor::Black) return false;
    m_mainColor = mainColor;
    return true;
}

bool Player::setRemaining(StoneColor stone, int count)
{
    if (count < 0) return false;
    if (stone == StoneColor::White) { m_whiteRemaining = count; return true; }
    if (stone == StoneColor::Black) { m_blackRemaining = count; return true; }
    if (stone == StoneColor::Clear) { m_clearRemaining = count; return true; }
    return false;
}

bool Player::decrementStone(StoneColor stone)
{
    if (!isPlayableStone(stone)) return false;
    int cur = getRemaining(stone);
    if (cur <= 0) return false;
    return setRemaining(stone, cur - 1);
}
