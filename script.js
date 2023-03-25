async function sendMessage() {
  const userInput = document.getElementById('messageInput');
  const chatMessages = document.getElementById('chatMessages');
  const message = userInput.value;
  
  if (message) {
    const userMessage = document.createElement('div');
    userMessage.className = 'userMessage';
    userMessage.innerHTML = message;
    chatMessages.appendChild(userMessage);
    userInput.value = '';
    
    const response = await fetchGPT4Response(message);
    
    const botMessage = document.createElement('div');
    botMessage.className = 'botMessage';
    botMessage.innerHTML = response;
    chatMessages.appendChild(botMessage);
  }
}

async function fetchGPT4Response(message) {
  // Replace with your API Key and endpoint
  const apiKey = 'yourapi-key';
  const apiEndpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + apiKey
  };

  const body = {
    'prompt': 'Translate the following English text to Spanish: ' + message,
    'max_tokens': 50
  };

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });

  const json = await response.json();
  return json.choices[0].text;
}