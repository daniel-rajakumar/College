/*
 * Daniel Rajakumar
 * Software Design Term Project ~ Fall 2024
 * Due on Mon, Dec 23rd 2024 (9:00 am)
 */
#include "stdafx.h"     // This must be present if you use precompiled headers which you will use. 
#include <stdio.h>

#include "Assembler.h"

void PressEnterToContinue() {
    cout << "____________________________________________" << endl << endl << endl;
    cout << "Press Enter to continue...";
    cin.ignore((numeric_limits<streamsize>::max)(), '\n');
    cout << endl;
}

int main( int argc, char *argv[] )
{
    for (int i = 0; i < 10; ++i) cout << endl;
    Assembler assem( argc, argv );

    // Establish the location of the labels:
    assem.PassI( );

    // Display the symbol table.
    assem.DisplaySymbolTable();

    PressEnterToContinue();

    // Output the symbol table and the translation.
    assem.PassII( );

    PressEnterToContinue();

    if (Errors::WasThereErrors()) { Errors::DisplayErrors(); exit(0); }
    // Run the emulator on the Quack3200 program that was generated in Pass II.
    assem.RunProgramInEmulator();

    if (Errors::WasThereErrors()) { Errors::DisplayErrors(); exit(0); }
   
    // Terminate indicating all is well.  If there is an unrecoverable error, the 
    // program will terminate at the point that it occurred with an exit(1) call.
    for (int i = 0; i < 10; ++i) cout << endl;
    return 0;
}

