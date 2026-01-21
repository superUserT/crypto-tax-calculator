<?php
namespace App\Config;

use MongoDB\Client;
use Exception;

class Database {
    public function connect() {
        try {
            $uri = $_ENV['MONGO_URL'] ?? null;
            if (!$uri) throw new Exception("Mongo URL missing");
            
            $client = new Client($uri);
            // Ping to verify
            $client->selectDatabase('admin')->command(['ping' => 1]);
            
            return $client;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
}
