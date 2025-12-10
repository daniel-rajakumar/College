#include <iostream>
#include "Header Files/Board.h"

int main() {
    using std::cout;

    // Test with board size = 9
    Board b9(9);
    cout << "Board size: " << b9.getSize() << "\n";
    cout << "Initially, canThrowOneDie() = " << (b9.canThrowOneDie() ? "true" : "false") << " (expected false)\n";

    // Cover squares 1..6 only
    for (int i = 1; i <= 6; ++i) b9.coverSquare(i);
    cout << "After covering 1..6, canThrowOneDie() = " << (b9.canThrowOneDie() ? "true" : "false") << " (expected false)\n";

    // Cover square 7..9
    for (int i = 7; i <= 9; ++i) b9.coverSquare(i);
    cout << "After covering 7..9, canThrowOneDie() = " << (b9.canThrowOneDie() ? "true" : "false") << " (expected true)\n";

    // Uncover one of 7..9 and test again
    b9.uncoverSquare(8);
    cout << "After uncovering 8, canThrowOneDie() = " << (b9.canThrowOneDie() ? "true" : "false") << " (expected false)\n";

    // Test with smaller board (size 6) - edge case: ONE_DIE_RULE_START is 7, so for board sizes <7, loop should not run and return true
    Board b6(6);
    cout << "\nBoard size: " << b6.getSize() << "\n";
    cout << "For board size < 7, canThrowOneDie() = " << (b6.canThrowOneDie() ? "true" : "false") << " (expected true)\n";

    return 0;
}

