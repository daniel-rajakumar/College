#include <iostream>

using namespace std;

long long fib(long long n) {
    if (n == 1 || n == 2) return 1;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    
    for (long long i = 1; i <= 30; i++)
        cout  << "[" << i << "] " << fib(i) << endl;
    
    return 0;
}


// TWO MAIN REASONS
// TIME COMPLEXITY: Because recession has a time complexity of O(2^n) because each calls produces two (2) sub calls (n), resulting in poor performance. 
// MEMORY INEFFICIENT: Because recession stacks each calls in memory, this leads to larger memory usage. The larger the number n, the more space requires. This can eventually lead to stack overflow for deep recursions

