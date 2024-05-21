#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void compute_fibonacci(int number, int write_file_descriptor) {
  int a = 1, b = 2;
  int temp;

  for (int i = 0; i < number; i++) {
    write(write_file_descriptor, &a, sizeof(a)); // writing on the file
    temp = a + b;
    a = b;
    b = temp;
  }
}

void print_fibonacci(int read_file_descriptor, int number) {
  FILE *output;
  char filename[20];
  sprintf(filename, "fib-%d.txt", number); // creating file name
  output = fopen(filename, "w"); // opening file in write mode

  int num;
  for (int i = 0; i < number; i++) {
    read(read_file_descriptor, &num, sizeof(num)); // write to the file
    fprintf(output, "Sl-%d: %d\n", i + 1, num);
  }

  printf("First %d fibonacci numbers were written to fib-%d.txt \n", number, number); // print on screen
  fclose(output);
}

int main() {
  int number, pipe_file_descriptor[2];

  while (1) {
    printf("Enter an integer between 1 and 50, or -1 to quit:");
    scanf("%d", &number);

    if (number == -1) {
      printf("Goodbye. \n");
      return 0;
    }

    if (number < 1 || number > 50) {
      printf("The number is out of range. \n");
      continue;
    }

    // creating a pipe for communication between processes
    if (pipe(pipe_file_descriptor) == -1) { // pipe failed
      fprintf(stderr, "Pipe failed.\n");
      return 1;
    }

    pid_t pid = fork(); // creating a child process

    if (pid == -1) {
      perror("fork failed");
      exit(EXIT_FAILURE);
    }

    if (pid == 0) {
      close(pipe_file_descriptor[0]);
      compute_fibonacci(number, pipe_file_descriptor[1]);
      close(pipe_file_descriptor[1]);
      exit(EXIT_SUCCESS);

    } else {
      pid_t pid2 = fork(); // creating another child process
      if (pid2 == -1) { // fork failed
        perror("fork");
        exit(EXIT_FAILURE);

      } if (pid2 == 0) { 
        close(pipe_file_descriptor[1]);
        print_fibonacci(pipe_file_descriptor[0], number); // reading from the file and printing
        close(pipe_file_descriptor[0]); // closing the file descriptors
        exit(EXIT_SUCCESS);  

      } else { 
        close(pipe_file_descriptor[0]); // closing the file descriptors 
        close(pipe_file_descriptor[1]); // closing the file descriptors
        wait(NULL); // waiting for the first child process to finish
        wait(NULL); // waiting for the second child process to finish
      }
    }
  }

  return 0;
}