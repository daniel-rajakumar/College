#include <iostream>
#include <string>
#include <limits>
#include "Constants.h"
#include "Tournament.h"
#include "Serializer.h"
#include "BoardView.h"

// PSEUDOCODE (Client):
// 1) Show main menu (new tournament / load / quit)
// 2) If load: read filename, load SaveGame, run tournament from that state
// 3) If new: set up new tournament (names, coin toss, color choice), run
// 4) During a round: display board, ask user for move or help or save/quit
// 5) After round ends: announce winner, ask if another round

static void clearInputLine()
{
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
}

static int readIntInRange(const std::string& prompt, int minVal, int maxVal)
{
    while (true)
    {
        std::cout << prompt;
        int value = 0;
        if (std::cin >> value && value >= minVal && value <= maxVal)
        {
            clearInputLine();
            return value;
        }
        clearInputLine();
        std::cout << "Invalid input. Enter a number from " << minVal << " to " << maxVal << ".\n";
    }
}

static std::string readLine(const std::string& prompt)
{
    std::cout << prompt;
    std::string s;
    std::getline(std::cin, s);
    if (s.empty())
    {
        // If previous >> left newline, try again
        std::getline(std::cin, s);
    }
    return s;
}

static StoneColor readStoneChoice()
{
    while (true)
    {
        std::cout << "Choose stone to place: (W)hite, (B)lack, (C)lear: ";
        char ch = '\0';
        if (std::cin >> ch)
        {
            clearInputLine();
            ch = static_cast<char>(std::toupper(static_cast<unsigned char>(ch)));
            if (ch == 'W') return StoneColor::White;
            if (ch == 'B') return StoneColor::Black;
            if (ch == 'C') return StoneColor::Clear;
        }
        clearInputLine();
        std::cout << "Invalid choice.\n";
    }
}

static void showPlayerStatus(const Player& human, const Player& computer)
{
    std::cout << "\n--- STATUS ---\n";
    std::cout << human.getName() << " (" << stoneColorToString(human.getMainColor()) << ") "
        << "Score=" << human.getScore()
        << " Remain[W=" << human.getRemaining(StoneColor::White)
        << ", B=" << human.getRemaining(StoneColor::Black)
        << ", C=" << human.getRemaining(StoneColor::Clear) << "] "
        << "RoundsWon=" << human.getRoundsWon() << "\n";

    std::cout << computer.getName() << " (" << stoneColorToString(computer.getMainColor()) << ") "
        << "Score=" << computer.getScore()
        << " Remain[W=" << computer.getRemaining(StoneColor::White)
        << ", B=" << computer.getRemaining(StoneColor::Black)
        << ", C=" << computer.getRemaining(StoneColor::Clear) << "] "
        << "RoundsWon=" << computer.getRoundsWon() << "\n";
}

