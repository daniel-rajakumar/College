import math

def test(a, b):
  quotient = a // b
  remainder = a % b
  return (quotient, remainder)

if __name__ == '__main__':
  ans = test(9, 4)
  print('quotient:', ans[0])
  print('remainder:', ans[1])

  
