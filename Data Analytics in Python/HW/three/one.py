import math

class Fraction:
    

    def __init__(self,numerator, denominator):
      self.numerator = numerator
      self.denominator = denominator
      if (not denominator):
        raise ZeroDivisionError()
      
      gcd = math.gcd(numerator, denominator)
      self.reduced_fraction = (numerator // gcd , denominator // gcd)
      

    def __str__(self):
      return str(self.reduced_fraction[0]) + "/" + str(self.reduced_fraction[1])

    def __add__(self, other):
      a1, b1 = self.numerator, other.numerator 
      a2, b2 = self.denominator, other.denominator 

      fra = (((a1 * b2) + (b1 * a2)), (a2 * b2))
      gcd = math.gcd(fra[0], fra[1])
      fra = (fra[0] // gcd, fra[1] // gcd)
      
      return f"{fra[0]}/{fra[1]}"

    def __sub__(self, other):
      a1 = self.numerator 
      b1 = other.numerator 
      a2 = self.denominator 
      b2 = other.denominator 

      fra = (((a1 * b2) - (b1 * a2)), (a2 * b2))
      gcd = math.gcd(fra[0], fra[1])
      fra = (fra[0] // gcd, fra[1] // gcd)
      
      return f"{fra[0]}/{fra[1]}"


    def __mul__(self, other):
      a1 = self.numerator 
      b1 = other.numerator 
      a2 = self.denominator 
      b2 = other.denominator 

      fra = (a1 * b1, a2 * b2)
      gcd = math.gcd(fra[0], fra[1])
      fra = (fra[0] // gcd, fra[1] // gcd)
      
      return f"{fra[0]}/{fra[1]}"

    def __truediv__(self, other):
      a1 = self.numerator 
      b1 = other.numerator 
      a2 = self.denominator 
      b2 = other.denominator 

      fra = (a1 * b2, a2 * b1)
      gcd = math.gcd(fra[0], fra[1])
      fra = (fra[0] // gcd, fra[1] // gcd)
      
      return f"{fra[0]}/{fra[1]}"

    def __neg__(self):
      return Fraction(-self.numerator, self.denominator)
  

if __name__ == '__main__':
  a = Fraction(3, 4)
  b = Fraction(5, 2)
  print(f"(a: {a}, b: {b})")
  print("+:", a + 2)
  print("-:", a - b)
  print("*:", a * b)
  print("/:", a / b)
