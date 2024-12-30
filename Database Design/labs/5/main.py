import pandas as pd
import mysql.connector

mydb = mysql.connector.connect(host="localhost", user="root", password="password", database="sys")

mycursor = mydb.cursor()

df_gradescale = pd.read_csv('gradescale.csv')
df_school = pd.read_csv('school.csv')


mycursor.execute("truncate table gradescale")
mycursor.execute("truncate table school")

for _, row in df_gradescale.iterrows():
    mycursor.execute(f'''
        insert into gradescale (grade, min_score, max_score)
        values ('{row[0]}', {row[1]}, {row[2]})
    ''')

for _, row in df_school.iterrows():
    mycursor.execute(f'''
        insert into school (first_name, last_name, address, course, grade, instructor)
        values ('{row[0]}', '{row[1]}', '{row[2]}', '{row[3]}', '{row[4]}', '{row[5]}')
    ''')

mydb.commit()

# a
query_a = '''
SELECT DISTINCT school.first_name, school.last_name, school.course
FROM school 
JOIN gradescale g ON school.grade = g.grade
WHERE g.min_score >= 80;
'''
mycursor.execute(query_a)
result_a = mycursor.fetchall()
print("\n(A)")
for row in result_a:
    print(row)

    
# b
query_b = '''
SELECT school.first_name, school.last_name, AVG(g.max_score) AS average_score
FROM school
JOIN gradescale g ON school.grade = g.grade
GROUP BY school.first_name, school.last_name;
'''
mycursor.execute(query_b)
result_b = mycursor.fetchall()
print("\n(B)")
for row in result_b:
    print(row)

    
# c
query_c = '''
SELECT DISTINCT s1.first_name AS student_1, s1.last_name AS last_name_1, 
                s2.first_name AS student_2, s2.last_name AS last_name_2, 
                s1.course
FROM school s1
JOIN school s2 ON s1.course = s2.course 
              AND s1.first_name != s2.first_name 
              AND s1.last_name != s2.last_name;
'''
mycursor.execute(query_c)
result_c = mycursor.fetchall()
print("\n(C)")
for row in result_c:
    print(row)

    
# d
query_d = '''
SELECT instructor, COUNT(DISTINCT course) AS course_count
FROM school
GROUP BY instructor
HAVING course_count >= 2;
'''
mycursor.execute(query_d)
result_d = mycursor.fetchall()
print("\n(D)")
for row in result_d:
    print(row)