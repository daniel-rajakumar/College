void round_robin(Process *processes, int num_processes, int time_quantum) {
    int remaining_burst_time[num_processes];
    memset(remaining_burst_time, 0, sizeof(remaining_burst_time));
    
    int completed = 0;
    int current_time = 0;
    while (completed < num_processes) {
        for (int i = 0; i < num_processes; i++) {
            if (remaining_burst_time[i] > 0) {
                int execute_time = (remaining_burst_time[i] < time_quantum) ? remaining_burst_time[i] : time_quantum;
                usleep(execute_time * 1000); // Simulate CPU burst
                printf("Round Robin: Process %d executed\n", processes[i].process_id);
                remaining_burst_time[i] -= execute_time;
                
                if (remaining_burst_time[i] == 0) {
                    completed++;
                }
            }
        }
    }
}