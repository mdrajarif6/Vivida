<?php
// backend/api/config.php

// ----------------------------------------------------
// AI API CONFIGURATIONS
// ----------------------------------------------------

// 1. Remove.bg API Key
// Get a free key from: https://www.remove.bg/api
define('REMOVE_BG_API_KEY', '8yykZ7z9RcGKZSFC1tQRaM8b');

// 2. fal.ai API Key (For AI Upscaling & Image Generation)
// Get an API key from: https://fal.ai/
define('FAL_AI_API_KEY', '29371114-272d-4228-8703-00560b3acf8b:8d174dd70540700abfe8beb613ffc5d7');

// ----------------------------------------------------
// FREE IMAGE HOSTING CONFIG (ImgBB)
// ----------------------------------------------------

// 3. ImgBB API Key (For Free Cloud Saving)
// Get a free key from: https://api.imgbb.com/
define('IMGBB_API_KEY', 'eca0f70b0aeac6e6c8070b9d76e65441');

// ----------------------------------------------------
// OAUTH CONFIGURATIONS (Social Login)
// ----------------------------------------------------

// Base URL for OAuth redirects (Make sure to change this to your actual live domain)
define('OAUTH_REDIRECT_BASE', 'https://resizzy.com/backend/api/oauth.php');

// Google OAuth
// Get API Keys from: https://console.cloud.google.com/apis/credentials
define('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');

// GitHub OAuth
// Get API Keys from: https://github.com/settings/developers
define('GITHUB_CLIENT_ID', 'YOUR_GITHUB_CLIENT_ID');
define('GITHUB_CLIENT_SECRET', 'YOUR_GITHUB_CLIENT_SECRET');

// Facebook OAuth
// Get API Keys from: https://developers.facebook.com/apps/
define('FACEBOOK_APP_ID', 'YOUR_FACEBOOK_APP_ID');
define('FACEBOOK_APP_SECRET', 'YOUR_FACEBOOK_APP_SECRET');

?>
