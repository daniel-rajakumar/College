#include "Serializer.h"
#include "Constants.h"
#include <fstream>
#include <sstream>
#include <cctype>

static bool parseColorToken(const std::string& tok, StoneColor& out)
{
    if (tok == "WHITE") { out = StoneColor::White; return true; }
    if (tok == "BLACK") { out = StoneColor::Black; return true; }
    return false;
}

static std::string colorToToken(StoneColor c)
{
    return (c == StoneColor::Black) ? "BLACK" : "WHITE";
}

static bool parseNextPlayer(const std::string& tok, NextPlayerTag& out)
{
    if (tok == "Human") { out = NextPlayerTag::Human; return true; }
    if (tok == "Computer") { out = NextPlayerTag::Computer; return true; }
    return false;
}

static std::string nextPlayerToToken(NextPlayerTag t)
{
    return (t == NextPlayerTag::Computer) ? "Computer" : "Human";
}

bool Serializer::loadFromFile(const std::string& filename, SaveGame& outSave)
{
    std::ifstream fin(filename);
    if (!fin) return false;

    std::string line;

    // Human Player: WHITE 0 15 15 6 0
    if (!std::getline(fin, line)) return false;
    {
        std::istringstream iss(line);
        std::string a, b;
        iss >> a >> b; // "Human" "Player:"
        if (a != "Human") return false;

        std::string colorTok;
        iss >> colorTok;
        if (!parseColorToken(colorTok, outSave.human.mainColor)) return false;

        if (!(iss >> outSave.human.score >> outSave.human.remainWhite >> outSave.human.remainBlack >> outSave.human.remainClear >> outSave.human.roundsWon))
            return false;
    }

    // Computer Player: BLACK ...
    if (!std::getline(fin, line)) return false;
    {
        std::istringstream iss(line);
        std::string a, b;
        iss >> a >> b; // "Computer" "Player:"
        if (a != "Computer") return false;

        std::string colorTok;
        iss >> colorTok;
        if (!parseColorToken(colorTok, outSave.computer.mainColor)) return false;

        if (!(iss >> outSave.computer.score >> outSave.computer.remainWhite >> outSave.computer.remainBlack >> outSave.computer.remainClear >> outSave.computer.roundsWon))
            return false;
    }

    // Next Player: Human r c
    if (!std::getline(fin, line)) return false;
    {
        std::istringstream iss(line);
        std::string a, b;
        iss >> a >> b; // "Next" "Player:"
        if (a != "Next") return false;

        std::string npTok;
        int r = 0, c = 0;
        iss >> npTok >> r >> c;
        if (!parseNextPlayer(npTok, outSave.nextPlayer)) return false;

        outSave.hasLastMove = !(r == 0 && c == 0);
        outSave.lastMove = PocketCoord(r, c);

    }

    // Board:
    if (!std::getline(fin, line)) return false;
    if (line.find("Board:") == std::string::npos) return false;

    // Read 11 lines. Each line has pockets represented by W/B/C/O; spaces mean no pocket.
    Board board;
    board.clearBoard();

    for (int r = 0; r < Constants::BOARD_SIZE; ++r)
    {
        if (!std::getline(fin, line)) return false;

        int colIndex = 0;
        for (char ch : line)
        {
            if (ch == Constants::CHAR_WHITE || ch == Constants::CHAR_BLACK || ch == Constants::CHAR_CLEAR || ch == Constants::CHAR_EMPTY)
            {
                // Advance to next valid pocket in this row
                // Find next valid pocket column starting at colIndex
                while (colIndex < Constants::BOARD_SIZE && !board.isValidPocket(PocketCoord(r, colIndex)))
                    ++colIndex;

                if (colIndex >= Constants::BOARD_SIZE) break;

                if (ch == Constants::CHAR_EMPTY)
                {
                    // leave empty
                }
                else
                {
                    StoneColor s = StoneColor::Empty;
                    if (ch == Constants::CHAR_WHITE) s = StoneColor::White;
                    else if (ch == Constants::CHAR_BLACK) s = StoneColor::Black;
                    else if (ch == Constants::CHAR_CLEAR) s = StoneColor::Clear;

                    board.placeStone(PocketCoord(r, colIndex), s);
                }

                ++colIndex;
            }
        }
    }

    outSave.board = board;
    return true;
}

bool Serializer::saveToFile(const std::string& filename, const SaveGame& save)
{
    std::ofstream fout(filename);
    if (!fout) return false;

    fout << "Human Player: " << colorToToken(save.human.mainColor) << " "
        << save.human.score << " "
        << save.human.remainWhite << " "
        << save.human.remainBlack << " "
        << save.human.remainClear << " "
        << save.human.roundsWon << "\n";

    fout << "Computer Player: " << colorToToken(save.computer.mainColor) << " "
        << save.computer.score << " "
        << save.computer.remainWhite << " "
        << save.computer.remainBlack << " "
        << save.computer.remainClear << " "
        << save.computer.roundsWon << "\n";

    // If no last move, write 0 0 (your samples always have values; we keep it consistent)
    const int lr = save.hasLastMove ? save.lastMove.getRow() : 0;
    const int lc = save.hasLastMove ? save.lastMove.getCol() : 0;

    fout << "Next Player: " << nextPlayerToToken(save.nextPlayer) << " " << lr << " " << lc << "\n";
    fout << "Board:\n";

    // Output 11 lines with spaces for invalid pockets
    for (int r = 0; r < Constants::BOARD_SIZE; ++r)
    {
        for (int c = 0; c < Constants::BOARD_SIZE; ++c)
        {
            PocketCoord pc(r, c);
            if (!save.board.isValidPocket(pc))
            {
                fout << "  ";
            }
            else
            {
                StoneColor s = save.board.getStone(pc);
                char ch = Constants::CHAR_EMPTY;
                if (s == StoneColor::White) ch = Constants::CHAR_WHITE;
                else if (s == StoneColor::Black) ch = Constants::CHAR_BLACK;
                else if (s == StoneColor::Clear) ch = Constants::CHAR_CLEAR;
                else ch = Constants::CHAR_EMPTY;

                fout << ch << " ";
            }
        }
        fout << "\n";
    }

    return true;
}
