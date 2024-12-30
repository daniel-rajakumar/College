#include <iostream>
#include <chrono>

using namespace std;
using namespace chrono;

const int NUM = 2'000'000'000;
auto timer_start = high_resolution_clock::now();
auto timer_end = high_resolution_clock::now();

int main() {
    
    // (int) add
    int num = 0;
    timer_start = high_resolution_clock::now();
    for (int i = 0; i < NUM; i++) {
        num = num + 1;
    }
    timer_end = high_resolution_clock::now();
    auto timer_result = duration_cast<milliseconds>(timer_end - timer_start).count();
    cout << "(int) add: " << timer_result << " ms" << endl;
    
    
    // (int) mult
    num = 2;
    timer_start = high_resolution_clock::now();
    for (int i = 0; i < NUM; i++) {
        num = num * 2;
    }
    timer_end = high_resolution_clock::now();
    timer_result = duration_cast<milliseconds>(timer_end - timer_start).count();
    cout << "(int) mult: " << timer_result << " ms" << endl;
    
  
     // (float) add
    float numf = 0.0f;
    timer_start = high_resolution_clock::now();
    for (int i = 0; i < NUM; i++) {
        numf = numf + 0.9f;
    }
    timer_end = high_resolution_clock::now();
    timer_result = duration_cast<milliseconds>(timer_end - timer_start).count();
    cout << "(float) add: " << timer_result << " ms" << endl;
    
    
    // (float) mult
    numf = 1.1f;
    timer_start = high_resolution_clock::now();
    for (int i = 0; i < NUM; i++) {
        numf = numf * 1.1f;
    }
    timer_end = high_resolution_clock::now();
    timer_result = duration_cast<milliseconds>(timer_end - timer_start).count();
    cout << "(float) mult: " << timer_result << " ms" << endl;
    
    
    return 0;

}

 