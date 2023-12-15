import numpy as np
import matplotlib.pyplot as plt

# Set the random seed for reproducibility
# np.random.seed(0)

# Generate random temperatures for New York, Chicago, and Los Angeles
# (mean, sd, and total_num)
ny_temperatures = np.random.normal(60, 10, 100)
chicago_temperatures = np.random.normal(55, 8, 100)
la_temperatures = np.random.normal(70, 12, 100)

# Plot the temperatures
plt.plot(ny_temperatures, label='New York')
plt.plot(chicago_temperatures, label='Chicago')
plt.plot(la_temperatures, label='Los Angeles')

# Add a legend at the upper left corner of the plot
plt.legend(loc='upper left')

# Show the plot
plt.show()
