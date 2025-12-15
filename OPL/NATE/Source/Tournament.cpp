#include "Tournament.h"
#include <random>
#include <iostream>

Tournament::Tournament() : m_human("Human"), m_computer("Computer"), m_humanWonToss(true) {}

const HumanPlayer& Tournament::getHuman() const { return m_human; }
const ComputerPlayer& Tournament::getComputer() const { return m_computer; }
HumanPlayer& Tournament::getHuman() { return m_human; }
ComputerPlayer& Tournament::getComputer() { return m_computer; }

void Tournament::initializeNewTournament(const std::string& humanName, const std::string& computerName)
{
    m_human.setName(humanName);
    m_computer.setName(computerName);

    m_human.setRoundsWon(0);
    m_computer.setRoundsWon(0);

    // temporarily set (will be overwritten by assignColors)
    m_human.setMainColor(StoneColor::White);
    m_computer.setMainColor(StoneColor::Black);
}

void Tournament::performCoinToss(CoinSide humanCall)
{
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_int_distribution<int> dist(1, 2);

    const CoinSide flip = static_cast<CoinSide>(dist(gen));
    m_humanWonToss = (flip == humanCall);

    std::cout << "Coin toss result: " << (flip == CoinSide::Heads ? "Heads" : "Tails") << "\n";
    std::cout << (m_humanWonToss ? "Human wins toss.\n" : "Computer wins toss.\n");
}

void Tournament::assignColors(StoneColor winnerChoiceMainColor)
{
    // winner chooses main color; other gets the other
    const StoneColor other = (winnerChoiceMainColor == StoneColor::White) ? StoneColor::Black : StoneColor::White;

    if (m_humanWonToss)
    {
        m_human.setMainColor(winnerChoiceMainColor);
        m_computer.setMainColor(other);
    }
    else
    {
        m_computer.setMainColor(winnerChoiceMainColor);
        m_human.setMainColor(other);
    }
}

void Tournament::updateRoundsWonFromRound(const Round& round)
{
    const RoundResult r = round.getResult(m_human, m_computer);
    if (r == RoundResult::HumanWin) m_human.addRoundWin();
    else if (r == RoundResult::ComputerWin) m_computer.addRoundWin();
}

void Tournament::printTournamentWinner() const
{
    if (m_human.getRoundsWon() > m_computer.getRoundsWon())
        std::cout << m_human.getName() << " wins the tournament!\n";
    else if (m_computer.getRoundsWon() > m_human.getRoundsWon())
        std::cout << m_computer.getName() << " wins the tournament!\n";
    else
        std::cout << "Tournament ends in a tie.\n";
}

bool Tournament::restoreFromSaveGame(const SaveGame& save)
{
    m_human.setMainColor(save.human.mainColor);
    m_human.setScore(save.human.score);
    m_human.setRemaining(StoneColor::White, save.human.remainWhite);
    m_human.setRemaining(StoneColor::Black, save.human.remainBlack);
    m_human.setRemaining(StoneColor::Clear, save.human.remainClear);
    m_human.setRoundsWon(save.human.roundsWon);

    m_computer.setMainColor(save.computer.mainColor);
    m_computer.setScore(save.computer.score);
    m_computer.setRemaining(StoneColor::White, save.computer.remainWhite);
    m_computer.setRemaining(StoneColor::Black, save.computer.remainBlack);
    m_computer.setRemaining(StoneColor::Clear, save.computer.remainClear);
    m_computer.setRoundsWon(save.computer.roundsWon);

    return true;
}

SaveGame Tournament::buildSaveGame(const Round& round) const
{
    SaveGame save;
    save.human.mainColor = m_human.getMainColor();
    save.human.score = m_human.getScore();
    save.human.remainWhite = m_human.getRemaining(StoneColor::White);
    save.human.remainBlack = m_human.getRemaining(StoneColor::Black);
    save.human.remainClear = m_human.getRemaining(StoneColor::Clear);
    save.human.roundsWon = m_human.getRoundsWon();

    save.computer.mainColor = m_computer.getMainColor();
    save.computer.score = m_computer.getScore();
    save.computer.remainWhite = m_computer.getRemaining(StoneColor::White);
    save.computer.remainBlack = m_computer.getRemaining(StoneColor::Black);
    save.computer.remainClear = m_computer.getRemaining(StoneColor::Clear);
    save.computer.roundsWon = m_computer.getRoundsWon();

    save.board = round.getBoard();
    save.hasLastMove = round.hasLastMove();
    save.lastMove = round.hasLastMove() ? round.getLastMove() : PocketCoord(0, 0);
    save.nextPlayer = (round.getNextPlayerType() == PlayerType::Human) ? NextPlayerTag::Human : NextPlayerTag::Computer;

    return save;
}
