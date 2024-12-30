//
//      Implementation of the Assembler class.
//
#include "stdafx.h"
#include "Assembler.h"
#include "Errors.h"
#include <iostream>
#include <limits>
#include <unordered_map>

vector<string> Errors::m_ErrorMsgs;
bool Errors::m_WasErrorMessages = false;

// Constructor for the assembler.  Note: we are passing argc and argv to the file access constructor.
// See main program.  
Assembler::Assembler( int argc, char *argv[] )
	: m_facc(argc, argv)
{
    // Nothing else to do here at this point.
}
// Destructor currently does nothing.  You might need to add something as you develope this project.
Assembler::~Assembler( )
{
}
// Pass I establishes the location of the labels.  You will write better function comments according to the coding standards.
void Assembler::PassI( ) 
{


    int loc = 0;        // Tracks the location of the instructions to be generated.

    // Successively process each line of source code.
    while( true ) {

        // Read the next line from the source file.
        string line; 
        if( ! m_facc.GetNextLine( line ) ) {
            // If there are no more lines, we are missing an end statement.
            // We will let this error be reported by Pass II.
            break;
        }
        // Parse the line and get the instruction type.
        Instruction::InstructionType st =  m_inst.ParseInstruction( line );

        // If this is an end statement, there is nothing left to do in pass I.
        // Pass II will determine if the end is the last statement.
        if( st == Instruction::ST_End ) break;

        // Labels can only be on machine language and assembler language
        // instructions.  So, skip other instruction types. We can do better/

        if( st != Instruction::ST_MachineLanguage && st != Instruction::ST_AssemblerInstr ) 
        {
        	continue;
		}
        // If the instruction has a label, record it and its location in the
        // symbol table.
        if( m_inst.isLabel( ) ) {
			if (m_symtab.LookupSymbol(m_inst.GetLabel(), loc)) {
				Errors::RecordError("[Adding Symbol] Error: Multiply defined label '" + m_inst.GetLabel() + "'.");
			} else {
				m_symtab.AddSymbol( m_inst.GetLabel( ), loc );
			}
        }

        // Compute the location of the next instruction.
        loc = m_inst.LocationNextInstruction( loc );
    }
    ErrorDection();

}

// Error Checking 
void Assembler::ErrorDection()
{
    int loc = 0;

    m_facc.rewind();

    unordered_map<string, int> labelDefinitions;

    while (true) {
        string line;
        if (!m_facc.GetNextLine(line)) {
            Errors::RecordError("[Parts] Missing END statement.");
            return;
        }

        Instruction::InstructionType st =  m_inst.ParseInstruction( line );

        if (st == Instruction::ST_End)  break; 
		if (st == Instruction::ST_Comment) continue;

		string label = m_inst.GetLabel();
		string operand = m_inst.GetOperand();
		string opcode = m_inst.GetOpCode();


		// Check for invalid label format.
		if (!operand.empty() && !m_inst.isNumericOperand()) {
			if (!m_symtab.LookupSymbol(operand, loc)) {
				Errors::RecordError("Undefined label: " + operand);
			}
		}

		// Check for invalid opcode.
		if (!IsValidOpcode(opcode)) {
			Errors::RecordError("Illegal opcode: " + opcode);
		}

        
		// Operand checks for specific opcodes.
		if (opcode == "READ" || opcode == "WRITE" || opcode == "LOAD" || opcode == "STORE") {
			if (operand.empty()) {
				Errors::RecordError("[Error Dec] Missing operand for " + opcode);
			}
		} else if (opcode == "DC" || opcode == "DS") {
			if (!m_inst.isNumericOperand()) {
				Errors::RecordError("[Error Dec] Non-numeric operand for " + opcode);
			}
		}

	   // Constant too large detection.
		if (opcode == "DC" && m_inst.isNumericOperand()) {
			int value = stoi(operand);
			if (value > SymbolTable::MAX_MEMORY) {
				Errors::RecordError("[Error Dec] Constant too large for VC370 memory: " + operand);
			}
		}

		// Insufficient memory detection.
		if (loc >= SymbolTable::MAX_MEMORY) {
			Errors::RecordError("[Error Dec] Insufficient memory for the translation at location " + to_string(loc));
		}

		// Check for invalid label format.
		if (!IsValidLabel(label)) {
			Errors::RecordError("[Error Dec] Invalid label format '" + label + "'.");
		}

        loc = m_inst.LocationNextInstruction( loc );
    }
}


bool Assembler::IsValidLabel(string& label) {
	set<string> reservedKeywords = {"ADD", "SUB", "MULT", "DIV", "LOAD", "STORE", "READ", "WRITE", "BRANCH", "HALT", "DS", "DC", "END"};

	if (label.empty()) return true;

    // Check if the label length is within acceptable bounds (e.g., 1-10 characters).
    if (label.length() > 10) {
        Errors::RecordError("[Label Val] length is invalid (must be less than or equal to 10 characters).");
        return false;
    }

    // Check if the label starts with an alphabetic character.
    if (!isalpha(label[0])) {
        Errors::RecordError("[Label Val] Label must start with an alphabetic character.");
        return false;
    }

    // Check if the label contains only alphanumeric characters.
    if (!all_of(label.begin(), label.end(), [](char c) { return isalnum(c); })) {
        Errors::RecordError("[Label Val] Label must contain only alphanumeric characters.");
        return false;
    }

    // Check if the label matches any reserved keywords or opcodes.
    if (reservedKeywords.find(label) != reservedKeywords.end()) {
        Errors::RecordError("[Lab Val] Label matches a reserved keyword or opcode.");
        return false;
    }

    return true;
}

bool Assembler::IsValidOpcode(string& opcode)
{
    vector<string> validOpcodes = {
        "ADD", "SUB", "MULT", "DIV",
        "LOAD", "STORE", "REEAD", "WRITE",
        "B", "BM", "BZ", "BP", "HALT",
        "ORG", "DC", "DS", "READ"
    };

    return find(validOpcodes.begin(), validOpcodes.end(), opcode) != validOpcodes.end();
}

void Assembler::PassII()
{
     int loc = 0; // Tracks the memory location of instructions.

    // Rewind the file to process it again.
     m_facc.rewind();

    cout << "Translation of Program:" << endl;
	cout << "Location" << "\t" << "Contents" << "\t" << "Original Statement" << endl;

    // Successively process each line of source code.
    while( true ) {

        // Read the next line from the source file.
        string line; 
        if( ! m_facc.GetNextLine( line ) ) {
            // If there are no more lines, we are missing an end statement.
            // We will let this error be reported by Pass II.
            break;
        }
        // Parse the line and get the instruction type.
        Instruction::InstructionType st =  m_inst.ParseInstruction( line );


        // If this is an end statement, there is nothing left to do in pass I.
        // Pass II will determine if the end is the last statement.
        if (st == Instruction::ST_End) {
	        cout << "\t\t" << "" << "\t\t" << line << endl;
            break;
        }


        // Labels can only be on machine language and assembler language
        // instructions.  So, skip other instruction types. We can do better/
        if( st != Instruction::ST_MachineLanguage && st != Instruction::ST_AssemblerInstr ) 
        {
	        cout << "\t\t" << "" << "\t\t" << line << endl;
        	continue;
		}

        // Compute the location of the next instruction.
		string contents = m_inst.GenerateMachineCode(m_symtab);
	    cout << loc << "\t\t" << contents << "\t\t" << line << endl;
		m_emul.insertMemory(loc, contents.empty() ? 0 : stoi(contents));
        loc = m_inst.LocationNextInstruction( loc );
    }


}


