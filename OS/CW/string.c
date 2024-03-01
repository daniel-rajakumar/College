#include <stdio.h>
#include <unistd.h>
#include <sys/types.h> 

int main(){
  char greeting[] = "Hello, World!";

  printf("%s\n", greeting);

  return 0;
}