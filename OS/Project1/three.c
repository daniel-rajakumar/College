#include <stdio.h>
#include <sys/utsname.h>
#include <sys/resource.h>
#include <unistd.h>
#include <stdlib.h>
#include <time.h>

int main() {
    struct rusage rusage;
    srand(time(NULL)); 
    int sleepSeconds = 5 + rand() % 6; 
 //   sleepSeconds = 0;

    getrusage(RUSAGE_SELF, &rusage);

    printf("[BEFORE]:\n");
    printf("User time: %ld.%06d\n", rusage.ru_utime.tv_sec, rusage.ru_utime.tv_usec);
    printf("System time: %ld.%06d\n", rusage.ru_stime.tv_sec, rusage.ru_stime.tv_usec);

    printf("\n%d seconds sleep...\n\n", sleepSeconds);

    sleep(sleepSeconds);
    // sleep(0)

    printf("[AFTER]\n");
    getrusage(RUSAGE_SELF, &rusage);
    printf("User time: %ld.%06d\n", rusage.ru_utime.tv_sec, rusage.ru_utime.tv_usec);
    printf("System time: %ld.%06d\n", rusage.ru_stime.tv_sec, rusage.ru_stime.tv_usec);

    // WHY?
    // The system time did not add up because while the program was sleeping, it was not using the CPU (executing any instructions) and therefore the system and user time was not incremented.
    return 0;
}
