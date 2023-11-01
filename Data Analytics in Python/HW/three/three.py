import quandl 

if __name__ == '__main__':
  fb = quandl.get('WIKI/FB')
  print("\nTWO: \n", fb.head(10));
  fb['Profit'] = fb['Close'] - fb['Open']
  print("\nFOUR: \n", len(fb[fb['Profit'] < 0]));
  print("\nFIVE: \n", fb.mean());
  print("\nSIX: \n", fb[['Open', 'Close', 'Profit']].head(10));
