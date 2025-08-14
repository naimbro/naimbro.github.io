// Interview flow management module

class InterviewManager {
    constructor() {
        this.state = 'idle'; // idle, recording, processing, speaking, paused, ended
        this.openaiClient = null;
        this.conversationManager = null;
        this.currentAudioUrl = null;
        this.autoStopTimer = null;
        this.language = 'en'; // default language
        this.sessionStartTime = null;
    }

    initialize(apiKey) {
        this.openaiClient = new OpenAIClient(apiKey);
        this.conversationManager = new ConversationManager(this.openaiClient);
    }

    async startInterview() {
        try {
            this.setState('processing');
            this.sessionStartTime = new Date();
            
            // Initialize audio if not already done
            if (!window.audioManager.isReady()) {
                await window.audioManager.initialize();
            }

            // Start with welcome message
            const welcomeMessage = CONFIG.interview.defaultMessages[this.language].welcome;
            this.updateTranscript('AI', welcomeMessage);
            
            // Generate speech for welcome message
            const audioUrl = await this.openaiClient.generateSpeech(welcomeMessage);
            this.currentAudioUrl = audioUrl;
            
            // Play welcome message
            this.setState('speaking');
            await window.audioManager.playAudio(audioUrl);
            
            // Clean up audio URL
            URL.revokeObjectURL(audioUrl);
            this.currentAudioUrl = null;
            
            // Start listening
            await this.startListening();
            
        } catch (error) {
            console.error('Failed to start interview:', error);
            this.showError(error.message);
            this.setState('idle');
        }
    }

    async startListening() {
        this.setState('recording');
        
        // Start recording with silence detection
        await window.audioManager.startRecording(async () => {
            // On silence detected, process the recording
            await this.processRecording();
        });
    }

    async processRecording() {
        try {
            this.setState('processing');
            
            // Stop recording and get audio
            const audioBlob = await window.audioManager.stopRecording();
            
            if (!audioBlob || audioBlob.size === 0) {
                // If no audio, restart listening
                await this.startListening();
                return;
            }
            
            // Transcribe audio with the selected language
            const transcription = await this.openaiClient.transcribeAudio(audioBlob, this.language);
            
            if (!transcription || transcription.trim() === '') {
                // If no transcription, restart listening
                await this.startListening();
                return;
            }
            
            // Update transcript with user input
            this.updateTranscript('You', transcription);
            
            // Generate AI response
            const aiResponse = await this.conversationManager.processUserInput(transcription);
            
            // Update transcript with AI response
            this.updateTranscript('AI', aiResponse);
            
            // Generate speech
            const audioUrl = await this.openaiClient.generateSpeech(aiResponse);
            this.currentAudioUrl = audioUrl;
            
            // Play AI response
            this.setState('speaking');
            await window.audioManager.playAudio(audioUrl);
            
            // Clean up
            URL.revokeObjectURL(audioUrl);
            this.currentAudioUrl = null;
            
            // Continue listening if interview is still active
            if (this.state !== 'ended' && this.state !== 'paused') {
                await this.startListening();
            }
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showError(error.message);
            
            // Try to recover by restarting listening
            if (this.state !== 'ended') {
                await this.startListening();
            }
        }
    }

    pauseInterview() {
        if (this.state === 'recording') {
            window.audioManager.pauseRecording();
        }
        this.setState('paused');
    }

    async resumeInterview() {
        if (this.state === 'paused') {
            await this.startListening();
        }
    }

    async endInterview() {
        this.setState('ended');
        
        // Stop any ongoing recording
        if (window.audioManager.isRecording) {
            await window.audioManager.stopRecording();
        }
        
        // Clean up audio resources
        window.audioManager.cleanup();
        
        // Generate farewell message
        try {
            const farewellMessage = CONFIG.interview.defaultMessages[this.language].ending;
            this.updateTranscript('AI', farewellMessage);
            
            const audioUrl = await this.openaiClient.generateSpeech(farewellMessage);
            await window.audioManager.playAudio(audioUrl);
            URL.revokeObjectURL(audioUrl);
        } catch (error) {
            console.error('Error playing farewell message:', error);
        }
        
        // Save conversation before ending
        await this.saveConversation();
        
        this.setState('idle');
    }

    async saveConversation() {
        try {
            const messages = this.conversationManager.getConversationHistory();
            if (messages.length > 0) {
                const duration = this.sessionStartTime ? 
                    (new Date() - this.sessionStartTime) / 1000 : 0;
                
                const conversationData = {
                    messages: messages,
                    language: this.language,
                    interviewType: this.conversationManager.interviewType,
                    interviewerStyle: this.conversationManager.interviewerStyle,
                    duration: Math.round(duration),
                    metadata: {
                        startTime: this.sessionStartTime?.toISOString(),
                        endTime: new Date().toISOString()
                    }
                };
                
                const conversationId = window.conversationStorage.saveConversation(conversationData);
                console.log(`Conversation saved with ID: ${conversationId}`);
                return conversationId;
            }
        } catch (error) {
            console.error('Failed to save conversation:', error);
        }
    }

