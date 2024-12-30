
#include <iostream>
#include <cfenv>

using namespace std;


void TurnOnFloatingExceptions()
{
    unsigned int cw;

    cw = _control87(0, 0) & MCW_EM;
    cw &= ~(_EM_INVALID | _EM_ZERODIVIDE | _EM_OVERFLOW);
    _control87(cw, MCW_EM);

}

int main()
{
    TurnOnFloatingExceptions();
    
    // this throws the system level exceptions
    double x = 0.0;
    double dResult = 1 / x; // floating point exception for division by zero 
    double _dResult = x / x;  // floating point exception for division by zero by zero


}


// https://learn.microsoft.com/en-us/cpp/c-runtime-library/reference/control87-controlfp-control87-2?view=msvc-170