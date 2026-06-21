<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $myEmail = isset($_GET['email']) ? $_GET['email'] : '';
    $friendEmail = isset($_GET['friend']) ? $_GET['friend'] : '';

    if (empty($myEmail) || empty($friendEmail)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email parameters']);
        exit;
    }

    $dms = getDirectMessages($myEmail, $friendEmail);
    echo json_encode($dms);
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $sender = isset($input['sender_email']) ? $input['sender_email'] : '';
    $receiver = isset($input['receiver_email']) ? $input['receiver_email'] : '';
    $message = isset($input['message']) ? $input['message'] : '';
    $mediaUrl = isset($input['media_url']) ? $input['media_url'] : '';
    $mediaType = isset($input['media_type']) ? $input['media_type'] : '';

    if (empty($sender) || empty($receiver)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing sender or receiver email']);
        exit;
    }

    $res = addDirectMessage($sender, $receiver, $message, $mediaUrl, $mediaType);
    echo json_encode($res);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
