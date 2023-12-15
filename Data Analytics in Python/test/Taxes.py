import matplotlib.pyplot as plt
import pandas as pd

df = pd.read_csv('https://pages.ramapo.edu/~ldant/cmps240/csv/home_data.csv')

print(df['Taxes'].mean())

print(df[df['Acres'] > 1]['Taxes'].mean())















