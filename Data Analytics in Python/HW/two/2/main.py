def num_vowels(str):
  return sum([ 1 for i in str if i in "aeiou"])

if __name__ == '__main__':
  str = "aa bb cc dd ee ff gg hh ii jj kk ll mm nn oo pp qq rr ss tt uu vv ww xx yy zz"
  print(num_vowels(str))
