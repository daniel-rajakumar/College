import seaborn as sns

# Load the tips dataset
tips = sns.load_dataset("tips")

# Compute the mean total_bill by sex
print(tips.groupby("sex")["tip"].mean())

