<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$prompt = $data['prompt'] ?? '';

if (empty($prompt)) {
    echo json_encode(['error' => 'Prompt is required']);
    exit;
}

// Simulate Meta AI processing delay
sleep(2);

// For mock purposes, return a random image from Unsplash or Picsum
$randomSeed = md5($prompt . time());
$mockImageUrl = "https://picsum.photos/seed/$randomSeed/800/800";

echo json_encode([
    'success' => true,
    'message' => 'Image generated with Meta AI (Mock)',
    'image' => $mockImageUrl
]);
?>
