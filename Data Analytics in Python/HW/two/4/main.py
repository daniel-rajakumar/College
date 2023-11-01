import math

def num_of_palindrome(str):
  return sum([all([
      (True if i[var].lower() == i[-var - 1].lower() else False) 
        for var in range(0, math.ceil(len(i) / 2))
     ]) for i in str])



if __name__ == '__main__':
  list = [ "radar", "madam" ]
  print(num_of_palindrome(list))
