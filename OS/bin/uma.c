#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

typedef struct {
    int pid;
    int runTime;
    int waitTime;
    int priority;
    int turnaroundTime;
    int remainingTime; // for round robin
} Process;

// Function to calculate mean turnaround time
double meanTurnaroundTime(Process processes[], int n) {
    double totalTurnaroundTime = 0;
    for (int i = 0; i < n; i++) {
        totalTurnaroundTime += processes[i].turnaroundTime;
    }
    return totalTurnaroundTime / n;
}

// Function for first come first serve
void fcfs(Process processes[], int n){
    int currentTime = 0;
    for (int i = 0; i < n; i++) {
        processes[i].waitTime = currentTime;
        processes[i].turnaroundTime = currentTime + processes[i].runTime;
        currentTime += processes[i].runTime;
    }
}

// Function for shortest job first
void sjf(Process processes[], int n){
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (processes[j].runTime > processes[j + 1].runTime) {
                Process temp = processes[j];
                processes[j] = processes[j + 1];
                processes[j + 1] = temp;
            }
        }
    }

    int currentTime = 0;
    for (int i = 0; i < n; i++) {
        processes[i].waitTime = currentTime;
        processes[i].turnaroundTime = currentTime + processes[i].runTime;
        currentTime += processes[i].runTime;
    }
}

// Function for round robin scheduling
void rr(Process processes[], int n, int quantumTime) {
    int remainingTime[n];
    for (int i = 0; i < n; i++)
        remainingTime[i] = processes[i].runTime;

    int currentTime = 0;
    while (1) {
        int done = 1;
        for (int i = 0; i < n; i++) {
            if (remainingTime[i] > 0) {
                done = 0;
                int executeTime = (remainingTime[i] < quantumTime) ? remainingTime[i] : quantumTime;
                remainingTime[i] -= executeTime;
                currentTime += executeTime;
                if (remainingTime[i] == 0) {
                    processes[i].turnaroundTime = currentTime;
                }
            }
        }
        if (done == 1)
            break;
    }
}

// Function for priority scheduling
void ps(Process processes[], int n){
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (processes[j].priority > processes[j + 1].priority) {
                Process temp = processes[j];
                processes[j] = processes[j + 1];
                processes[j + 1] = temp;
            }
        }
    }

    int currentTime = 0;
    for (int i = 0; i < n; i++) {
        processes[i].waitTime = currentTime;
        processes[i].turnaroundTime = currentTime + processes[i].runTime;
        currentTime += processes[i].runTime;
    }
}

int main(){
    int n, quantumTime;

    printf("Enter the number of processes: ");
    scanf("%d", &n);

    Process processes[n];

    for (int i = 0; i < n; i++) {
        printf("Enter run time and priority for process %d separated by a space: ", i + 1);
        scanf("%d %d", &processes[i].runTime, &processes[i].priority);
        processes[i].pid = i + 1;
        processes[i].remainingTime = processes[i].runTime; // Initialize remaining time for RR
    }

    printf("Enter time quantum for Round Robin: ");
    scanf("%d", &quantumTime);

    // FCFS process
    pid_t fcfs_pid = fork();
    if (fcfs_pid == -1) {
        perror("Error in forking FCFS process");
    }
    if (fcfs_pid == 0) {
        fcfs(processes, n);
        printf("Mean Turnaround Time (FCFS): %.2f\n", meanTurnaroundTime(processes, n));
        exit(0);
    }

    // SJF process
    pid_t sjf_pid = fork();
    if (sjf_pid == -1) {
        perror("Error in forking SJF process");
    } 
    if (sjf_pid == 0) {
        sjf(processes, n);
        printf("Mean Turnaround Time (SJF): %.2f\n", meanTurnaroundTime(processes, n));
        exit(0);
    }

    // RR process
    pid_t rr_pid = fork();
    if (rr_pid == -1) {
        perror("Error in forking RR process");
    } 
    if (rr_pid == 0) {
        rr(processes, n, quantumTime);
        printf("Mean Turnaround Time (RR): %.2f\n", meanTurnaroundTime(processes, n));
        exit(0);
    }
    
    // PS process
    pid_t ps_pid = fork();
    if (ps_pid == -1) {
        perror("Error in forking PS process");
    } 
    if (ps_pid == 0) {
        ps(processes, n);
        printf("Mean Turnaround Time (Priority Scheduling): %.2f\n", meanTurnaroundTime(processes, n));
        exit(0);
    }

    // Wait for all child processes to finish
    for (int i = 0; i < 4; i++) {
        wait(NULL);
    }

    return 0;
}