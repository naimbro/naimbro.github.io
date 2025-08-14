// OpenAI API integration module

class OpenAIClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = CONFIG.openai.apiEndpoint;
        this.rateLimiter = Utils.createRateLimiter(
            CONFIG.rateLimit.maxRequestsPerMinute,
            CONFIG.rateLimit.cooldownPeriod
        );
    }

    async makeRequest(endpoint, options) {
        // Check rate limiting
        if (!this.rateLimiter.canMakeRequest()) {
            const waitTime = this.rateLimiter.getRemainingTime();
            throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
        }

        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('OpenAI API request failed:', error);
            throw error;
        }
    }

    async transcribeAudio(audioBlob, language = 'en') {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', CONFIG.openai.models.transcription);
        
        // Map our language codes to Whisper language codes
        const whisperLangMap = {
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'zh': 'zh'
        };
        formData.append('language', whisperLangMap[language] || 'en');

        try {
            const response = await fetch(`${this.baseURL}/audio/transcriptions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Transcription failed');
            }

            const result = await response.json();
            return result.text;
        } catch (error) {
            console.error('Transcription error:', error);
            throw error;
        }
    }

    async generateResponse(messages, interviewType, interviewerStyle) {
        // Build system prompt
        const systemPrompt = this.buildSystemPrompt(interviewType, interviewerStyle);
        
        const requestBody = {
            model: CONFIG.openai.models.chat,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: CONFIG.openai.maxTokens,
            temperature: CONFIG.openai.temperature,
            stream: false
        };

        const response = await this.makeRequest('/chat/completions', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });

        return response.choices[0].message.content;
    }

    async generateSpeech(text) {
        const requestBody = {
            model: CONFIG.openai.models.tts,
            input: text,
            voice: CONFIG.openai.models.ttsVoice,
            speed: CONFIG.openai.audioSpeed,
            response_format: CONFIG.openai.audioFormat
        };

        try {
            const response = await fetch(`${this.baseURL}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Speech generation failed');
            }

            // Get audio data as blob
            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);
        } catch (error) {
            console.error('Speech generation error:', error);
            throw error;
        }
    }

    buildSystemPrompt(interviewType, interviewerStyle, language = 'en') {
        const prompts = CONFIG.interview.systemPrompts[language] || CONFIG.interview.systemPrompts.en;
        const basePrompt = prompts[interviewType] || prompts.general;
        const styleModifier = CONFIG.interview.styleModifiers[interviewerStyle] || CONFIG.interview.styleModifiers.professional;
        
        return `${basePrompt}\n\nStyle guidance: ${styleModifier}\n\nIMPORTANT: Keep your responses concise and natural for spoken conversation. Aim for responses that take 15-30 seconds to speak.`;
    }

    async testConnection() {
        try {
            const response = await this.makeRequest('/models', {
                method: 'GET'
            });
            return response.data && response.data.length > 0;
        } catch (error) {
            return false;
        }
    }
}

// Create conversation manager
class ConversationManager {
    constructor(openaiClient) {
        this.openaiClient = openaiClient;
        this.messages = [];
        this.interviewType = 'general';
        this.interviewerStyle = 'professional';
        this.language = 'en';
    }

    setInterviewType(type) {
        this.interviewType = type;
        this.messages = []; // Reset conversation when changing type
    }

    setInterviewerStyle(style) {
        this.interviewerStyle = style;
    }

    setLanguage(language) {
        this.language = language;
    }

    addMessage(role, content) {
        this.messages.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });
    }

    async processUserInput(transcription) {
        // Add user message
        this.addMessage('user', transcription);
        
        // Build system prompt with language
        const systemPrompt = this.openaiClient.buildSystemPrompt(
            this.interviewType,
            this.interviewerStyle,
            this.language
        );
        
        // Generate AI response
        const requestBody = {
            model: CONFIG.openai.models.chat,
            messages: [
                { role: 'system', content: systemPrompt },
                ...this.messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: CONFIG.openai.maxTokens,
            temperature: CONFIG.openai.temperature,
            stream: false
        };

        const response = await this.openaiClient.makeRequest('/chat/completions', {
            method: 'POST',
            body: JSON.stringify(requestBody)
        });

        const aiResponse = response.choices[0].message.content;
        
        // Add AI response
        this.addMessage('assistant', aiResponse);
        
        return aiResponse;
    }

    getConversationHistory() {
        return this.messages.map(msg => ({
            speaker: msg.role === 'user' ? 'You' : 'AI',
            text: msg.content,
            timestamp: Utils.formatTimestamp(new Date(msg.timestamp))
        }));
    }

    clearConversation() {
        this.messages = [];
    }

    getLastMessage() {
        return this.messages[this.messages.length - 1];
    }

    getMessageCount() {
        return this.messages.length;
    }
}

// Export for global use
window.OpenAIClient = OpenAIClient;
window.ConversationManager = ConversationManager;