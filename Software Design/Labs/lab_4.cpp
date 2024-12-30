#include <iostream>
#include <ctime> 

using namespace std;

class VTime {
    
private: int totalSeconds; 
private: int NUM_SEC_IN_HR = 3600;
private: int NUM_SEC_IN_MIN = 60;

public:
    VTime(int hour, int minute, int second) { 
        setTime(hour, minute, second); 
        
    }
    
    VTime() { setTime(0, 0, 0); }

    void setTime(int hour, int minute, int second) { totalSeconds = hour * NUM_SEC_IN_HR + minute * NUM_SEC_IN_MIN + second; }

    int getHr() const { return totalSeconds / NUM_SEC_IN_HR; }
    int getMin() const { return (totalSeconds % NUM_SEC_IN_HR) / NUM_SEC_IN_MIN; }
    int getSec() const { return totalSeconds % NUM_SEC_IN_MIN; }

   
    int operator-(const VTime &x) const {
        return totalSeconds - x.totalSeconds;
    }

    void setTimeToNow() {
        time_t currentTime = time(nullptr);
        tm *localTime = localtime(&currentTime);

        int hour = localTime->tm_hour;
        int minute = localTime->tm_min;
        int second = localTime->tm_sec;

        setTime(hour, minute, second);
    }

    void printTime() const {
        cout << (getHr() < 10 ? "0" : "") << getHr() << ":"
                  << (getMin() < 10 ? "0" : "") << getMin() << ":"
                  << (getSec() < 10 ? "0" : "") << getSec() << endl;
    }
};

int main() {
    VTime time1(14, 3, 0);  
    VTime time2(13, 15, 04);

    // Printing times
    cout << "[first 1] ";
    time1.printTime();

    cout << "[second 2] ";
    time2.printTime();

    cout << "[Difference in seconds] " << (time1 - time2) << endl;

    VTime currentTime;
    currentTime.setTimeToNow();
    cout << "[Current Time] ";
    currentTime.printTime();

    return 0;
}
