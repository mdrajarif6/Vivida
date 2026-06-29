<?php
require_once 'db.php';
require_once 'config.php';
session_start();

// Helper to handle curl requests
function makeApiRequest($url, $post = false, $postFields = [], $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($post) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($postFields) ? http_build_query($postFields) : $postFields);
    }
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

$provider = $_GET['provider'] ?? '';

if (!$provider || !in_array($provider, ['google', 'github', 'facebook'])) {
    die("Invalid provider.");
}

$redirectUri = OAUTH_REDIRECT_BASE . '?provider=' . $provider;

// 1. Initial Redirect to Provider
if (!isset($_GET['code'])) {
    if ($provider === 'google') {
        if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') die("Google Client ID not configured.");
        $authUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" . GOOGLE_CLIENT_ID . "&redirect_uri=" . urlencode($redirectUri) . "&response_type=code&scope=email%20profile";
    } elseif ($provider === 'github') {
        if (GITHUB_CLIENT_ID === 'YOUR_GITHUB_CLIENT_ID') die("GitHub Client ID not configured.");
        $authUrl = "https://github.com/login/oauth/authorize?client_id=" . GITHUB_CLIENT_ID . "&redirect_uri=" . urlencode($redirectUri) . "&scope=user:email";
    } elseif ($provider === 'facebook') {
        if (FACEBOOK_APP_ID === 'YOUR_FACEBOOK_APP_ID') die("Facebook App ID not configured.");
        $authUrl = "https://www.facebook.com/v18.0/dialog/oauth?client_id=" . FACEBOOK_APP_ID . "&redirect_uri=" . urlencode($redirectUri) . "&scope=email,public_profile";
    }
    header("Location: $authUrl");
    exit;
}

// 2. Callback from Provider
$code = $_GET['code'];
$userInfo = null;

if ($provider === 'google') {
    // Exchange code for token
    $tokenResponse = makeApiRequest("https://oauth2.googleapis.com/token", true, [
        'client_id' => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
        'code' => $code
    ]);
    if (isset($tokenResponse['access_token'])) {
        $userInfoResponse = makeApiRequest("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" . $tokenResponse['access_token']);
        $userInfo = [
            'id' => $userInfoResponse['id'],
            'name' => $userInfoResponse['name'],
            'email' => $userInfoResponse['email']
        ];
    }
} elseif ($provider === 'github') {
    // Exchange code for token
    $tokenResponse = makeApiRequest("https://github.com/login/oauth/access_token", true, [
        'client_id' => GITHUB_CLIENT_ID,
        'client_secret' => GITHUB_CLIENT_SECRET,
        'code' => $code,
        'redirect_uri' => $redirectUri
    ], ['Accept: application/json']);
    if (isset($tokenResponse['access_token'])) {
        $userInfoResponse = makeApiRequest("https://api.github.com/user", false, [], [
            "Authorization: Bearer " . $tokenResponse['access_token'],
            "User-Agent: Resizzy-App"
        ]);
        // GitHub might not return email if private, but let's try
        $email = $userInfoResponse['email'] ?? ($userInfoResponse['login'] . '@github.com');
        $userInfo = [
            'id' => $userInfoResponse['id'],
            'name' => $userInfoResponse['name'] ?? $userInfoResponse['login'],
            'email' => $email
        ];
    }
} elseif ($provider === 'facebook') {
    // Exchange code for token
    $tokenResponse = makeApiRequest("https://graph.facebook.com/v18.0/oauth/access_token?client_id=" . FACEBOOK_APP_ID . "&redirect_uri=" . urlencode($redirectUri) . "&client_secret=" . FACEBOOK_APP_SECRET . "&code=" . $code);
    if (isset($tokenResponse['access_token'])) {
        $userInfoResponse = makeApiRequest("https://graph.facebook.com/me?fields=id,name,email&access_token=" . $tokenResponse['access_token']);
        $userInfo = [
            'id' => $userInfoResponse['id'],
            'name' => $userInfoResponse['name'],
            'email' => $userInfoResponse['email'] ?? ($userInfoResponse['id'] . '@facebook.com')
        ];
    }
}

if (!$userInfo) {
    die("Authentication failed. Could not retrieve user info.");
}

// 3. Login or Register the User in our DB
$email = $userInfo['email'];
$oauth_id = $userInfo['id'];
$username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $userInfo['name'])) . rand(100, 999);

// Check if user exists by oauth_id or email
$stmt = $pdo->prepare("SELECT id FROM users WHERE oauth_uid = ? OR email = ?");
$stmt->execute([$oauth_id, $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    // Login
    $_SESSION['user_id'] = $user['id'];
} else {
    // Register
    $stmt = $pdo->prepare("INSERT INTO users (username, email, oauth_provider, oauth_uid) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $provider, $oauth_id]);
    $_SESSION['user_id'] = $pdo->lastInsertId();
}

// Redirect back to app
header("Location: /");
exit;
?>
