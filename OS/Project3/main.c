#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

typedef struct {
    int process_id;
    int arrival_time;
    int burst_time;
    int priority; 
} Process;

int compare(const void *a, const void *b) {
    Process *process_a = (Process *) a;
    Process *process_b = (Process *) b;

    return process_a -> burst_time - process_b -> burst_time;
}

void first_come_first_serve(Process *p, int np) {
    for (int i = 0; i < np; i++) {
        int time = p[i].burst_time * 1000;
        usleep(time); 
        printf("[First Come First Serve] Process %d executed\n", p[i].process_id);
    }
}

void shortest_job_first(Process *p, int np) {
    qsort(p, np, sizeof(Process), compare);
    for (int i = 0; i < np; i++) {
        int time = p[i].burst_time * 1000;
        usleep(time);
        printf("[Shortest Job First] Process %d executed\n", p[i].process_id);
    }
}

void round_robin(Process *p, int np, int tq) {
    int remaining_burst_time[np];
    memset(remaining_burst_time, 0, sizeof(remaining_burst_time));
    
    for (int i = 0; i < np; i++) {
        remaining_burst_time[i] = p[i].burst_time;
    }

    int completed = 0;
    int current_time = 0;
    while (completed < np) {
        for (int i = 0; i < np; i++) {
            if (remaining_burst_time[i] > 0) {
                int execute_time = (remaining_burst_time[i] < tq) ? remaining_burst_time[i] : tq;
                int time = execute_time * 1000;
                usleep(time);
                printf("[Round Robin] Process %d executed\n", p[i].process_id);
                remaining_burst_time[i] -= execute_time;
                current_time += execute_time;

                if (remaining_burst_time[i] == 0) {
                    completed++;
                }
            }
        }
    }
}



void priority_scheduling(Process *p, int np) {
    for (int i = 0; i < np - 1; i++) {
        for (int j = i + 1; j < np; j++) {
            if (p[i].priority < p[j].priority) {
                Process temp = p[i];
                p[i] = p[j];
                p[j] = temp;
            }
        }
    }

    for (int i = 0; i < np; i++) {
        int time = p[i].burst_time * 1000;
        usleep(time); 
        printf("[Priority Scheduling] Process %d executed\n", p[i].process_id);
    }
}

int main() {
    Process processes[4] = { {1, 0, 6, 2}, {2, 2, 4, 1}, {4, 6, 8, 4}, {3, 4, 2, 3} };

    printf("First-Come, First-Served:\n");
    first_come_first_serve(processes, 4);

    printf("\nShortest Job First:\n");
    shortest_job_first(processes, 4);

    printf("\nRound Robin:\n");
    round_robin(processes, 4, 2);

    printf("\nPriority Scheduling:\n");
    priority_scheduling(processes, 4);

    return 0;
}
