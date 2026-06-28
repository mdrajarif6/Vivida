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

if (REMOVE_BG_API_KEY === 'YOUR_REMOVE_BG_API_KEY_HERE' || empty(REMOVE_BG_API_KEY)) {
    http_response_code(403);
    echo json_encode(['error' => 'API Key is missing. Please add your Remove.bg API key to config.php']);
    exit;
}

// Clean the base64 string
$base64_string = $data['image'];
if (strpos($base64_string, ',') !== false) {
    $base64_string = explode(',', $base64_string)[1];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.remove.bg/v1.0/removebg');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
$post = array(
    'image_file_b64' => $base64_string,
    'size' => 'auto'
);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

$headers = array();
$headers[] = 'X-Api-Key: ' . REMOVE_BG_API_KEY;
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
    // Result is binary image data
    $base64_result = 'data:image/png;base64,' . base64_encode($result);
    echo json_encode(['success' => true, 'image' => $base64_result]);
} else {
    http_response_code($http_code);
    echo json_encode(['error' => 'Remove.bg API failed', 'details' => json_decode($result, true)]);
}
?>
