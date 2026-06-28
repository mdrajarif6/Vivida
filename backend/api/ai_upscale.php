<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Image base64 data is required']);
    exit;
}

if (FAL_AI_API_KEY === 'YOUR_FAL_AI_API_KEY_HERE' || empty(FAL_AI_API_KEY)) {
    http_response_code(403);
    echo json_encode(['error' => 'API Key is missing. Please add your Fal.ai API key to config.php']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://fal.run/fal-ai/aura-sr');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

$post = array(
    'image_url' => $data['image'] // Fal.ai accepts data URI directly
);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post));

$headers = array();
$headers[] = 'Authorization: Key ' . FAL_AI_API_KEY;
$headers[] = 'Content-Type: application/json';
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => curl_error($ch)]);
    exit;
}
curl_close($ch);

if ($http_code == 200) {
    $response_data = json_decode($result, true);
    if (isset($response_data['image']['url'])) {
        echo json_encode(['success' => true, 'url' => $response_data['image']['url']]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid response from fal.ai', 'details' => $response_data]);
    }
} else {
    http_response_code($http_code);
    echo json_encode(['error' => 'fal.ai API failed', 'details' => json_decode($result, true)]);
}
?>
