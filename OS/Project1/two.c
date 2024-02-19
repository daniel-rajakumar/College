#include <stdio.h>
#include <sys/utsname.h>
#include <sys/resource.h>
#include <unistd.h>
#include <stdlib.h>

int main() {

    struct utsname unameData;
    struct rusage rusage;
    int sleepSeconds = 5 + rand() % 6; 

    for (int i = 0; i <= 10000; i++) 
        printf("%d\n", i);

    uname(&unameData);
    getrusage(RUSAGE_SELF, &rusage);
    printf("\nOperating System Version: %s\n", unameData.sysname);
    printf("Machine Name: %s\n", unameData.nodename);
    printf("Release Level: %s\n", unameData.release);
    printf("Version Level: %s\n", unameData.version);
    printf("Hardware Platform: %s\n", unameData.machine);
    printf("User time: %ld.%06ld\n", rusage.ru_utime.tv_sec, rusage.ru_utime.tv_usec);
    printf("System time: %ld.%06ld\n", rusage.ru_stime.tv_sec, rusage.ru_stime.tv_usec);

    return 0;
}
