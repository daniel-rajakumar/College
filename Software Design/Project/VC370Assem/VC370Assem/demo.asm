; Demo program: reads N, prints N+3, then counts down to 1.
        ORG 100
        B    START
SKIP    DC   999
START   READ N
        LOAD N
        ADD  THREE
        STORE NPLUS3
        WRITE NPLUS3
        LOAD N
        STORE COUNT
LOOP    LOAD COUNT
        WRITE COUNT
        SUB  ONE
        STORE COUNT
        BZ   DONE
        BP   LOOP
DONE    HALT
N       DS   1
NPLUS3  DS   1
COUNT   DS   1
ONE     DC   1
THREE   DC   3
        END
