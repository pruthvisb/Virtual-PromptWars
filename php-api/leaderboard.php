<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $leaderboard = getLeaderboard();
    echo json_encode($leaderboard);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
