from pymongo import MongoClient
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["hospitalDB"]

with open("hospital_data.json", "r") as file:
    data = json.load(file)

try:
    if "Patients" in data:     db.Patients.insert_many(data["Patients"])
    if "Doctors" in data:      db.Doctors.insert_many(data["Doctors"])
    if "Appointments" in data: db.Appointments.insert_many(data["Appointments"])
    if "Departments" in data:  db.Departments.insert_many(data["Departments"])
    if "Treatments" in data:   db.Treatments.insert_many(data["Treatments"])
except Exception as e:
    print()

patients_by_department = db.Appointments.aggregate([
    { "$lookup": { "from": "Doctors",  "localField": "DoctorID", "foreignField": "DoctorID", "as": "DoctorDetails" } },
    { "$unwind": "$DoctorDetails" },  
    { "$lookup": { "from": "Departments", "localField": "DoctorDetails.Specialty", "foreignField": "Name", "as": "DepartmentDetails" } },
    { "$unwind": "$DepartmentDetails" },  
    { "$group": { "_id": "$DepartmentDetails.Name", "TotalPatients": {"$sum": 1}  } }
])

print("patients - department:")
for dep in patients_by_department:
    print(dep)

average_treatment_cost = db.Treatments.aggregate([
    { "$group":   { "_id": None, "AverageCost": {"$avg": "$Cost"} } },
    { "$project": { "_id": 0,    "AverageCost":  1 } }
])

print("\navg $ of treatments:")
for cost in average_treatment_cost:
    print(cost)

# Close the MongoDB connection
client.close()
