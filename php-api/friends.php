<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $myEmail = isset($_GET['email']) ? $_GET['email'] : '';

    if (empty($myEmail)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email parameter']);
        exit;
    }

    if ($action === 'search') {
        $q = isset($_GET['q']) ? $_GET['q'] : '';
        $results = searchUsers($q, $myEmail);
        echo json_encode($results);
    } else {
        // Return friendships list
        $list = getFriendships($myEmail);
        echo json_encode($list);
    }
} elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = isset($input['action']) ? $input['action'] : '';
    $myEmail = isset($input['user_email']) ? $input['user_email'] : '';
    $friendEmail = isset($input['friend_email']) ? $input['friend_email'] : '';

    if (empty($myEmail) || empty($friendEmail)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing email parameters']);
        exit;
    }

    if ($action === 'send') {
        $res = sendFriendRequest($myEmail, $friendEmail);
        echo json_encode($res);
    } elseif ($action === 'approve') {
        $res = approveFriendRequest($myEmail, $friendEmail);
        echo json_encode($res);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
