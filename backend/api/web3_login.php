<?php
require 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->walletAddress)) {
    echo json_encode(["error" => "Wallet address is required"]);
    exit;
}

$walletAddress = strtolower(trim($data->walletAddress));

// In a production environment, you MUST verify the ECDSA signature here 
// using a library like kornrunner/secp256k1 to ensure the user actually owns the wallet.
// For this XAMPP demo, we will trust the address sent by the frontend.

// Generate a secure session token
$sessionToken = bin2hex(random_bytes(32));
$nonce = uniqid('nonce_');

// Check if user exists
$stmt = $pdo->prepare("SELECT * FROM users WHERE wallet_address = :wallet");
$stmt->execute(['wallet' => $walletAddress]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Update existing user with new token
    $updateStmt = $pdo->prepare("UPDATE users SET session_token = :token WHERE id = :id");
    $updateStmt->execute(['token' => $sessionToken, 'id' => $user['id']]);
    
    echo json_encode([
        "success" => true,
        "isNewUser" => false,
        "token" => $sessionToken,
        "isPro" => (bool)$user['is_pro']
    ]);
} else {
    // Create new user
    $insertStmt = $pdo->prepare("INSERT INTO users (wallet_address, nonce, session_token) VALUES (:wallet, :nonce, :token)");
    $insertStmt->execute([
        'wallet' => $walletAddress,
        'nonce' => $nonce,
        'token' => $sessionToken
    ]);
    
    echo json_encode([
        "success" => true,
        "isNewUser" => true,
        "token" => $sessionToken,
        "isPro" => false
    ]);
}
?>
