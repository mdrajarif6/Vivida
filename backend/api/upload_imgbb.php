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
    echo json_encode(['error' => 'Image data is required']);
    exit;
}

if (!defined('IMGBB_API_KEY') || IMGBB_API_KEY === 'YOUR_IMGBB_API_KEY_HERE') {
    http_response_code(403);
    echo json_encode(['error' => 'ImgBB API Key is missing in config.php']);
    exit;
}

// Extract base64 part
$base64_string = $data['image'];
if (preg_match('/^data:image\/(\w+);base64,/', $base64_string, $type)) {
    $base64_string = substr($base64_string, strpos($base64_string, ',') + 1);
}

$url = 'https://api.imgbb.com/1/upload?key=' . IMGBB_API_KEY;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    'image' => $base64_string
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    $result = json_decode($response, true);
    if (isset($result['data']['url'])) {
        echo json_encode([
            'success' => true,
            'url' => $result['data']['url']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid response from ImgBB']);
    }
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to upload to ImgBB',
        'details' => json_decode($response, true)
    ]);
}
?>
