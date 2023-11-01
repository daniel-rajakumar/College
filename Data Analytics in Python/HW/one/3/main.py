
def has_duplicate_values(list):
  is_same = False
  for i in range(len(list)):
    for j in range(len(list)):
      if i == j: 
        continue

      if list[i] == list[j]:
        is_same = True

  return is_same
    
if __name__ == '__main__':
  list  = [1, 2, 3, 4, 5]
  list2 = [1, 2, 3, 4, 5, 5]
  print(has_duplicate_values(list))
  print(has_duplicate_values(list2))