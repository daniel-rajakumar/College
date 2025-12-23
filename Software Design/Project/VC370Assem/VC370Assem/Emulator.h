//
//		Emulator class - supports the emulation of VC370 programs
//
#ifndef _EMULATOR_H      // A previous way of preventing multiple inclusions.
#define _EMULATOR_H

#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <string>

class emulator {

public:

    const static int MEMSZ = 10'000;	// The size of the memory of the VC370.
    emulator() 
	{
        memset( m_memory, 0, MEMSZ * sizeof(int) );
        m_accum = 0;
		m_readCount = 0;
		m_writeCount = 0;
		m_readValues[0] = 0;
		m_readValues[1] = 0;
		m_friendlyDiff = false;
		m_friendlyFib = false;
		const char *env = std::getenv("ASSEM_FRIENDLY_IO");
		if (env && env[0] != '\0' && env[0] != '0') {
			m_friendlyIo = true;
			std::string mode(env);
			for (char &ch : mode) {
				ch = static_cast<char>(std::tolower(static_cast<unsigned char>(ch)));
			}
			m_friendlySum = (mode == "sum");
			m_friendlyFactorial = (mode == "factorial");
			m_friendlyDiff = (mode == "diff");
			m_friendlyFib = (mode == "fib" || mode == "fibonacci");
		} else {
			m_friendlyIo = false;
			m_friendlySum = false;
			m_friendlyFactorial = false;
			m_friendlyDiff = false;
			m_friendlyFib = false;
		}
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
		cout << "Start of emulation." << endl;
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
					if (m_friendlyIo) {
						if (m_friendlySum || m_friendlyDiff) {
							if (m_readCount == 0) cout << "input first number: ";
							else if (m_readCount == 1) cout << "input second number: ";
							else cout << "input value: ";
						} else if (m_friendlyFactorial || m_friendlyFib) {
							if (m_readCount == 0) cout << "input number: ";
							else cout << "input value: ";
						} else {
							cout << "input value: ";
						}
					} else {
						cout << "? ";
					}
					cin >> m_memory[address];
					if (m_readCount < 2) {
						m_readValues[m_readCount] = m_memory[address];
					}
					m_readCount++;
					break;

				case 8: // WRITE: Display value stored at memory address.
					if (m_friendlyIo) {
						if (m_friendlySum && m_readCount >= 2 && m_writeCount == 0) {
							cout << "the sum of " << m_readValues[0] << " + "
								 << m_readValues[1] << " is " << m_memory[address] << endl;
						} else if (m_friendlyDiff && m_readCount >= 2 && m_writeCount == 0) {
							cout << "the absolute difference of " << m_readValues[0] << " and "
								 << m_readValues[1] << " is " << m_memory[address] << endl;
						} else if (m_friendlyFactorial && m_readCount >= 1 && m_writeCount == 0) {
							cout << "the factorial of " << m_readValues[0] << " is "
								 << m_memory[address] << endl;
						} else if (m_friendlyFib && m_readCount >= 1 && m_writeCount == 0) {
							cout << "the fibonacci number of " << m_readValues[0] << " is "
								 << m_memory[address] << endl;
						} else {
							cout << "output: " << m_memory[address] << endl;
						}
					} else {
						cout << m_memory[address] << endl;
					}
					m_writeCount++;
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
	int m_readCount;
	int m_writeCount;
	int m_readValues[2];
	bool m_friendlyIo;
	bool m_friendlySum;
	bool m_friendlyFactorial;
	bool m_friendlyDiff;
	bool m_friendlyFib;
};

#endif
