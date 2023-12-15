
import numpy as np

if __name__ == '__main__':
  arr = np.random.randint(20, 50 + 1, size=(4, 4))

  print("\nONE: \n\n", arr)
  print("\nTWO: \n\n", np.max(arr, axis = 0))
  print("\nTHREE: \n\n", np.mean(arr))
  print("\nFOUR: \n\n", np.mean(arr, axis = 1))

  








