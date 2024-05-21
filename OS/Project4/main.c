#include <stdio.h>
#include <pthread.h>

int is_prime(int n) {
    if (n <= 1) return 0;
    for (int i = 2; i * i <= n; i++) 
        if (n % i == 0) return 0;
    return 1;
}

void *calc_primes(void *arg) {
    printf("Thread 1: ");
    for (int i = 2, count = 0; count < 10; i++) {
        if (is_prime(i)) {
            printf("%d ", i);
            count++;
        }
    }
    printf("\n");
    return NULL;
}

void *calc_squares(void *arg) {
    printf("Thread 2: ");
    for (int i = 1; i <= 10; i++) 
        printf("%d ", i * i);
    printf("\n");
    return NULL;
}

void *calc_cubes(void *arg) {
    printf("Thread 3: ");
    for (int i = 1; i <= 10; i++) 
        printf("%d ", i * i * i);
    printf("\n");
    return NULL;
}

void *calc_lucas(void *arg) {
    printf("Thread 4: ");
    int a = 2, b = 1, c;
    for (int i = 0; i < 10; i++) {
        printf("%d ", a);
        c = a + b;
        a = b;
        b = c;
    }
    printf("\n****Lucas numbers have the special feature that the ratio of consecutive Lucas numbers converges to the Golden Ratio: (1 + √5) / 2 \n");
    return NULL;
}

void* _print(void* arg) {
    printf("Thread 0: This is the first thread.\n");
    return NULL;
}

int main() {
    int num = 5;
    pthread_t threads[num];

    pthread_create(&threads[0], NULL, _print,       NULL);
    pthread_create(&threads[1], NULL, calc_primes,  NULL);
    pthread_create(&threads[2], NULL, calc_squares, NULL);
    pthread_create(&threads[3], NULL, calc_cubes,   NULL);
    pthread_create(&threads[4], NULL, calc_lucas,   NULL);

    for (int i = 0; i < num; i++) 
        pthread_join(threads[i], NULL);

    return 0;
}