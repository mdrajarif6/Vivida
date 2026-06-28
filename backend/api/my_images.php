<?php
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Not logged in']);
        exit;
    }

    $userId = $_SESSION['user_id'];

    try {
        $stmt = $pdo->prepare("SELECT id, image_url, created_at FROM user_images WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'images' => $images]);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch images']);
    }
}
?>
