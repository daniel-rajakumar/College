import seaborn as sns
import matplotlib.pyplot as plt

data = sns.load_dataset("penguins")
avg_body_mass = data.groupby("species")["body_mass_g"].mean()

plt.bar(avg_body_mass.index, avg_body_mass.values, color=['red', 'blue', 'green'])
plt.ylabel("Body Weight in Grams")
plt.title("Penguin Weight by Species")
plt.show()
