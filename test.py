# import pandas lib as pd 
import pandas as pd 

# create the data dictionary 
data = {'Month' : ['January', 'February', 'March', 'April'], 
		'Expense':[ 21525220.653, 31125840.875, 23135428.768, 56245263.942]} 

# create the dataframe 
dataframe = pd.DataFrame(data, columns = ['Month', 'Expense']) 

pd.set_option('display.float_format',  '${:,.2f}'.format)
print('\nFormatted DataFrame :\n', dataframe.to_string(col_space = {'Expense': 20}))