<?php
require 'db.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->token) || !isset($data->txHash)) {
    echo json_encode(["error" => "Token and txHash are required"]);
    exit;
}

$token = $data->token;
$txHash = $data->txHash;

// In a real production application, you MUST verify the txHash using an RPC node 
// (e.g. Infura/Alchemy) or a blockchain explorer API (e.g. Polygonscan) 
// to ensure the transaction was successful and the amount/recipient are correct!
//
// For this XAMPP demo, we will trust the hash provided by the frontend.

try {
    // Find user by session token
    $stmt = $pdo->prepare("SELECT id FROM users WHERE session_token = :token");
    $stmt->execute(['token' => $token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Upgrade user to PRO
        $updateStmt = $pdo->prepare("UPDATE users SET is_pro = 1 WHERE id = :id");
        $updateStmt->execute(['id' => $user['id']]);
        
        echo json_encode(["success" => true, "message" => "Account upgraded to PRO!"]);
    } else {
        echo json_encode(["error" => "Invalid session token"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
