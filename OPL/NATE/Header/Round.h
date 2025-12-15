#pragma once
#include <set>
#include <vector>
#include "Board.h"
#include "Move.h"
#include "ScoringEngine.h"
#include "SaveGame.h"
#include "Player.h"

enum class RoundResult { HumanWin, ComputerWin, Tie };

class Round
{
public:
    // constants
    // (none)

    // variables
    // (none)

    // constructor(s)
    Round();
    Round(const Round& other);

    // destructor
    ~Round() = default;

    // selector(s)
    const Board& getBoard() const;
    bool isComplete() const;

    PlayerType getNextPlayerType() const;
    bool hasLastMove() const;
    PocketCoord getLastMove() const;

    std::vector<Move> generateLegalMovesFor(const Player& player) const;

    RoundResult getResult(const Player& human, const Player& computer) const;

    // mutator(s)
    void startNewRound(Player& human, Player& computer);
    bool applyMoveOrFail(const Move& move, Player& human, Player& computer);

    bool restoreFromSaveGame(const SaveGame& save, Player& human, Player& computer);

    // utility functions
    void forceNextPlayerForSimulation(PlayerType who);

private:
    bool isLegalMoveForPlayer(const Move& move, const Player& player) const;
    std::vector<PocketCoord> getAllowedCoordsByTurnRule() const;

    void switchTurn();

    Board m_board;
    PlayerType m_next;
    bool m_hasLast;
    PocketCoord m_last;

    ScoringEngine m_scoring;

    // Track awarded triples per player (new arrangements only)
    std::set<std::string> m_awardedForHuman;
    std::set<std::string> m_awardedForComputer;
};
