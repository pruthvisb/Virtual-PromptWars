<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!empty($input['author']) && !empty($input['content'])) {
        $post = addPost($input['author'], $input['content']);
        echo json_encode($post);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing author or content']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
