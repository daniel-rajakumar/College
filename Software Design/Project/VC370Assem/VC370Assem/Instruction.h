//
// Class to parse and provide information about instructions.  Note: you will be adding more functionality.
//
#pragma once
#include <sstream>
#include <algorithm>
#include <iomanip>
#include <set>
#include <iostream>
#include "Errors.h"
using namespace std;

// The elements of an instruction.
class Instruction {

public:

    Instruction( ) { };
    ~Instruction( ) { };

    // Codes to indicate the type of instruction we are processing.  Why is this inside the
    // class?
    enum InstructionType {
        ST_MachineLanguage, 		// A machine language instruction.
        ST_AssemblerInstr,  		// Assembler Language instruction.
        ST_Comment,          		// Comment or blank line
        ST_End                   	// end instruction.
    };
    // Parse the Instruction.  VICVIC
    InstructionType ParseInstruction(string a_buff) {
        // clear previous values
		m_Label.clear();
		m_OpCode.clear();
		m_Operand.clear();
		m_NumOpCode = 0;
		m_IsNumericOperand = false;
		m_OperandNumValue = 0;


	    // Remove leading and trailing whitespace.
		a_buff = RemoveComment(a_buff);

        // Handle blank lines or comments.
		if (a_buff.empty() || a_buff[0] == ';') {
			m_type = ST_Comment;
			return m_type;
		}

		ParseLine(a_buff, m_Label, m_OpCode, m_Operand);


		// Convert opcode to uppercase for uniformity.
		transform(m_OpCode.begin(), m_OpCode.end(), m_OpCode.begin(), ::toupper);


	   // Determine the instruction type.
		if (m_OpCode == "END") {
			m_type = ST_End;
		} else if (m_OpCode == "ADD" 
				|| m_OpCode == "SUB" 
				|| m_OpCode == "MULT" 
				|| m_OpCode == "DIV" 
				|| m_OpCode == "LOAD" 
				|| m_OpCode == "STORE" 
				|| m_OpCode == "READ"
				|| m_OpCode == "WRITE"
				|| m_OpCode == "B"
				|| m_OpCode == "BM"
				|| m_OpCode == "BZ"
				|| m_OpCode == "BP"
				|| m_OpCode == "HALT") {
			m_type = ST_MachineLanguage;
			m_NumOpCode = OpcodeToNumber(m_OpCode);
		} else if (m_OpCode == "ORG" 
				|| m_OpCode == "DC" 
				|| m_OpCode == "DS") {
			m_type = ST_AssemblerInstr;
		} else {
			Errors::RecordError("[Instruction Type] Invalid opcode: " + m_OpCode);
			m_type = ST_Comment;
		}

		 // Check if the operand is numeric.
		if (!m_Operand.empty() && isdigit(m_Operand[0])) {
			m_IsNumericOperand = true;
			m_OperandNumValue = stoi(m_Operand);
		}

		return m_type;
    }

	// Helper function to map opcodes to numeric values.
	int OpcodeToNumber(const string &opcode) {
		static map<string, int> opcodeMap = {
			{"ADD", 1}, 
			{"SUB", 2}, 
			{"MULT", 3}, 
			{"DIV", 4},
			{"LOAD", 5}, 
			{"STORE", 6}, 
			{"READ", 7}, 
			{"WRITE", 8}, 
			{"B", 9}, 
			{"BM", 10}, 
			{"BZ", 11}, 
			{"BP", 12}, 
			{"HALT", 13}
		};
		return opcodeMap[opcode];
	}

	string RemoveComment(string line) {
    size_t pos = line.find(';');
    if (pos == string::npos)
    {
        return line;
    }
    return line.erase(pos);  // Note: erase changed line also.  That is why it was passed by value.
}

	// Will parse a line into label, op code, and operand.
	bool ParseLine(const string& line, string& label, string& opcode, string& operand)
	{
		istringstream ins(line);
		label = opcode = operand =  "";
		if (line.empty()) return true;

		string extra;

		if (line[0] != ' ' && line[0] != '\t')
		{
			ins >> label;
		}
		ins >> opcode >> operand >> extra;

		return extra == "";
	}


    // Compute the location of the next instruction.
    int LocationNextInstruction(int a_loc) {
		if (m_OpCode == "DS" || m_OpCode == "ORG") {
			return a_loc + m_OperandNumValue;
		}
		return a_loc + 1;
	}

    // To access the label
    string &GetLabel( ) {

        return m_Label;
    };
    // To determine if a label is blank.
    bool isLabel( ) {

        return ! m_Label.empty();
    };

	string& GetOpCode() {
		return m_OpCode;
	};

	string& GetOperand() {
		return m_Operand;
	};

	bool isNumericOperand() {
		return m_IsNumericOperand;
	};

	int GetOperandValue() {
		return m_OperandNumValue;
	};

	int GetNumOpCode() {
		return m_NumOpCode;
	};

	InstructionType GetType() {
		return m_type;
	};

	// To generate the machine code equivalent of the instruction
	string GenerateMachineCode(SymbolTable symbolTable) {
		switch (m_type) {
			case ST_MachineLanguage: {
				int opcode = m_NumOpCode;
				int operandAddress = m_IsNumericOperand ? m_OperandNumValue : 0;
				symbolTable.LookupSymbol(m_Operand, operandAddress);
				string a = to_string(opcode * 10);
				string b = to_string(operandAddress);
				return string(3 - a.length(), '0') + a 
					 + string(3 - b.length(), '0') + b;
			}
			case ST_AssemblerInstr:
				if (m_OpCode == "DS") return ""; // Reserve space.
				if (m_OpCode == "ORG") return ""; // Set location.
				if (m_OpCode == "DC") {
					string a = "";
					string b = to_string(m_OperandNumValue);
					return  string(3 - a.length(), '0') + a 
						  + string(3 - b.length(), '0') + b;
				}
				break;
			case ST_Comment:
				return ""; // No translation.
			default:
				Errors::RecordError("[Generating Machine Code] Unknown instruction type.");
				return "";
		}
		return "";
	}



private:

	void GetLabelOpcodeEtc( const string &a_buff);


    // The elemements of a instruction
    string m_Label;         // The label.
    string m_OpCode;        // The symbolic op code.
   string m_Operand;       // The operand.


    string m_instruction;   // The original instruction.

    // Derived values.
    int m_NumOpCode;        // The numerical value of the op code.  Only applicable for machine language instructions.
    InstructionType m_type; // The type of instruction.

    bool m_IsNumericOperand;// == true if the operand is numeric.
    int m_OperandNumValue;  // The value of the operand if it is numeric.
};

