import pandas as pd


data = {
    'Bob': [85, 92, 78],
    'Joe': [77, 88, 95],
    'Alice': [90, 86, 89]
}

df = pd.DataFrame(data)
df['Mean'] = df.mean(axis=1)
df.index = ['CMPS 240', 'CMPS 320', 'CMPS 331']


if __name__ == '__main__':
  print(df)