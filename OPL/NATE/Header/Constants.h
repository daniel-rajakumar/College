#pragma once

class Constants
{
public:
    // constants
    static constexpr int BOARD_SIZE = 11;
    static constexpr int CENTER_ROW = 5;
    static constexpr int CENTER_COL = 5;

    static constexpr int START_WHITE = 15;
    static constexpr int START_BLACK = 15;
    static constexpr int START_CLEAR = 6;

    static constexpr char CHAR_WHITE = 'W';
    static constexpr char CHAR_BLACK = 'B';
    static constexpr char CHAR_CLEAR = 'C';
    static constexpr char CHAR_EMPTY = 'O';

private:
    Constants() = delete;
};
