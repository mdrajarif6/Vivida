<?php
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, email, is_pro, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode(['success' => true, 'user' => $user]);
        } else {
            echo json_encode(['error' => 'User not found']);
        }
    } else {
        echo json_encode(['error' => 'Not logged in']);
    }
}
?>
