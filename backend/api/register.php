<?php
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->username) || !isset($data->email) || !isset($data->password)) {
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }

    $username = trim($data->username);
    $email = trim($data->email);
    $password = password_hash($data->password, PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $password]);
        echo json_encode(['success' => true, 'message' => 'User registered successfully']);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            echo json_encode(['error' => 'Username or email already exists']);
        } else {
            echo json_encode(['error' => 'Registration failed']);
        }
    }
}
?>
