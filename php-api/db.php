<?php
// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '4000');
define('DB_NAME', getenv('DB_NAME') ?: 'postgres');
define('DB_USER', getenv('DB_USER') ?: 'postgres');
define('DB_PASS', getenv('DB_PASS') ?: '');

$json_db_file = __DIR__ . '/community_data.json';

// Get PDO connection or null
function getPDO() {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    
    try {
        $dsn = "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        
        // Ensure email column exists in profiles table
        try {
            $pdo->query("SELECT email FROM profiles LIMIT 1");
        } catch (PDOException $ex) {
            try {
                $pdo->query("ALTER TABLE profiles ADD COLUMN email VARCHAR(100) UNIQUE");
            } catch (PDOException $alterEx) {}
        }

        // Schema setup: feed applauders
        try {
            $pdo->query("SELECT applauders FROM feed LIMIT 1");
        } catch (PDOException $ex) {
            try {
                $pdo->query("ALTER TABLE feed ADD COLUMN applauders JSONB DEFAULT '[]'::jsonb");
            } catch (PDOException $alterEx) {}
        }

        // Schema setup: friends table
        $pdo->query("CREATE TABLE IF NOT EXISTS friends (
            id SERIAL PRIMARY KEY,
            user_email VARCHAR(100),
            friend_email VARCHAR(100),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Schema setup: direct_messages table
        $pdo->query("CREATE TABLE IF NOT EXISTS direct_messages (
            id SERIAL PRIMARY KEY,
            sender_email VARCHAR(100),
            receiver_email VARCHAR(100),
            message TEXT,
            media_url TEXT DEFAULT '',
            media_type VARCHAR(10) DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // SEEDING POSTGRESQL TABLES (mock seeding disabled)
        return $pdo;
    } catch (PDOException $e) {
        // Silent fail, fallback to JSON
        return null;
    }
}

// Helper: read JSON database
function readJsonDb() {
    global $json_db_file;
    if (!file_exists($json_db_file)) {
        // Seed initial data
        $initialData = [
            'profiles' => [],
            'feed' => [],
            'friends' => [],
            'direct_messages' => []
        ];
        file_put_contents($json_db_file, json_encode($initialData, JSON_PRETTY_PRINT));
    }
    return json_decode(file_read_contents_retry($json_db_file), true);
}

// Retrying helper for file reads to handle race conditions
function file_read_contents_retry($filename) {
    for ($i = 0; $i < 5; $i++) {
        $content = @file_get_contents($filename);
        if ($content !== false) return $content;
        usleep(50000);
    }
    return '{}';
}

// Helper: write JSON database
function writeJsonDb($data) {
    global $json_db_file;
    file_put_contents($json_db_file, json_encode($data, JSON_PRETTY_PRINT));
}

// Get Community Feed
function getFeed() {
    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM feed ORDER BY id DESC");
            $rows = $stmt->fetchAll();
            foreach ($rows as &$row) {
                // Decode comments jsonb
                if (isset($row['comments']) && is_string($row['comments'])) {
                    $row['comments'] = json_decode($row['comments'], true) ?: [];
                }
                // Decode applauders jsonb
                if (isset($row['applauders']) && is_string($row['applauders'])) {
                    $row['applauders'] = json_decode($row['applauders'], true) ?: [];
                } else {
                    $row['applauders'] = [];
                }
                $row['id'] = (int)$row['id'];
                $row['applauds'] = (int)$row['applauds'];
            }
            return $rows;
        } catch (PDOException $e) {
            // Fallback to JSON if table fails
        }
    }
    
    // JSON Fallback
    $db = readJsonDb();
    $feed = $db['feed'];
    // Sort descending by id
    usort($feed, function($a, $b) {
        return $b['id'] - $a['id'];
    });
    return $feed;
}

