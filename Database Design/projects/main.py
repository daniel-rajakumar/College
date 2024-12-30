import xml.etree.ElementTree as ET
import pymysql
import pandas as pd

FLIGHT_PASSENGERS = 300

# [Load] XML data
XML = ET.parse('PNR.xml')
name_space = {'ss': 'urn:schemas-microsoft-com:office:spreadsheet'}

# [Extract] rows and headers
table = XML.getroot().find('ss:Worksheet/ss:Table', name_space)
rows = table.findall('ss:Row', name_space)
header_row = rows[0]
headers = []
for cell in header_row.findall('ss:Cell', name_space):
  headers.append(cell.find('ss:Data', name_space).text)

# [Extract] data
data = []
for row in rows[1:]:
  row_data = []
  for cell in row.findall('ss:Cell', name_space):
    cell_data = cell.find('ss:Data', name_space)
    row_data.append(cell_data.text if cell_data is not None else None)
  data.append(row_data)


# [Transform] data into DataFrame
df = pd.DataFrame(data, columns=headers)
df['travelDate'] = pd.to_datetime(df['travelDate'], errors='coerce')
df['npass'] = pd.to_numeric(df['npass'], errors='coerce')
df_clean = df.dropna()


# [INCLUDE] flight_id and calculate available seats
df_clean['flight_id'] = df_clean['source'] + '_' + df_clean['dest'] + '_' + df_clean['travelDate'].dt.strftime('%Y-%m-%d')
flight_schedule = df_clean.groupby(['flight_id', 'source', 'dest', 'travelDate'], as_index=False).agg(total_booked=('npass', 'sum'))
flight_schedule['available_seats'] = FLIGHT_PASSENGERS - flight_schedule['total_booked']

print(df_clean)

# [MySQL] Connection and cursor
connection = pymysql.connect(**{ 'host': 'localhost', 'user': 'root', 'password': 'password', 'database': 'FlightsDB' })
cursor = connection.cursor()

try:
    # [MySQL] Insert data into bookings table
    for _, row in df_clean.iterrows():
        cursor.execute("""
        INSERT INTO bookings (firstname, lastname, source, dest, travelDate, class, bookingTime, npass, flight_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (row['firstname'], row['lastname'], row['source'], row['dest'], row['travelDate'], row['class'], row['bookingTime'], row['npass'], row['flight_id']))

    # [MySQL] Insert data into flight_schedule table
    for _, row in flight_schedule.iterrows():
        cursor.execute("""
        INSERT INTO flight_schedule (flight_id, source, dest, travelDate, total_booked, available_seats)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE total_booked = VALUES(total_booked), available_seats = VALUES(available_seats);
        """, (row['flight_id'], row['source'], row['dest'], row['travelDate'], row['total_booked'], row['available_seats']))

    connection.commit()
    print("[SUCCESS] Data inserted into MySQL database.")

# [FAILURE]
except Exception as e:
    print(f"[EXCEPTION]: {e}")

# [FINALLY] Close cursor and connection
finally:
    cursor.close()
    connection.close()







