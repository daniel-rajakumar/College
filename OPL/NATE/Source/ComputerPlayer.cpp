#include "ComputerPlayer.h"
#include "HumanPlayer.h"
#include "Round.h"
#include "Tournament.h"
#include "ScoringEngine.h"

ComputerPlayer::ComputerPlayer() : Player("Computer") {}
ComputerPlayer::ComputerPlayer(const std::string& name) : Player(name) {}

PlayerType ComputerPlayer::getType() const { return PlayerType::Computer; }

Move ComputerPlayer::chooseMove(const Round& round, const Tournament& tournament)
{
    return chooseBestMoveForPlayerMainColor(round, tournament, PlayerType::Computer);
}

Move ComputerPlayer::suggestBestMoveForHuman(const Round& round, const Tournament& tournament) const
{
    return chooseBestMoveForPlayerMainColor(round, tournament, PlayerType::Human);
}

Move ComputerPlayer::chooseBestMoveForPlayerMainColor(const Round& round, const Tournament& tournament, PlayerType who) const
{
    // PSEUDOCODE (Computer Strategy):
    // 1) Generate all legal moves for "who"
    // 2) For each move, simulate it on a copy of the round + copy of both players
    // 3) Measure immediate score gain for "who"
    // 4) Tie-break: choose move that minimizes opponent's legal move count next turn
    // 5) Return best move (or invalid if none)

    const Player& me = (who == PlayerType::Human) ? static_cast<const Player&>(tournament.getHuman())
        : static_cast<const Player&>(tournament.getComputer());

    const std::vector<Move> legal = round.generateLegalMovesFor(me);
    if (legal.empty()) return Move();

    int bestScoreGain = -1;
    int bestOppMoves = 999999;
    Move best = legal.front();

    for (const Move& mv : legal)
    {
        // Simulate on copies (NO slicing / NO abstract Player instantiation)
        Round sim = round;
        HumanPlayer simHuman = tournament.getHuman();
        ComputerPlayer simComp = tournament.getComputer();

        sim.forceNextPlayerForSimulation(who);

        if (!sim.applyMoveOrFail(mv, simHuman, simComp))
            continue;

        // Immediate gain for the mover
        const int before = me.getScore();
        const int after = (who == PlayerType::Human) ? simHuman.getScore() : simComp.getScore();
        const int gained = after - before;

        // Opponent options after this move
        const Player& simOpp = (who == PlayerType::Human) ? static_cast<const Player&>(simComp)
            : static_cast<const Player&>(simHuman);

        const int oppMoveCount = static_cast<int>(sim.generateLegalMovesFor(simOpp).size());

        if (gained > bestScoreGain || (gained == bestScoreGain && oppMoveCount < bestOppMoves))
        {
            bestScoreGain = gained;
            bestOppMoves = oppMoveCount;
            best = mv;
        }
    }

    return best;
}
