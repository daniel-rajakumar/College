<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title> Lab 9 </title>
</head>
<body>
    <h2>Find Trains by Route</h2>
    <form method="POST" action="">
        <label for="source">Source:</label>
        <input type="text" id="source" name="source" required>
        <br><br>
        <label for="destination">Destination:</label>
        <input type="text" id="destination" name="destination" required>
        <br><br>
        <input type="submit" value="Search">
    </form>

    <?php
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $source = $_POST['source'];
        $destination = $_POST['destination'];

        // Database connection
        $conn = new mysqli("localhost", "root", "password", "TrainDB");

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Query to fetch matching trains
        $sql = "SELECT * FROM Trains WHERE Source = ? AND Destination = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ss", $source, $destination);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo "<h3>Available Trains</h3>";
            echo "<table border='1'>
                    <tr>
                        <th>Train ID</th>
                        <th>Train Name</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Departure Time</th>
                        <th>Arrival Time</th>
                    </tr>";
            while ($row = $result->fetch_assoc()) {
                echo "<tr>
                        <td>{$row['TrainID']}</td>
                        <td>{$row['TrainName']}</td>
                        <td>{$row['Source']}</td>
                        <td>{$row['Destination']}</td>
                        <td>{$row['DepartureTime']}</td>
                        <td>{$row['ArrivalTime']}</td>
                      </tr>";
            }
            echo "</table>";
        } else {
            echo "No trains found for the specified route.";
        }

        $stmt->close();
        $conn->close();
    }
    ?>
</body>
</html>
