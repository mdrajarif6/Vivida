<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\Exception\AwsException;

// --- CONFIGURATION ---
// Adobe API Credentials
$ADOBE_CLIENT_ID = "YOUR_CLIENT_ID";
$ADOBE_CLIENT_SECRET = "YOUR_CLIENT_SECRET";

// AWS S3 Credentials
$AWS_KEY = "YOUR_AWS_KEY";
$AWS_SECRET = "YOUR_AWS_SECRET";
$AWS_REGION = "us-east-1";
$AWS_BUCKET = "YOUR_BUCKET_NAME";

// Only proceed if configured
if ($ADOBE_CLIENT_ID === "YOUR_CLIENT_ID" || $AWS_KEY === "YOUR_AWS_KEY") {
    sleep(1);
    echo json_encode([
        'success' => false, 
        'error' => "Please configure Adobe Client ID and AWS S3 keys in adobe_photoshop.php"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$image = $data['image'] ?? null;
$action = $data['action'] ?? null;

if (!$image || !$action) {
    echo json_encode(['success' => false, 'error' => 'No image or action provided']);
    exit;
}

// Extract base64
if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
    $imageData = substr($image, strpos($image, ',') + 1);
    $type = strtolower($type[1]); // jpg, png, gif

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

$s3 = new S3Client([
    'version' => 'latest',
    'region'  => $AWS_REGION,
    'credentials' => [
        'key'    => $AWS_KEY,
        'secret' => $AWS_SECRET,
    ],
]);

$inputKey = "inputs/" . uniqid('img_') . "." . $type;
$outputKey = "outputs/" . uniqid('res_') . ".png";

try {
    // 1. Upload to S3
    $s3->putObject([
        'Bucket' => $AWS_BUCKET,
        'Key'    => $inputKey,
        'Body'   => $imageData,
        'ContentType' => 'image/' . $type
    ]);

    // 2. Generate Presigned URLs
    $cmdIn = $s3->getCommand('GetObject', ['Bucket' => $AWS_BUCKET, 'Key' => $inputKey]);
    $requestIn = $s3->createPresignedRequest($cmdIn, '+1 hour');
    $presignedUrlIn = (string)$requestIn->getUri();

    $cmdOut = $s3->getCommand('PutObject', ['Bucket' => $AWS_BUCKET, 'Key' => $outputKey, 'ContentType' => 'image/png']);
    $requestOut = $s3->createPresignedRequest($cmdOut, '+1 hour');
    $presignedUrlOut = (string)$requestOut->getUri();

    // 3. Get Adobe Access Token
    $ch = curl_init('https://ims-na1.adobelogin.com/ims/token/v3');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => $ADOBE_CLIENT_ID,
        'client_secret' => $ADOBE_CLIENT_SECRET,
        'scope' => 'openid,AdobeID,read_organizations'
    ]));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Adobe Auth Failed: " . $response);
    }
    
    $tokenData = json_decode($response, true);
    $accessToken = $tokenData['access_token'];

    // 4. Call Photoshop API
    $apiPayload = [
        'input' => [
            'href' => $presignedUrlIn,
            'storage' => 'external'
        ],
        'output' => [
            'href' => $presignedUrlOut,
            'storage' => 'external',
            'type' => 'image/png',
            'overwrite' => true
        ]
    ];

    $ch = curl_init('https://image.adobe.io/pie/psdService/cutout');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'x-api-key: ' . $ADOBE_CLIENT_ID,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiPayload));
    
    $res = curl_exec($ch);
    $apiHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($apiHttpCode !== 200 && $apiHttpCode !== 202) {
        throw new Exception("Photoshop API Error: " . $res);
    }

    $jobData = json_decode($res, true);
    $statusUrl = $jobData['_links']['self']['href'] ?? null;

    if (!$statusUrl) {
        throw new Exception("No status URL returned from Adobe");
    }

    // 5. Poll Job Status
    $maxTries = 30; // 30 tries * 2s = 60s
    $completed = false;
    for ($i = 0; $i < $maxTries; $i++) {
        sleep(2);
        
        $ch = curl_init($statusUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'x-api-key: ' . $ADOBE_CLIENT_ID
        ]);
        $statusRes = curl_exec($ch);
        curl_close($ch);
        
        $statusData = json_decode($statusRes, true);
        $status = $statusData['outputs'][0]['status'] ?? 'pending';
        
        if ($status === 'succeeded') {
            $completed = true;
            break;
        } elseif ($status === 'failed') {
            throw new Exception("Adobe job failed.");
        }
    }

    if (!$completed) {
        throw new Exception("Adobe API timeout.");
    }

    // Generate output presigned GET url to send back to frontend
    $cmdFinal = $s3->getCommand('GetObject', ['Bucket' => $AWS_BUCKET, 'Key' => $outputKey]);
    $requestFinal = $s3->createPresignedRequest($cmdFinal, '+1 hour');
    
    echo json_encode([
        'success' => true,
        'url' => (string)$requestFinal->getUri(),
        'message' => 'Background removed successfully.'
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
