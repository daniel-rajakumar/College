<!DOCTYPE html>
<html>
<body>
    <h1 style="text-align: center;">Train Schedule Search</h1>
    <form method="POST" action="">
        <label for="source">Source Station:</label>
        <input type="text" id="source" name="source" required><br><br>
        <label for="destination">Destination Station:</label>
        <input type="text" id="destination" name="destination" required><br><br>
        <input type="submit" value="Search">
    </form>

<?php

$conn = new mysqli("localhost:3306", "root", "password", "TrainScheduler");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $source = $_POST['source'];
    $destination = $_POST['destination'];

    echo "Search Results";

    $query = "SELECT * FROM Trains WHERE Source = ? AND Destination = ?";
    $statement = $conn->prepare($query);
    $statement->bind_param("ss", $source, $destination);
    $statement->execute();
    $result = $statement->get_result();

    if ($result->num_rows > 0) {
        echo "<table>
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
        echo "No direct trains available.";
    }

    function findConnections($source, $destination, $conn) {
        $startQuery = "SELECT * FROM Trains WHERE Source = ?";
        $statement1 = $conn->prepare($startQuery);
        $statement1->bind_param("s", $source);
        $statement1->execute();
        $startResult = $statement1->get_result();

        $endQuery = "SELECT * FROM Trains WHERE Destination = ?";
        $statement2 = $conn->prepare($endQuery);
        $statement2->bind_param("s", $destination);
        $statement2->execute();
        $endResult = $statement2->get_result();

        $connections = [];
        while ($start = $startResult->fetch_assoc()) {
            while ($end = $endResult->fetch_assoc()) {
                if ($start['Destination'] == $end['Source']) {
                    $connections[] = [$start, $end];
                }
            }
        }
        return $connections;
    }

    if ($result->num_rows == 0) {
        $connections = findConnections($source, $destination, $conn);

        if (count($connections) > 0) {
            echo "Alternative Routes:";
            echo "<ul>";
            foreach ($connections as $connection) {
                echo "<li>
                        Take Train #{$connection[0]['TrainID']} ({$connection[0]['TrainName']}) 
                        from {$connection[0]['Source']} to {$connection[0]['Destination']}, 
                        then Train #{$connection[1]['TrainID']} ({$connection[1]['TrainName']}) 
                        from {$connection[1]['Source']} to {$connection[1]['Destination']}
                      </li>";
            }
            echo "</ul>";
        } else {
            echo "No alternative routes available.";
        }
    }

    $statement->close();
}
$conn->close();
?>
</body>
</html>
