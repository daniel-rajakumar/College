; Demo 3: Read two numbers and output |A - B|.
        ORG 100
        READ A
        READ B
        LOAD A
        SUB  B
        BM   NEG
        STORE DIFF
        WRITE DIFF
        HALT
NEG     LOAD B
        SUB  A
        STORE DIFF
        WRITE DIFF
        HALT
A       DS   1
B       DS   1
DIFF    DS   1
        END
