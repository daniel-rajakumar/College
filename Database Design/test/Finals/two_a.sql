SELECT p.Name                 AS PatientName, 
	   d.Name                 AS DoctorName, 
	   COUNT(a.AppointmentID) AS TotalAppointments

FROM Patients p
JOIN Appointments a ON p.PatientID = a.PatientID
JOIN Doctors      d ON a.DoctorID  = d.DoctorID

WHERE YEAR(a.Date) = YEAR(CURDATE())

GROUP BY p.PatientID, d.DoctorID;