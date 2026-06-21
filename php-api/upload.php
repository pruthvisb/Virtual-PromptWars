<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }

    $uploadsDir = __DIR__ . '/uploads';
    if (!file_exists($uploadsDir)) {
        mkdir($uploadsDir, 0777, true);
    }

    $file = $_FILES['file'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    // Sanitize extension to prevent executing php files
    $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'ogg'];
    if (!in_array(strtolower($ext), $allowed_exts)) {
        http_response_code(400);
        echo json_encode(['error' => 'File extension not allowed']);
        exit;
    }

    $newName = uniqid('media_') . '.' . $ext;
    $targetPath = $uploadsDir . '/' . $newName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $publicUrl = 'http://localhost:8000/uploads/' . $newName;
        echo json_encode([
            'url' => $publicUrl,
            'name' => $file['name'],
            'type' => strpos($file['type'], 'video') !== false ? 'video' : 'image'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save file']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
}
