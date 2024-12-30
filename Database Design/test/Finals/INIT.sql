DROP DATABASE IF EXISTS hospitialDB;
CREATE DATABASE hospitialDB;
USE hospitialDB;

CREATE TABLE Patients (
    PatientID INT PRIMARY KEY,
    Name VARCHAR(255),
    Age INT,
    Gender VARCHAR(50),
    Address VARCHAR(255)
);

CREATE TABLE Doctors (
    DoctorID INT PRIMARY KEY,
    Name VARCHAR(255),
    Specialty VARCHAR(255),
    YearsOfExperience INT
);

CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY,
    PatientID INT,
    DoctorID INT,
    Date DATE,
    Time TIME,
    Reason VARCHAR(255)
);

CREATE TABLE Departments (
    DepartmentID INT PRIMARY KEY,
    Name VARCHAR(255),
    Location VARCHAR(255)
);

CREATE TABLE Treatments (
    TreatmentID INT PRIMARY KEY,
    Name VARCHAR(255),
    Cost DECIMAL(10, 2)
);

CREATE TABLE Doctor_Department (
    DoctorID INT,
    DepartmentID INT,
    PRIMARY KEY (DoctorID, DepartmentID)
);