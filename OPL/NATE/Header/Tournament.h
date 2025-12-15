#pragma once
#include <string>
#include "HumanPlayer.h"
#include "ComputerPlayer.h"
#include "SaveGame.h"
#include "Round.h"

enum class CoinSide { Heads = 1, Tails = 2 };

class Tournament
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    Tournament();

    // destructor
    ~Tournament() = default;

    // selector(s)
    const HumanPlayer& getHuman() const;
    const ComputerPlayer& getComputer() const;

    HumanPlayer& getHuman();
    ComputerPlayer& getComputer();

    // mutator(s)
    void initializeNewTournament(const std::string& humanName, const std::string& computerName);
    void performCoinToss(CoinSide humanCall);
    void assignColors(StoneColor winnerChoiceMainColor);
    void updateRoundsWonFromRound(const Round& round);

    bool restoreFromSaveGame(const SaveGame& save);
    SaveGame buildSaveGame(const Round& round) const;

    // utility functions
    void printTournamentWinner() const;

private:
    HumanPlayer m_human;
    ComputerPlayer m_computer;

    bool m_humanWonToss;
};
