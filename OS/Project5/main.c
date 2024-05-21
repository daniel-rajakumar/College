#include <stdio.h>
#include <stdbool.h>


bool isPagePresent(int pages[], int n, int page) {
    for (int i = 0; i < n; i++) 
        if (pages[i] == page) 
            return true;
    return false;
}

int findOptimalIndex(int pages[], int n, int frame[], int frameSize, int currentIndex) {
    int res = -1, farthest = currentIndex;
    
    for (int i = 0; i < frameSize; i++) {
        int j;
        for (j = currentIndex + 1; j < n; j++) {
            if (frame[i] == pages[j]) {
                if (j > farthest) {
                    farthest = j;
                    res = i;
                }
                break;
            }
        }
        if (j == n) return i;
    }
    return (res == -1) ? 0 : res;
}

int optimal(int pages[], int n, int capacity) {
    int pageFaults = 0;
    int frame[capacity];
    int frameSize = 0;

    for (int i = 0; i < n; i++) {
        if (!isPagePresent(frame, frameSize, pages[i])) {
            if (frameSize < capacity) {
                frame[frameSize++] = pages[i];
            } else {
                int j = findOptimalIndex(pages, n, frame, frameSize, i);
                frame[j] = pages[i];
            }
            pageFaults++;
        }
    }

    return pageFaults;
}








int fifo(int pages[], int n, int capacity) {
    int frame[capacity]; 
    bool isPresent[capacity]; 
    int fault = 0; 
    int front = 0; 

    for (int i = 0; i < capacity; i++) {
        frame[i] = -1;
        isPresent[i] = false; 
    }

    for (int i = 0; i < n; i++) {
        int page = pages[i];

        bool found = false;
        for (int j = 0; j < capacity; j++) {
            if (frame[j] == page) {
                found = true;
                break;
            }
        }

        if (!found) {
            int victim = frame[front];
            frame[front] = page;
            isPresent[front] = true;
            front = (front + 1) % capacity;
            ++fault;
        }
    }

    return fault;
}







int lru(int pages[], int n, int capacity) {
    int faults = 0;
    int frame[capacity];
    int counter[capacity];

    for (int i = 0; i < capacity; i++) {
        frame[i] = -1;
        counter[i] = 0;
    }

    for (int i = 0; i < n; i++) {
        int j;

        for (j = 0; j < capacity; j++) {
            if (frame[j] == pages[i]) {
                counter[j] = i;
                break;
            }
        }

        if (j == capacity) {
            int min = 0;

            for (int k = 1; k < capacity; k++) 
                if (counter[k] < counter[min]) 
                    min = k;

            frame[min] = pages[i];
            counter[min] = i;
            faults++;
        }
    }
    return faults;
}







int main() {
    int pages[] = {7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1};
    int n = sizeof(pages) / sizeof(pages[0]);
    int capacity = 3;

    printf("Optimal: %d\n", optimal(pages, n, capacity));
    printf("FIFO: %d\n", fifo(pages, n, capacity));
    printf("LRU: %d\n", lru(pages, n, capacity));

    return 0;
}
