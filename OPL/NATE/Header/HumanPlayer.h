#pragma once
#include "Player.h"

class HumanPlayer : public Player
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    HumanPlayer();
    HumanPlayer(const std::string& name);

    // destructor
    ~HumanPlayer() override = default;

    // selector(s)
    PlayerType getType() const override;

    // mutator(s)
    bool setPendingMove(const Move& mv);

    // utility functions
    Move chooseMove(const Round& round, const Tournament& tournament) override;

private:
    Move m_pending;
    bool m_hasPending;
};
