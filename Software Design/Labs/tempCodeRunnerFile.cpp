#include <iostream>

using namespace std;

long long fib(long long n) {
    // Base case: first two terms are 1
    if (n == 1 || n == 2) {
        return 1;
    }
    // Recursive case: sum of the two preceding terms
    return fib(n - 1) + fib(n - 2);
}

int main() {
    // Display the first 30 terms of the Fibonacci series
    for (long long i = 1; i <= 30; i++) {
        cout << "Fibonacci term " << i << " is: " << fib(i) << endl;
    }
    return 0;
}