// Add Feed Post
function addPost($author, $content) {
    $avatar = strtoupper(substr($author, 0, 1));
    $colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
    $avatar_bg = $colors[array_rand($colors)];
    $time = date('c'); // ISO Timestamp

    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO feed (author, avatar, avatar_bg, time, content, applauds, comments, applauders) VALUES (:author, :avatar, :avatar_bg, :time, :content, 0, '[]'::jsonb, '[]'::jsonb) RETURNING *");
            $stmt->execute([
                ':author' => $author,
                ':avatar' => $avatar,
                ':avatar_bg' => $avatar_bg,
                ':time' => $time,
                ':content' => $content
            ]);
            $post = $stmt->fetch();
            $post['comments'] = json_decode($post['comments'], true) ?: [];
            $post['applauders'] = json_decode($post['applauders'], true) ?: [];
            $post['id'] = (int)$post['id'];
            $post['applauds'] = (int)$post['applauds'];

            // Reward user +15 XP in database profile
            $pdo->query("UPDATE profiles SET xp = xp + 15");

            return $post;
        } catch (PDOException $e) {
            // Fallback to JSON
        }
    }

    // JSON Fallback
    $db = readJsonDb();
    $newId = count($db['feed']) > 0 ? max(array_column($db['feed'], 'id')) + 1 : 1;
    $newPost = [
        'id' => $newId,
        'author' => $author,
        'avatar' => $avatar,
        'avatar_bg' => $avatar_bg,
        'time' => $time,
        'content' => $content,
        'applauds' => 0,
        'comments' => [],
        'applauders' => []
    ];
    $db['feed'][] = $newPost;

    // Update user profile in JSON list if exists
    foreach ($db['profiles'] as &$prof) {
        if ($prof['username'] === $author) {
            $prof['xp'] += 15;
            break;
        }
    }
    writeJsonDb($db);
    return $newPost;
}

// Applaud Post (Toggled: 1 per user, can be removed)
function applaudPost($id, $username) {
    $id = (int)$id;
    if (empty($username)) $username = 'anonymous';

    $pdo = getPDO();
    if ($pdo) {
        try {
            // Fetch current applauders
            $stmt = $pdo->prepare("SELECT applauders FROM feed WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row) {
                $applauders = isset($row['applauders']) ? json_decode($row['applauders'], true) ?: [] : [];
                $key = array_search($username, $applauders);
                if ($key !== false) {
                    // Already applauded, remove it (removable)
                    unset($applauders[$key]);
                    $applauders = array_values($applauders);
                } else {
                    // Not applauded yet, add it
                    $applauders[] = $username;
                }
                
                $stmt = $pdo->prepare("UPDATE feed SET applauders = :applauders, applauds = :applauds WHERE id = :id RETURNING *");
                $stmt->execute([
                    ':applauders' => json_encode($applauders),
                    ':applauds' => count($applauders),
                    ':id' => $id
                ]);
                $post = $stmt->fetch();
                $post['comments'] = json_decode($post['comments'], true) ?: [];
                $post['applauders'] = json_decode($post['applauders'], true) ?: [];
                $post['id'] = (int)$post['id'];
                $post['applauds'] = (int)$post['applauds'];
                return $post;
            }
        } catch (PDOException $e) {
            // Fallback to JSON
        }
    }

    // JSON Fallback
    $db = readJsonDb();
    foreach ($db['feed'] as &$post) {
        if ($post['id'] === $id) {
            if (!isset($post['applauders']) || !is_array($post['applauders'])) {
                $post['applauders'] = [];
            }
            $key = array_search($username, $post['applauders']);
            if ($key !== false) {
                unset($post['applauders'][$key]);
                $post['applauders'] = array_values($post['applauders']);
            } else {
                $post['applauders'][] = $username;
            }
            $post['applauds'] = count($post['applauders']);
            writeJsonDb($db);
            return $post;
        }
    }
    return null;
}

// Add Comment
function addComment($postId, $author, $text) {
    $postId = (int)$postId;
    $newComment = ['author' => $author, 'text' => $text];

    $pdo = getPDO();
    if ($pdo) {
        try {
            // Fetch current comments
            $stmt = $pdo->prepare("SELECT comments FROM feed WHERE id = :id");
            $stmt->execute([':id' => $postId]);
            $row = $stmt->fetch();
            if ($row) {
                $comments = json_decode($row['comments'], true) ?: [];
                $comments[] = $newComment;
                
                $stmt = $pdo->prepare("UPDATE feed SET comments = :comments WHERE id = :id RETURNING *");
                $stmt->execute([
                    ':comments' => json_encode($comments),
                    ':id' => $postId
                ]);
                $post = $stmt->fetch();
                $post['comments'] = json_decode($post['comments'], true) ?: [];
                $post['id'] = (int)$post['id'];
                $post['applauds'] = (int)$post['applauds'];
                return $post;
            }
        } catch (PDOException $e) {
            // Fallback to JSON
        }
    }

    // JSON Fallback
    $db = readJsonDb();
    foreach ($db['feed'] as &$post) {
        if ($post['id'] === $postId) {
            $post['comments'][] = $newComment;
            writeJsonDb($db);
            return $post;
        }
    }
    return null;
}

