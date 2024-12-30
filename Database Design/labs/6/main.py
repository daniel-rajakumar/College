import pandas as pd
import mysql.connector
import xml.etree.ElementTree as ET

mydb = mysql.connector.connect(host="localhost", user="root", password="password", database="sys")

mycursor = mydb.cursor()

# Write Python code to read the employee.xml and store that into a MYSQL database.
mycursor.execute("""
  CREATE TABLE IF NOT EXISTS employees (
      empID VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255),
      department VARCHAR(255),
      salary FLOAT
  )
  """)

mycursor.execute("""
    CREATE TABLE IF NOT EXISTS department (
        deptID VARCHAR(5) PRIMARY KEY,
        DeptName VARCHAR(255),
        Manager VARCHAR(5)
    )
""")

mycursor.execute("TRUNCATE TABLE employees")
mycursor.execute("TRUNCATE TABLE department")
  
tree = ET.parse("Employees.xml")
root = tree.getroot()

employees = []
departments = []

for employee in root.findall('Employee'):
      emp_id = employee.get('empID')
      name = employee.find('Name').text
      salary = int(employee.find('Salary').text)
      dept_id = employee.find('DepartmentID').text
      employees.append((emp_id, name, salary, dept_id))

for department in root.findall('Department'):
    dept_id = department.get('deptID')
    dept_name = department.find('DeptName').text
    manager = department.find('Manager').text
    departments.append((dept_id, dept_name, manager))
    

for employee in employees:
    mycursor.execute(f"""
        insert into employees (empID, name, department, salary)
        values ('{employee[0]}', '{employee[1]}', '{employee[3]}', {employee[2]})
    """)

for department in departments:
    mycursor.execute(f"""
        insert into Department (deptID, DeptName, Manager)
        values ('{department[0]}', '{department[1]}', '{department[2]}')
        ON DUPLICATE KEY UPDATE DeptName=VALUES(DeptName), Manager=VALUES(Manager)
    """)


mydb.commit()


# Then run a select query making sure the database is populated with all the appropriate values 
mycursor.execute(""" SELECT * FROM employees; """)
for row in mycursor.fetchall(): print(row)
      
mycursor.execute(""" SELECT * FROM department; """)
for row in mycursor.fetchall(): print(row)


# Finally execute a query to return the employee name who has the highest salary in each department.
mycursor.execute("""
      SELECT e.name, d.DeptName, e.salary
      FROM employees e 
      JOIN department d ON e.department = d.deptID
      JOIN (
        SELECT department, MAX(salary) as max_salary
        FROM employees
        GROUP BY department
      ) AS max_salaries ON e.department = max_salaries.department AND e.salary = max_salaries.max_salary
    """)

for result in mycursor.fetchall():
    print(f"Department: {result[1]}, Employee: {result[0]}, Salary: {result[2]}")


