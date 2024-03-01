#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main() {
    pid_t pid;

    pid = fork();

    if (pid < 0) { 
        fprintf(stderr, "Fork failed.\n");
        return 1;
    } 
    else if (pid == 0) { // Child process
        printf("This line is from the child process. \n", pid);
    } 
    else { // Parent process
        printf("This line is from the parent process. \n");
    }

    return 0;
}