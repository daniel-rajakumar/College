//
// Created by Daniel Rajakumar on 2/10/25.
//

#include "../Header Files/Tournament.h"
#include "../Header Files/Board.h"
#include "../Header Files/Computer.h"
#include "../Header Files/Human.h"
#include "../Header Files/Round.h"

#include <iostream>
#include <ostream>
using namespace std;

void Tournament::start() {
    int numOfSquares = 0;
    char playAgain = ' ';
    cout << "Enter Number of Squares: ";
    cin >> numOfSquares;

    do {
        Board humanBoard(numOfSquares);
        Board computerBoard(numOfSquares);

        Human human(humanBoard);
        Computer computer(computerBoard);

        Round round(human, computer);
        round.play();

        // Ask the human player if they want to play another round
        cout << "Do you want to play another round? (y/n): ";
        cin >> playAgain;
    } while (playAgain == 'y' || playAgain == 'Y');
}
