#include "HumanPlayer.h"

HumanPlayer::HumanPlayer() : Player(), m_pending(), m_hasPending(false) {}
HumanPlayer::HumanPlayer(const std::string& name) : Player(name), m_pending(), m_hasPending(false) {}

PlayerType HumanPlayer::getType() const { return PlayerType::Human; }

bool HumanPlayer::setPendingMove(const Move& mv)
{
    if (!mv.isValid()) return false;
    m_pending = mv;
    m_hasPending = true;
    return true;
}

Move HumanPlayer::chooseMove(const Round&, const Tournament&)
{
    // No I/O here. Client should have set pending move.
    if (!m_hasPending) return Move();
    m_hasPending = false;
    return m_pending;
}
