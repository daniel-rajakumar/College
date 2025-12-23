; Demo 2: Read N and output N! (factorial).
        ORG 100
        READ N
        LOAD N
        BZ   ZERO
        STORE COUNT
        LOAD ONE
        STORE FACT
LOOP    LOAD FACT
        MULT COUNT
        STORE FACT
        LOAD COUNT
        SUB  ONE
        STORE COUNT
        BZ   DONE
        BP   LOOP
DONE    WRITE FACT
        HALT
ZERO    LOAD ONE
        STORE FACT
        WRITE FACT
        HALT
FACT    DS   1
COUNT   DS   1
N       DS   1
ONE     DC   1
        END
