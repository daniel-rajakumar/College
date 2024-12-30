//
//		Emulator class - supports the emulation of VC370 programs
//
#ifndef _EMULATOR_H      // A previous way of preventing multiple inclusions.
#define _EMULATOR_H

class emulator {

public:

    const static int MEMSZ = 10'000;	// The size of the memory of the VC370.
    emulator() 
	{
        memset( m_memory, 0, MEMSZ * sizeof(int) );
        m_accum = 0;
    }
    // Records instructions and data into VC370 memory.
	bool insertMemory(int a_location, int a_contents)
	{
		if (a_location >= 0 && a_location < MEMSZ)
		{
			m_memory[a_location] = a_contents;
			return true;
		}
		else
		{
			Errors::RecordError("Grumble gumble - should not happen");
			return false;
		}
	}
    
    // Runs the VC370 program recorded in memory.
	bool runProgram()
	{
		cout << "Results from emulating program:" << endl;
		int loc = 100;
		while (true)
		{
			int contents = m_memory[loc];
			int opcode = contents / 10'000;
			int address = contents % 10'000;

			switch (opcode) {
				case 1: // ADD: Add value at address to accumulator.
					m_accum += m_memory[address];
					break;

				case 2: // SUBTRACT: Subtract value at address from accumulator.
					m_accum -= m_memory[address];
					break;

				case 3: // MULTIPLY: Multiply accumulator by value at address.
					m_accum *= m_memory[address];
					break;

				case 4: // DIVIDE: Divide accumulator by value at address.
					if (m_memory[address] == 0) {
						Errors::RecordError("[Emulation] Error: Division by zero at location " + to_string(loc));
						return false;
					}
					m_accum /= m_memory[address];
					break;

				case 5: // LOAD: Load value at address into accumulator.
					m_accum = m_memory[address];
					break;

				case 6: // STORE: Store accumulator value into memory at address.
					m_memory[address] = m_accum;
					break;

				case 7: // READ: Read input and store up to 6 digits into memory at address.
					cout << "? ";
					cin >> m_memory[address];
					break;

				case 8: // WRITE: Display value stored at memory address.
					cout << m_memory[address] << endl;
					break;

				case 9: // BRANCH: Unconditional branch to address.
					loc = address;
					continue;

				case 10: // BRANCH MINUS: Branch if accumulator < 0.
					loc = (m_accum < 0) ? address : loc + 1;
					continue;

				case 11: // BRANCH ZERO: Branch if accumulator == 0.
					loc = (m_accum == 0) ? address : loc + 1;
					continue;

				case 12: // BRANCH POSITIVE: Branch if accumulator > 0.
					loc = (m_accum > 0) ? address : loc + 1;
					continue;

				case 13: // HALT: Terminate program execution.

					cout << "End of emulation." << endl;
					return true;

				default: // Illegal opcode.
					Errors::RecordError("[Emulation] Illegal opcode at location " + to_string(loc) + " : " + to_string(opcode));
					return false;
			}

			loc++;  // Move to the next instruction.
		}

	}

private:

    int m_memory[MEMSZ];    // The memory of the VC370.  Would have to make it
    						// a vector if it was much larger.
    int m_accum;		    	// The accumulator for the VC370
};

#endif
