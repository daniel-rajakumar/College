#pragma once
/**
 * @file TextUI.h
 * @brief Small terminal UI helpers (color codes, banners, and cell rendering).
 */
#include <iostream>
#include <iomanip>
#include <string>

namespace ui {

    /**
     * @brief Toggle whether ANSI colors should be emitted.
     * Set to false when running in environments that do not support ANSI sequences.
     */
    inline constexpr bool USE_COLOR = true;

    // ANSI codes
    inline const char* RESET  = "\x1b[0m"; /**< Reset formatting */
    inline const char* DIM    = "\x1b[2m"; /**< Dim / faint */
    inline const char* BOLD   = "\x1b[1m"; /**< Bold text */
    inline const char* CYAN   = "\x1b[36m"; /**< Cyan */
    inline const char* GREEN  = "\x1b[32m"; /**< Green */
    inline const char* YELLOW = "\x1b[33m"; /**< Yellow */

    /**
     * @brief Returns the given ANSI code if colors are enabled, otherwise an empty string.
     * @param code ANSI escape code to use when colors are enabled
     * @return The code or an empty string
     */
    inline const char* c(const char* code) { return USE_COLOR ? code : ""; }

    /**
     * @brief Print a horizontal rule of width w using the character ch.
     * @param ch Character to print (default '-')
     * @param w Width of the ruler in characters
     */
    inline void hr(const char* ch = "-", int w = 60) {
        for (int i = 0; i < w; ++i) std::cout << ch;
        std::cout << "\n";
    }

    /**
     * @brief Print a banner with a title framed by horizontal rules.
     * @param title Title text to print
     * @param ch Character used for framing
     * @param w Width of the banner
     */
    inline void banner(const std::string& title, const char* ch = "=", int w = 60) {
        hr(ch, w);
        std::cout << c(BOLD) << title << c(RESET) << "\n";
        hr(ch, w);
    }

    /**
     * @brief Print a section header in cyan color.
     * @param title Section title
     */
    inline void section(const std::string& title) {
        std::cout << "\n" << c(CYAN) << "> " << title << c(RESET) << "\n";
    }

    /**
     * @brief Render a fixed-width cell for a board number.
     * @param i The number to render
     * @param covered True when the square is covered (renders a dash)
     * @param isAdv True when the square is the advantage square (renders highlighted)
     */
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
