
def travel(s, x, y):
  for c in s.lower():
    if c == 'n': y += 1
    if c == 's': y -= 1
    if c == 'e': x += 1
    if c == 'w': x -= 1
    print(x, y)

  return (x, y)
  

if __name__ == '__main__':
  print(travel('sweswnne', 3, 2))

  
  
