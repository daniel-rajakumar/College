import xml.etree.ElementTree as ET
import pymysql

root = ET.parse("hospital_data.xml").getroot()
conn = pymysql.connect(host="localhost", user="root", password="password", database="hospitialDB")
cursor = conn.cursor()

###########################
######## Patients #########
###########################
patients = []
for patient in root.find("Patients"):
    patients.append(( int(patient.find("PatientID").text),
                      patient.find("Name").text,
                      int(patient.find("Age").text),
                      patient.find("Gender").text,
                      patient.find("Address").text))
try:
    cursor.executemany("""
        INSERT INTO Patients (PatientID, Name, Age, Gender, Address) 
        VALUES (%s, %s, %s, %s, %s)
    """, patients)
    conn.commit()
except pymysql.Error as err:
    print(err)
    conn.rollback()


###########################
######### Doctors #########
###########################
doctors = []
for doctor in root.find("Doctors"):
    doctors.append(( int(doctor.find("DoctorID").text),
                     doctor.find("Name").text,
                     doctor.find("Specialty").text,
                     int(doctor.find("YearsOfExperience").text)))
try:
    cursor.executemany("""
        INSERT INTO Doctors (DoctorID, Name, Specialty, YearsOfExperience) 
        VALUES (%s, %s, %s, %s)
    """, doctors)
    conn.commit()
except pymysql.Error as err:
    print(err)
    conn.rollback()

###########################
###### Appointments #######
###########################
appointments = []
for appointment in root.find("Appointments"):
    appointments.append(( int(appointment.find("AppointmentID").text),
                          int(appointment.find("PatientID").text),
                          int(appointment.find("DoctorID").text),
                          appointment.find("Date").text,
                          appointment.find("Time").text,
                          appointment.find("Reason").text))
try:
    cursor.executemany("""
        INSERT INTO Appointments (AppointmentID, PatientID, DoctorID, Date, Time, Reason) 
        VALUES (%s, %s, %s, %s, %s, %s)
    """, appointments)
    conn.commit()
except pymysql.Error as err:
    print(err)
    conn.rollback()

###########################
####### Departments #######
###########################
departments = []
for department in root.find("Departments"):
    departments.append(( int(department.find("DepartmentID").text),
                         department.find("Name").text,
                         department.find("Location").text))
try:
    cursor.executemany("""
        INSERT INTO Departments (DepartmentID, Name, Location) 
        VALUES (%s, %s, %s)
    """, departments)
    conn.commit()
except pymysql.Error as err:
    print(err)
    conn.rollback()

###########################
####### Treatments ########
###########################
treatments = []
for treatment in root.find("Treatments"):
    treatments.append(( int(treatment.find("TreatmentID").text),
                        treatment.find("Name").text,
                        float(treatment.find("Cost").text)))
try:
    cursor.executemany("""
        INSERT INTO Treatments (TreatmentID, Name, Cost) 
        VALUES (%s, %s, %s)
    """, treatments)
    conn.commit()
except pymysql.Error as err:
    print(err)
    conn.rollback()

cursor.close()
conn.close()