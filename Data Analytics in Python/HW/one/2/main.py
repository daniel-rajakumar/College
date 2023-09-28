import math

def calculate_sphere_volume():
  radius = int(input("radius: "));

  if radius < 1:
    print("radius must be a positive input")
    exit()

  volume = (4 / 3) * math.pi * math.pow(radius, 3)
  print(volume)

if __name__ == '__main__':
  calculate_sphere_volume()