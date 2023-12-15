import matplotlib.pyplot as plt
import pandas as pd

# Read the CSV file into a pandas DataFrame
df = pd.read_csv('salary.csv')

# Display the content of the DataFrame

# (a) Drop all rows that have missing data
df.dropna(inplace=True)

# (b) Change Age and Salary variables to int64
df['Age'] = df['Age'].astype('int64')
df['Salary'] = df['Salary'].astype('int64')

# (c) Create histograms of salary for both men and women using 30 bins
# plt.figure(figsize=(10, 6))
# plt.hist(df[df['Gender'] == 'Male']['Salary'], bins=30, alpha=0.5, label='Male')
# plt.hist(df[df['Gender'] == 'Female']['Salary'], bins=30, alpha=0.5, label='Female')
# plt.xlabel('Salary')
# plt.ylabel('Frequency')
# plt.title('Distribution of Salary by Gender')
# plt.legend()
# plt.show()

df.plot.hist(column=["Salary"], by="Gender", bins=30)
plt.show()


