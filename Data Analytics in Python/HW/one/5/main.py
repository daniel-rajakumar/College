
def get_list_mode(list):
  dict = {}
  for i in list:
    if dict.get(i) == None:
      dict[i] = 1
    else:
      dict[i] = dict[i] + 1

  max_key = 0
  max_value = 0
  for key, val in dict.items():
    if val > max_value:
      max_key = key
      max_value = val

  return max_key
  

if __name__ == '__main__':
  list = [2,5,6,2,7,2,5,2]
  print(get_list_mode(list))