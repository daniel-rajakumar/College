#pragma once
#include "Player.h"

class ComputerPlayer : public Player
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    ComputerPlayer();
    ComputerPlayer(const std::string& name);

    // destructor
    ~ComputerPlayer() override = default;

    // selector(s)
    PlayerType getType() const override;

    // mutator(s)
    // (none)

    // utility functions
    Move chooseMove(const Round& round, const Tournament& tournament) override;

    // helper for "help mode"
    Move suggestBestMoveForHuman(const Round& round, const Tournament& tournament) const;

private:
    Move chooseBestMoveForPlayerMainColor(const Round& round, const Tournament& tournament, PlayerType who) const;
};
