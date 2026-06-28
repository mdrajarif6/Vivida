<?php
require_once 'db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['error' => 'Not logged in']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"));
    if (!isset($data->image_url)) {
        echo json_encode(['error' => 'Missing image_url']);
        exit;
    }

    $userId = $_SESSION['user_id'];
    $imageUrl = $data->image_url;

    try {
        $stmt = $pdo->prepare("INSERT INTO user_images (user_id, image_url) VALUES (?, ?)");
        $stmt->execute([$userId, $imageUrl]);
        echo json_encode(['success' => true, 'message' => 'Image saved to gallery']);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Failed to save image']);
    }
}
?>
