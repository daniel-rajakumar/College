CXX := clang++
CXXFLAGS := -std=c++17 -Wall -Wextra -O2
SRC := $(wildcard *.cpp)
HDR := $(wildcard *.h)
BIN := assem

.PHONY: all run demo demo-sum demo-factorial demo-branch demo-fib clean

all: $(BIN)

$(BIN): $(SRC) $(HDR)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(BIN)

run: $(BIN)
	./$(BIN) program.asm

demo: $(BIN)
	./$(BIN) demo.asm

demo-sum: $(BIN)
	ASSEM_FRIENDLY_IO=sum ./$(BIN) demo_sum.asm

demo-factorial: $(BIN)
	ASSEM_FRIENDLY_IO=factorial ./$(BIN) demo_factorial.asm

demo-branch: $(BIN)
	ASSEM_FRIENDLY_IO=diff ./$(BIN) demo_branch.asm

demo-fib: $(BIN)
	ASSEM_FRIENDLY_IO=fibonacci ./$(BIN) demo_fib.asm

clean:
	rm -f $(BIN)
