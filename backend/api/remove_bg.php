<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- CONFIGURATION ---
// Remove.bg API Key
$REMOVE_BG_API_KEY = "YOUR_REMOVE_BG_API_KEY";

if ($REMOVE_BG_API_KEY === "YOUR_REMOVE_BG_API_KEY") {
    sleep(1);
    echo json_encode([
        'success' => false, 
        'error' => "Please configure your Remove.bg API key in backend/api/remove_bg.php"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$image = $data['image'] ?? null;

if (!$image) {
    echo json_encode(['success' => false, 'error' => 'No image provided']);
    exit;
}

// Extract base64
if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
    $imageData = substr($image, strpos($image, ',') + 1);
    $type = strtolower($type[1]);

    if (!in_array($type, ['jpg', 'jpeg', 'png', 'gif'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid image type']);
        exit;
    }
    $imageData = base64_decode($imageData);
    if ($imageData === false) {
        echo json_encode(['success' => false, 'error' => 'Base64 decode failed']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Image data must be base64']);
    exit;
}

// Send to Remove.bg API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.remove.bg/v1.0/removebg");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);

// We need to send it as multipart/form-data
// PHP 5.5+ allows CURLFile
$tmpFile = tempnam(sys_get_temp_dir(), 'img_') . '.' . $type;
file_put_contents($tmpFile, $imageData);

$cfile = new CURLFile($tmpFile, 'image/' . $type, 'image.' . $type);
$postData = array(
    'image_file' => $cfile,
    'size' => 'auto'
);

curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "X-Api-Key: " . $REMOVE_BG_API_KEY
));

$result = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

unlink($tmpFile); // Cleanup

if ($httpcode == 200) {
    // Result is binary image data
    $base64Result = 'data:image/png;base64,' . base64_encode($result);
    echo json_encode([
        'success' => true,
        'url' => $base64Result,
        'message' => 'Background removed successfully via Remove.bg'
    ]);
} else {
    $errData = json_decode($result, true);
    $errMsg = $errData['errors'][0]['title'] ?? $error ?? 'Unknown error';
    echo json_encode([
        'success' => false,
        'error' => "Remove.bg API Error: " . $errMsg
    ]);
}
?>
