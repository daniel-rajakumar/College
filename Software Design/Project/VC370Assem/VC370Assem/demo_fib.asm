; Demo 4: Read N and output the Nth Fibonacci number.
        ORG 100
        READ N
        LOAD N
        BZ   ZEROCASE
        SUB  ONE
        BZ   ONECASE
        LOAD ZERO
        STORE A
        LOAD ONE
        STORE B
        LOAD N
        SUB  ONE
        STORE COUNT
LOOP    LOAD A
        ADD  B
        STORE TEMP
        LOAD B
        STORE A
        LOAD TEMP
        STORE B
        LOAD COUNT
        SUB  ONE
        STORE COUNT
        BZ   DONE
        BP   LOOP
DONE    WRITE B
        HALT
ZEROCASE LOAD ZERO
        WRITE ZERO
        HALT
ONECASE LOAD ONE
        WRITE ONE
        HALT
A       DS   1
B       DS   1
TEMP    DS   1
COUNT   DS   1
N       DS   1
ZERO    DC   0
ONE     DC   1
        END
