<!DOCTYPE html>
<html>
<head>
    <title>THREE</title>
</head>
<body>
    <h1>[question 3] Search Patient by Appointments</h1>
    <form method="POST">
        <label for="patient_id">Enter Patient ID here...</label>
        <input type="number" id="patient_id" name="patient_id" required>
        <button type="submit">Search</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $patient_id = $_POST['patient_id'];

        // Database connection
        $conn = new mysqli('localhost:3306', 'root', 'password', 'hospitialDB');

        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        $sql = "SELECT DoctorID, Date, Time, Reason
                FROM Appointments WHERE PatientID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $patient_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo "<h2>Appointments:</h2>";
            echo "<table>";
            echo "<tr>
                    <th>Doctor ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                  </tr>";
            while ($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>{$row['DoctorID']}</td>
                        <td>{$row['Date']}</td>
                        <td>{$row['Time']}</td>
                        <td>{$row['Reason']}</td>
                      </tr>";
            }
            echo "</table>";
        } else {
            echo "<p>Uh oh!! No appointment found for patient's ID of $patient_id.</p>";
        }

        $stmt->close();
        $conn->close();
    }
    ?>
</body>
</html>