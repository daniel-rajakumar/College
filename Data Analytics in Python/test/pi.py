import matplotlib.pyplot as plt

# Data
players = ['Alice', 'Melissa', 'Natalie', 'Jane', 'Brenda']
goals = [4, 7, 8, 10, 9]

# Calculate percentage of goals for each player
total_goals = sum(goals)
percentages = [(goal / total_goals) * 100 for goal in goals]

# Pie chart
# plt.pie(percentages, labels=players, autopct='%1.1f%%', colors=['red', 'blue', 'green', 'orange', 'purple'])
plt.pie(percentages, labels=players, autopct='%0.2f%%')
plt.title('Percentage of Goals by Player')

# Show the chart
plt.show()
