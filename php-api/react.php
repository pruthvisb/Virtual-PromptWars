<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!empty($input['id'])) {
        $username = isset($input['username']) ? $input['username'] : '';
        $post = applaudPost($input['id'], $username);
        if ($post) {
            echo json_encode($post);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing post id']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
