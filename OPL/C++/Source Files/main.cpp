#include <iostream>

#include "../Header Files/Tournament.h"

using namespace std;
int main() {
    srand(static_cast<unsigned int>(time(0)));
    Tournament::start();
    return 0;
}
