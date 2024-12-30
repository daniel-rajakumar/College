DELIMITER //
CREATE TRIGGER InsertTreatmentCost
AFTER INSERT ON Treatments
FOR EACH ROW
BEGIN
    IF NEW.Cost > 5000 THEN
        UPDATE Treatments
        SET Cost = 5000
        WHERE TreatmentID = NEW.TreatmentID;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER UpdateTreatmentCost
AFTER UPDATE ON Treatments
FOR EACH ROW
BEGIN
    IF NEW.Cost > 5000 THEN
        UPDATE Treatments
        SET Cost = 5000
        WHERE TreatmentID = NEW.TreatmentID;
    END IF;
END //
DELIMITER ;