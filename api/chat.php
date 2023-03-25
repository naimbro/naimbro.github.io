<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['message'])) {
    $message = $_POST['message'];
    $apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions';
    $apiKey = 'your_api_key_here'; // Replace with your OpenAI API key

    $data = [
        'prompt' => $message,
        'max_tokens' => 50
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\n".
                         "Authorization: Bearer $apiKey\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];

    $context  = stream_context_create($options);
    $result = file_get_contents($apiUrl, false, $context);

    if ($result !== false) {
        echo $result;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'An error occurred while connecting to the API']);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
}
?>