    setState(newState) {
        this.state = newState;
        this.updateUI(newState);
    }

    updateUI(state) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = statusIndicator.querySelector('.status-text');
        const startButton = document.getElementById('startButton');
        const pauseButton = document.getElementById('pauseButton');
        const stopButton = document.getElementById('stopButton');
        
        // Remove all state classes
        statusIndicator.className = 'status-indicator';
        
        switch (state) {
            case 'idle':
                statusIndicator.classList.add('ready');
                statusText.textContent = 'Ready to start';
                startButton.disabled = false;
                pauseButton.disabled = true;
                stopButton.disabled = true;
                document.getElementById('doneButton').style.display = 'none';
                break;
                
            case 'recording':
                statusIndicator.classList.add('recording');
                statusText.textContent = 'Listening...';
                startButton.disabled = true;
                pauseButton.disabled = false;
                stopButton.disabled = false;
                document.getElementById('doneButton').style.display = 'inline-flex';
                break;
                
            case 'processing':
                statusIndicator.classList.add('processing');
                statusText.textContent = 'Processing...';
                startButton.disabled = true;
                pauseButton.disabled = true;
                stopButton.disabled = false;
                document.getElementById('doneButton').style.display = 'none';
                break;
                
            case 'speaking':
                statusIndicator.classList.add('processing');
                statusText.textContent = 'AI is speaking...';
                startButton.disabled = true;
                pauseButton.disabled = true;
                stopButton.disabled = false;
                document.getElementById('doneButton').style.display = 'none';
                break;
                
            case 'paused':
                statusIndicator.classList.add('ready');
                statusText.textContent = 'Paused';
                startButton.disabled = true;
                pauseButton.disabled = false;
                pauseButton.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    Resume
                `;
                stopButton.disabled = false;
                document.getElementById('doneButton').style.display = 'none';
                break;
                
            case 'ended':
                statusIndicator.classList.add('ready');
                statusText.textContent = 'Interview ended';
                startButton.disabled = false;
                pauseButton.disabled = true;
                stopButton.disabled = true;
                pauseButton.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="10" y1="15" x2="10" y2="9"/>
                        <line x1="14" y1="15" x2="14" y2="9"/>
                    </svg>
                    Pause
                `;
                document.getElementById('doneButton').style.display = 'none';
                break;
        }
    }

    updateTranscript(speaker, text) {
        const transcriptContent = document.getElementById('transcriptContent');
        const placeholder = transcriptContent.querySelector('.transcript-placeholder');
        
        // Remove placeholder if exists
        if (placeholder) {
            placeholder.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `transcript-message ${speaker === 'AI' ? 'ai' : 'user'}`;
        
        const speakerDiv = document.createElement('div');
        speakerDiv.className = 'speaker';
        speakerDiv.textContent = speaker;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'text';
        textDiv.textContent = text;
        
        messageDiv.appendChild(speakerDiv);
        messageDiv.appendChild(textDiv);
        
        transcriptContent.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        if (CONFIG.ui.autoScroll) {
            Utils.scrollToBottom(transcriptContent);
        }
        
        // Limit transcript length
        const messages = transcriptContent.querySelectorAll('.transcript-message');
        if (messages.length > CONFIG.ui.maxTranscriptLength) {
            messages[0].remove();
        }
    }

    clearTranscript() {
        const transcriptContent = document.getElementById('transcriptContent');
        transcriptContent.innerHTML = '<p class="transcript-placeholder">Your conversation will appear here...</p>';
        this.conversationManager.clearConversation();
    }

    exportTranscript() {
        const messages = this.conversationManager.getConversationHistory();
        if (messages.length === 0) {
            this.showError('No transcript to export');
            return;
        }
        
        Utils.exportTranscript(messages, 'txt');
    }

    setInterviewType(type) {
        this.conversationManager.setInterviewType(type);
    }

    setInterviewerStyle(style) {
        this.conversationManager.setInterviewerStyle(style);
    }

    setLanguage(language) {
        this.language = language;
        this.conversationManager.setLanguage(language);
    }

    showError(message) {
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorModal.classList.add('show');
    }
}

// Create global instance
window.interviewManager = new InterviewManager();

// Global functions for modals
window.closeErrorModal = function() {
    const errorModal = document.getElementById('errorModal');
    errorModal.classList.remove('show');
};

// History modal functions will be defined in app.js