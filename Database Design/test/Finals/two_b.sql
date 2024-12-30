DELIMITER //
  CREATE PROCEDURE ScheduleAppointment (
      IN PatientID INT, 
      IN DoctorID INT, 
      IN AppointmentDate DATE, 
      IN AppointmentTime TIME
  )
  BEGIN
      DECLARE doctor_busy INT;
      DECLARE patient_busy INT;

      SELECT COUNT(*) INTO doctor_busy
      FROM Appointments
      WHERE DoctorID = DoctorID AND Date = AppointmentDate AND Time = AppointmentTime;

      SELECT COUNT(*) INTO patient_busy
      FROM Appointments
      WHERE PatientID = PatientID AND Date = AppointmentDate AND Time = AppointmentTime;

      IF doctor_busy = 0 AND patient_busy = 0 THEN
          INSERT INTO Appointments (PatientID, DoctorID, Date, Time, Reason)
          VALUES (PatientID, DoctorID, AppointmentDate, AppointmentTime, 'Scheduled Apponitmet');
      END IF;
  END //
DELIMITER ;