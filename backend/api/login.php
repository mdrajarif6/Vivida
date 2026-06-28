<?php
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->username) || !isset($data->password)) {
        echo json_encode(['error' => 'Missing fields']);
        exit;
    }

    $username = trim($data->username);
    $password = $data->password;

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        
        // Remove password from response
        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['error' => 'Invalid credentials']);
    }
}
?>