// Get Leaderboard
function getLeaderboard() {
    $pdo = getPDO();
    if ($pdo) {
        try {
            // Dynamic query: get top profiles by XP
            $stmt = $pdo->query("SELECT username, xp, level FROM profiles ORDER BY xp DESC LIMIT 10");
            $rows = $stmt->fetchAll();
            if (count($rows) > 0) {
                return $rows;
            }
        } catch (PDOException $e) {
            // Fallback to JSON
        }
    }

    // JSON Fallback
    $db = readJsonDb();
    $profiles = $db['profiles'];
    // Sort descending by xp
    usort($profiles, function($a, $b) {
        return $b['xp'] - $a['xp'];
    });
    return $profiles;
}

// Search Users
function searchUsers($query, $myEmail) {
    $searchQuery = '%' . strtolower($query) . '%';
    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT email, username, level, xp FROM profiles WHERE (LOWER(username) LIKE :query OR LOWER(email) LIKE :query) AND (email IS NULL OR email != :myEmail) LIMIT 10");
            $stmt->execute([':query' => $searchQuery, ':myEmail' => $myEmail]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    $results = [];
    foreach ($db['profiles'] as $prof) {
        if ($prof['email'] !== $myEmail && (strpos(strtolower($prof['username']), strtolower($query)) !== false || strpos(strtolower($prof['email']), strtolower($query)) !== false)) {
            $results[] = $prof;
        }
    }
    return $results;
}

// Get friendships list
function getFriendships($myEmail) {
    $pdo = getPDO();
    if ($pdo) {
        try {
            // Fetch all request/friend relationships involving myEmail
            $stmt = $pdo->prepare("SELECT * FROM friends WHERE user_email = :email OR friend_email = :email");
            $stmt->execute([':email' => $myEmail]);
            $rows = $stmt->fetchAll();

            $friendsList = [];
            foreach ($rows as $row) {
                $friendEmail = ($row['user_email'] === $myEmail) ? $row['friend_email'] : $row['user_email'];
                
                // Get friend profile details
                $profStmt = $pdo->prepare("SELECT username, level, xp FROM profiles WHERE email = :email");
                $profStmt->execute([':email' => $friendEmail]);
                $prof = $profStmt->fetch();

                if (!$prof) {
                    $name = explode('@', $friendEmail)[0];
                    $prof = ['username' => $name, 'level' => 'Beginner', 'xp' => 0];
                }

                $friendsList[] = [
                    'id' => (int)$row['id'],
                    'user_email' => $row['user_email'],
                    'friend_email' => $row['friend_email'],
                    'status' => $row['status'],
                    'friend_name' => $prof['username'],
                    'friend_level' => $prof['level'],
                    'friend_xp' => (int)$prof['xp']
                ];
            }
            return $friendsList;
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    $friendsList = [];
    $friendsArr = isset($db['friends']) ? $db['friends'] : [];
    foreach ($friendsArr as $row) {
        if ($row['user_email'] === $myEmail || $row['friend_email'] === $myEmail) {
            $friendEmail = ($row['user_email'] === $myEmail) ? $row['friend_email'] : $row['user_email'];
            
            $prof = null;
            foreach ($db['profiles'] as $p) {
                if ($p['email'] === $friendEmail) {
                    $prof = $p;
                    break;
                }
            }

            if (!$prof) {
                $name = explode('@', $friendEmail)[0];
                $prof = ['username' => $name, 'level' => 'Beginner', 'xp' => 0];
            }

            $friendsList[] = [
                'id' => (int)$row['id'],
                'user_email' => $row['user_email'],
                'friend_email' => $row['friend_email'],
                'status' => $row['status'],
                'friend_name' => $prof['username'],
                'friend_level' => $prof['level'],
                'friend_xp' => (int)$prof['xp']
            ];
        }
    }
    return $friendsList;
}

// Send Friend Request
function sendFriendRequest($myEmail, $friendEmail) {
    if ($myEmail === $friendEmail) return null;
    $pdo = getPDO();
    if ($pdo) {
        try {
            $check = $pdo->prepare("SELECT id FROM friends WHERE (user_email = :me AND friend_email = :friend) OR (user_email = :friend AND friend_email = :me)");
            $check->execute([':me' => $myEmail, ':friend' => $friendEmail]);
            if ($check->fetch()) return ['status' => 'exists'];

            $stmt = $pdo->prepare("INSERT INTO friends (user_email, friend_email, status) VALUES (:me, :friend, 'pending') RETURNING *");
            $stmt->execute([':me' => $myEmail, ':friend' => $friendEmail]);
            return $stmt->fetch();
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    if (!isset($db['friends'])) $db['friends'] = [];
    
    foreach ($db['friends'] as $row) {
        if (($row['user_email'] === $myEmail && $row['friend_email'] === $friendEmail) || ($row['user_email'] === $friendEmail && $row['friend_email'] === $myEmail)) {
            return ['status' => 'exists'];
        }
    }

    $newId = count($db['friends']) > 0 ? max(array_column($db['friends'], 'id')) + 1 : 1;
    $newRequest = [
        'id' => $newId,
        'user_email' => $myEmail,
        'friend_email' => $friendEmail,
        'status' => 'pending'
    ];
    $db['friends'][] = $newRequest;
    writeJsonDb($db);
    return $newRequest;
}

// Approve Friend Request
function approveFriendRequest($myEmail, $friendEmail) {
    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("UPDATE friends SET status = 'accepted' WHERE (user_email = :friend AND friend_email = :me) OR (user_email = :me AND friend_email = :friend) RETURNING *");
            $stmt->execute([':me' => $myEmail, ':friend' => $friendEmail]);
            return $stmt->fetch();
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    if (!isset($db['friends'])) $db['friends'] = [];
    foreach ($db['friends'] as &$row) {
        if (($row['user_email'] === $friendEmail && $row['friend_email'] === $myEmail) || ($row['user_email'] === $myEmail && $row['friend_email'] === $friendEmail)) {
            $row['status'] = 'accepted';
            writeJsonDb($db);
            return $row;
        }
    }
    return null;
}

// Get DMs
function getDirectMessages($myEmail, $friendEmail) {
    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM direct_messages WHERE (sender_email = :me AND receiver_email = :friend) OR (sender_email = :friend AND receiver_email = :me) ORDER BY id ASC");
            $stmt->execute([':me' => $myEmail, ':friend' => $friendEmail]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    $dms = isset($db['direct_messages']) ? $db['direct_messages'] : [];
    $filtered = [];
    foreach ($dms as $row) {
        if (($row['sender_email'] === $myEmail && $row['receiver_email'] === $friendEmail) || ($row['sender_email'] === $friendEmail && $row['receiver_email'] === $myEmail)) {
            $filtered[] = $row;
        }
    }
    return $filtered;
}

// Add DM
function addDirectMessage($senderEmail, $receiverEmail, $message, $mediaUrl = '', $mediaType = '') {
    $time = date('c');
    $pdo = getPDO();
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO direct_messages (sender_email, receiver_email, message, media_url, media_type, created_at) VALUES (:sender, :receiver, :message, :media_url, :media_type, :created_at) RETURNING *");
            $stmt->execute([
                ':sender' => $senderEmail,
                ':receiver' => $receiverEmail,
                ':message' => $message,
                ':media_url' => $mediaUrl,
                ':media_type' => $mediaType,
                ':created_at' => $time
            ]);
            return $stmt->fetch();
        } catch (PDOException $e) {}
    }

    // JSON Fallback
    $db = readJsonDb();
    if (!isset($db['direct_messages'])) $db['direct_messages'] = [];
    $newId = count($db['direct_messages']) > 0 ? max(array_column($db['direct_messages'], 'id')) + 1 : 1;
    $newDm = [
        'id' => $newId,
        'sender_email' => $senderEmail,
        'receiver_email' => $receiverEmail,
        'message' => $message,
        'media_url' => $mediaUrl,
        'media_type' => $mediaType,
        'created_at' => $time
    ];
    $db['direct_messages'][] = $newDm;
    writeJsonDb($db);
    return $newDm;
}
