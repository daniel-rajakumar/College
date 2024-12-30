import xml.etree.ElementTree as ET
import pandas as pd

import mysql.connector

db = mysql.connector.connect(host="localhost", user="root", password="password", database="test")

cursor = db.cursor()

# cursor.execute("truncate table students")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100),
        age INT,
        major VARCHAR(50)
    )
""")

tree = ET.parse('input.xml')
root = tree.getroot()

for student in root.findall('student'):
    id = int(student.find('id').text)
    first_name = student.find('first_name').text
    last_name = student.find('last_name').text
    email = student.find('email').text
    age = int(student.find('age').text)
    major = student.find('major').text

    cursor.execute("""
        INSERT INTO students (id, first_name, last_name, email, age, major)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (id, first_name, last_name, email, age, major))

db.commit()

cursor.execute("SELECT * FROM students")
rows = cursor.fetchall()

# Display each row
for row in rows:
    print(row)

cursor.close()
db.close()
