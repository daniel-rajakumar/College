//
//		Implementation of the symbol table class.  This is the format I want for commenting functions.
//
#include "stdafx.h"
#include "SymTab.h"

/*
NAME

    AddSymbol - adds a new symbol to the symbol table.

SYNOPSIS

    void AddSymbol( char *a_symbol, int a_loc );

DESCRIPTION

    This function will place the symbol "a_symbol" and its location "a_loc"
    in the symbol table.
*/
void 
SymbolTable::AddSymbol( string &a_symbol, int a_loc )
{
    // If the symbol is already in the symbol table, record it as multiply defined.
	map<string, int>::iterator st = m_symbolTable.find( a_symbol );
    if( st != m_symbolTable.end() ) {

        st->second = multiplyDefinedSymbol;
        return;
    }
    // Record a the  location in the symbol table.
    m_symbolTable[a_symbol] = a_loc;
}

void
SymbolTable::DisplaySymbolTable()
{
	// Display the symbol table.
	cout << "Symbol Table: " << endl;
	cout << "Symbol #" << "\t" << "Symbol" << "\t\t" << "Location" << endl;
    int symbolIndex = 0;
    for (map<string, int>::iterator it = m_symbolTable.begin(); it != m_symbolTable.end(); ++it) {
        cout << symbolIndex++ << "\t\t" << it->first << "\t\t" << it->second << endl;
    }
}

bool 
SymbolTable::LookupSymbol(string &symbol, int &address) {
    auto it = m_symbolTable.find(symbol);
    if (it != m_symbolTable.end()) {
        address = it->second;
        return true;
    }
    return false;
}