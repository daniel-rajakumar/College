from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

# Create a new database and collection
db = client["company"]
employees = db["employees"]

# Insert the dataset into a MongoDB collection named employees.
employees.insert_many([ 
    { "employee_id": 1, "name": "Alice", "department": "Sales", "salary": 70000, "date_of_joining": "2020-02-15" },
    { "employee_id": 2, "name": "Bob", "department": "HR", "salary": 75000, "date_of_joining": "2019-04-23" },
    { "employee_id": 3, "name": "Charlie", "department": "IT", "salary": 90000, "date_of_joining": "2021-01-10" },
    { "employee_id": 4, "name": "David", "department": "Sales", "salary": 68000, "date_of_joining": "2018-03-17" },
    { "employee_id": 5, "name": "Eva", "department": "HR", "salary": 72000, "date_of_joining": "2020-07-29" },
    { "employee_id": 6, "name": "Frank", "department": "IT", "salary": 85000, "date_of_joining": "2022-05-21" },
    { "employee_id": 7, "name": "Grace", "department": "Sales", "salary": 65000, "date_of_joining": "2021-08-30" },
    { "employee_id": 8, "name": "Henry", "department": "IT", "salary": 95000, "date_of_joining": "2019-11-09" },
    { "employee_id": 9, "name": "Ivy", "department": "HR", "salary": 78000, "date_of_joining": "2021-02-20" },
    { "employee_id": 10, "name": "Jack", "department": "Sales", "salary": 71000, "date_of_joining": "2020-12-14" }
])

# Queries all employees in the "Sales" department who joined after January 1, 2020, and displays their details
sales_employees = employees.find({
    "department": "Sales",
    "date_of_joining": {"$gt": "2020-01-01"}
})
print("Employees in Sales Department Joined After 2020-01-01:")
for employee in sales_employees:
    print(employee)

# Calculates the average salary for employees in the "IT" department using a find() query.
it_employees = employees.find({"department": "IT"})
it_salaries = [emp["salary"] for emp in it_employees]
average_it_salary = sum(it_salaries) / len(it_salaries)
print(f"Average Salary in IT Department: ${average_it_salary:.2f}")

# Uses MongoDB's aggregation framework to group employees by department, calculate average salary, sort by descending average salary, and find the department with the highest average.
average_salary_pipeline = [
    {"$group": {"_id": "$department", "average_salary": {"$avg": "$salary"}}},
    {"$sort": {"average_salary": -1}}
]
average_salary_results = list(employees.aggregate(average_salary_pipeline))
print("Average Salary by Department:")

for result in average_salary_results:
    print(result)

highest_avg_dept = average_salary_results[0]
print(f"Department with the Highest Average Salary: {highest_avg_dept['_id']} (${highest_avg_dept['average_salary']:.2f})")

# Find the single employee with the highest salary by sorting the salary field in descending order and returning the first result.
highest_salary_employee = employees.find().sort("salary", -1).limit(1)
print("Employee with the Highest Salary:")
for e in highest_salary_employee:
    print(e)
