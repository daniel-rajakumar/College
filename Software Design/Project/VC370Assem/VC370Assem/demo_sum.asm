; Demo 1: Read two numbers and output their sum.
        ORG 100
        READ A
        READ B
        LOAD A
        ADD  B
        STORE SUM
        WRITE SUM
        HALT
A       DS   1
B       DS   1
SUM     DS   1
        END
