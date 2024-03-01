#include <stdio.h>
#include <unistd.h>
#include <sys/types.h> 

int main(){
  pid_t pid;

  pid = fork();
  pid = fork();
  pid = fork();
 


  if (pid < 0){
    perror("Error creating process\n");
  } else if (pid == 0){
    printf("Child process\n");
  } else {
    printf("Parent process\n");
  }




  return 0;
}

