<!-- 
 
Q1: Create a simple bank account management system using PHP and MySQL. Design a MySQL database schema that can store information about bank accounts,
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title> Test 3 </title>
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
        // Database connection
        $conn = new mysqli("localhost:3306", "root", "password", "TrainScheduler");

        // Check connection
        if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
        }

        // Create database schema
        $sql = "CREATE TABLE IF NOT EXISTS accounts (
          id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          account_number VARCHAR(30) NOT NULL,
          account_holder VARCHAR(50) NOT NULL,
          balance DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";

        if ($conn->query($sql) === TRUE) {
          echo "Table accounts created successfully";
        } else {
          echo "Error creating table: " . $conn->error;
        }

        // Close connection
        $conn->close();
    ?>

</body>
</html>