static void runRoundInteractive(Tournament& tournament, Round& round)
{
    BoardView view;

    while (!round.isComplete())
    {
        std::cout << "\n========================================\n";
        showPlayerStatus(tournament.getHuman(), tournament.getComputer());
        std::cout << "Next Player: " << (round.getNextPlayerType() == PlayerType::Human ? "Human" : "Computer") << "\n";
        std::cout << "Last Move: " << (round.hasLastMove() ? round.getLastMove().toString() : std::string("None")) << "\n\n";

        view.printBoard(round.getBoard());

        // Offer suspend each turn (rubric)
        std::cout << "\nOptions: [M]ove  [H]elp  [S]ave+Quit\n";
        std::cout << "Choose option: ";
        char opt = '\0';
        if (!(std::cin >> opt))
        {
            clearInputLine();
            continue;
        }
        clearInputLine();
        opt = static_cast<char>(std::toupper(static_cast<unsigned char>(opt)));

        if (opt == 'S')
        {
            std::string fname = readLine("Enter filename to save (e.g., saves/mygame.txt): ");
            SaveGame save = tournament.buildSaveGame(round);
            if (Serializer::saveToFile(fname, save))
            {
                std::cout << "Saved. Exiting now.\n";
                std::exit(0);
            }
            std::cout << "Save failed.\n";
            continue;
        }
        else if (opt == 'H')
        {
            // Help = computer suggests best human move (no I/O in model)
            const Move suggestion = tournament.getComputer().suggestBestMoveForHuman(round, tournament);
            if (!suggestion.isValid())
            {
                std::cout << "No legal move suggestion available.\n";
            }
            else
            {
                std::cout << "Suggested move: " << suggestion.toString()
                    << " (strategy: maximize immediate points, then reduce opponent next-turn options)\n";
            }
            continue;
        }

        // Normal move progression
        if (round.getNextPlayerType() == PlayerType::Computer)
        {
            Move mv = tournament.getComputer().chooseMove(round, tournament);
            std::cout << "Computer plays: " << mv.toString() << "\n";
            round.applyMoveOrFail(mv, tournament.getHuman(), tournament.getComputer());
        }
        else
        {
            // Human move input
            std::cout << "\nHuman move:\n";
            const StoneColor chosen = readStoneChoice();
            const int row = readIntInRange("Row (0-10): ", 0, Constants::BOARD_SIZE - 1);
            const int col = readIntInRange("Col (0-10): ", 0, Constants::BOARD_SIZE - 1);

            Move mv(PocketCoord(row, col), chosen);
            if (!round.applyMoveOrFail(mv, tournament.getHuman(), tournament.getComputer()))
            {
                std::cout << "Illegal move. Must follow row/col rule and pocket must be empty/valid and you must have that stone.\n";
            }
        }
    }

    std::cout << "\n===== ROUND COMPLETE =====\n";
    view.printBoard(round.getBoard());
    const RoundResult result = round.getResult(tournament.getHuman(), tournament.getComputer());

    if (result == RoundResult::HumanWin)
        std::cout << tournament.getHuman().getName() << " wins the round!\n";
    else if (result == RoundResult::ComputerWin)
        std::cout << tournament.getComputer().getName() << " wins the round!\n";
    else
        std::cout << "Round ends in a tie.\n";
}

int main()
{
    Tournament tournament;

    while (true)
    {
        std::cout << "\n=== 3 Stones Tournament ===\n";
        std::cout << "1) New tournament\n";
        std::cout << "2) Load suspended game\n";
        std::cout << "3) Quit\n";

        const int choice = readIntInRange("Choose: ", 1, 3);
        if (choice == 3) return 0;

        if (choice == 2)
        {
            std::string fname = readLine("Enter filename to load (e.g., saves/general.txt): ");
            SaveGame save;
            if (!Serializer::loadFromFile(fname, save))
            {
                std::cout << "Load failed.\n";
                continue;
            }
            if (!tournament.restoreFromSaveGame(save))
            {
                std::cout << "Save file contents invalid.\n";
                continue;
            }

            Round round;
            if (!round.restoreFromSaveGame(save, tournament.getHuman(), tournament.getComputer()))
            {
                std::cout << "Failed to restore round state.\n";
                continue;
            }
            runRoundInteractive(tournament, round);
        }
        else
        {
            // New tournament setup
            std::string humanName = readLine("Enter your name: ");
            tournament.initializeNewTournament(humanName, "Computer");

            // Coin toss caller
            std::cout << "Coin toss: call Heads(1) or Tails(2)\n";
            int call = readIntInRange("Call: ", 1, 2);
            tournament.performCoinToss(static_cast<CoinSide>(call));

            // Winner chooses color
            std::cout << "Winner chooses main color: White(1) or Black(2)\n";
            int col = readIntInRange("Choose: ", 1, 2);
            tournament.assignColors(static_cast<StoneColor>(col == 1 ? StoneColor::White : StoneColor::Black));

            // Start round (black plays first)
            Round round;
            round.startNewRound(tournament.getHuman(), tournament.getComputer());
            runRoundInteractive(tournament, round);

            tournament.updateRoundsWonFromRound(round);

            std::cout << "\nPlay another round? Yes(1) No(2)\n";
            int again = readIntInRange("Choose: ", 1, 2);
            if (again == 2)
            {
                std::cout << "\n=== TOURNAMENT OVER ===\n";
                tournament.printTournamentWinner();
                return 0;
            }
        }
    }
}
