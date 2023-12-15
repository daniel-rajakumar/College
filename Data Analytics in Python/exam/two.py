import pandas as pd

data = pd.read_csv('https://pages.ramapo.edu/~ldant/cmps240/csv/home_data.csv')

# (a)
data = data.dropna()

# (b)
data = data.astype({'Sell':'int64', 'Baths':'int64'})

# (c)
print(data.groupby('Baths')['Sell'].mean())

# (d) 
print(data.groupby('Baths')['Sell'].mean().apply(lambda price: f'${round(price, 2):.2f}'))
