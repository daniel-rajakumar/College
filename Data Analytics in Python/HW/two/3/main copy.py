def update_dictionary(dict, key, value):
  dict[key] = value;
  return dict
  


if __name__ == '__main__':
  dict = {
    'a': "apple",
    'b': "book",
    'c': "cat",
  }

  print(dict)

  dict = update_dictionary(dict, 'a', "airplane")
  dict = update_dictionary(dict, 'd', "dog")
  dict = update_dictionary(dict, 'e', "eggs")

  print(dict)