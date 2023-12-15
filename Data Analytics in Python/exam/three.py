import numpy as np
import matplotlib.pyplot as plt

# Generate random values from a normal distribution
random_values = np.random.normal(1050, 216, 1000)

# Plot histogram
plt.hist(random_values, bins=20, color='lightblue', edgecolor='black')
plt.title('SAT histogram')

plt.show()




