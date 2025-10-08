#pragma once
#include <iostream>
#include <iomanip>
#include <string>

namespace ui {

    // Toggle colors (set false if your terminal doesn't like ANSI)
    inline constexpr bool USE_COLOR = true;

    // ANSI codes
    inline const char* RESET  = "\x1b[0m";
    inline const char* DIM    = "\x1b[2m";
    inline const char* BOLD   = "\x1b[1m";
    inline const char* CYAN   = "\x1b[36m";
    inline const char* GREEN  = "\x1b[32m";
    inline const char* YELLOW = "\x1b[33m";

    inline const char* c(const char* code) { return USE_COLOR ? code : ""; }

    // ASCII separators (avoid multi-byte Unicode in 'char' literals)
    inline void hr(const char* ch = "-", int w = 60) {
        for (int i = 0; i < w; ++i) std::cout << ch;
        std::cout << "\n";
    }

    inline void banner(const std::string& title, const char* ch = "=", int w = 60) {
        hr(ch, w);
        std::cout << c(BOLD) << title << c(RESET) << "\n";
        hr(ch, w);
    }

    inline void section(const std::string& title) {
        std::cout << "\n" << c(CYAN) << "> " << title << c(RESET) << "\n";
    }

    // Fixed-width number cell, covered -> "–" (ASCII dash)
    inline void cell(int i, bool covered, bool isAdv = false) {
        using std::setw;
        if (covered) {
            std::cout << c(DIM) << setw(2) << "-" << c(RESET) << ' ';
        } else if (isAdv) {
            std::cout << c(YELLOW) << c(BOLD) << setw(2) << i << c(RESET) << ' ';
        } else {
            std::cout << setw(2) << i << ' ';
        }
    }

} // namespace ui
