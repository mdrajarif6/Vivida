<?php
header('Content-Type: application/json');
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$image = $data['image'] ?? '';

if (empty($image)) {
    echo json_encode(['error' => 'Image data is required']);
    exit;
}

// Simulate Meta SAM processing delay
sleep(2);

// For mock purposes, just returning the original image.
// In a real app, this would send the image to Meta SAM API or run the ONNX model locally.
echo json_encode([
    'success' => true,
    'message' => 'Processed with Meta Segment Anything Model (Mock)',
    'image' => $image 
]);
?>
