def print_types(list):
  [print(type(var)) for var in list]

if __name__ == '__main__':
  list = [1, 2, 3]
  tuple = (1, 2, 3)
  set = {1, 2, 3}
  print_types(list)
  print_types(tuple)
  print_types(set)