<?php
// backend/public/index.php

// 1. Enable CORS (Since you have a React frontend)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");

// 2. Load Dependencies
require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Database;

// 3. Load Env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

// 4. Simple "Express-style" Routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Route Matching
if ($uri === '/api/test' && $method === 'GET') {
    $db = new Database();
    $conn = $db->connect();
    echo json_encode(['message' => 'Connected to MongoDB via PHP!', 'status' => 'success']);
    exit;
}

// 404 Handler
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
