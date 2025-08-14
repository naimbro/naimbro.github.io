// Main application entry point

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Detect mobile device
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            // Adjust settings for mobile
            CONFIG.audio.silenceDuration = 2000; // Longer silence detection for mobile
            CONFIG.audio.silenceThreshold = -35; // Less sensitive threshold
        }
        
        // Check browser support
        Utils.checkBrowserSupport();
        
        // Get API key
        const apiKey = getApiKey();
        if (!apiKey || !Utils.validateApiKey(apiKey)) {
            throw new Error('Valid OpenAI API key is required');
        }
        
        // Store API key in config
        CONFIG.openai.apiKey = apiKey;
        
        // Initialize interview manager
        window.interviewManager.initialize(apiKey);
        
        // Set up event listeners
        setupEventListeners();
        
        // Test API connection
        const openaiClient = new OpenAIClient(apiKey);
        const isConnected = await openaiClient.testConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to OpenAI API. Please check your API key.');
        }
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showInitializationError(error.message);
    }
});

function setupEventListeners() {
    // Control buttons
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const doneButton = document.getElementById('doneButton');
    
    startButton.addEventListener('click', handleStartInterview);
    pauseButton.addEventListener('click', handlePauseResume);
    stopButton.addEventListener('click', handleStopInterview);
    doneButton.addEventListener('click', handleDoneSpeaking);
    
    // Settings
    const interviewType = document.getElementById('interviewType');
    const interviewerStyle = document.getElementById('interviewerStyle');
    const language = document.getElementById('language');
    
    interviewType.addEventListener('change', (e) => {
        window.interviewManager.setInterviewType(e.target.value);
    });
    
    interviewerStyle.addEventListener('change', (e) => {
        window.interviewManager.setInterviewerStyle(e.target.value);
    });
    
    language.addEventListener('change', (e) => {
        window.interviewManager.setLanguage(e.target.value);
    });
    
    // Transcript controls
    const clearTranscript = document.getElementById('clearTranscript');
    const exportTranscript = document.getElementById('exportTranscript');
    const viewHistory = document.getElementById('viewHistory');
    
    clearTranscript.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the transcript?')) {
            window.interviewManager.clearTranscript();
        }
    });
    
    exportTranscript.addEventListener('click', () => {
        window.interviewManager.exportTranscript();
    });
    
    viewHistory.addEventListener('click', () => {
        showConversationHistory();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

async function handleStartInterview() {
    try {
        // Set interview settings before starting
        const interviewType = document.getElementById('interviewType').value;
        const interviewerStyle = document.getElementById('interviewerStyle').value;
        const language = document.getElementById('language').value;
        
        window.interviewManager.setInterviewType(interviewType);
        window.interviewManager.setInterviewerStyle(interviewerStyle);
        window.interviewManager.setLanguage(language);
        
        // Start the interview
        await window.interviewManager.startInterview();
        
    } catch (error) {
        console.error('Failed to start interview:', error);
        window.interviewManager.showError(error.message);
    }
}

function handlePauseResume() {
    if (window.interviewManager.state === 'paused') {
        window.interviewManager.resumeInterview();
    } else {
        window.interviewManager.pauseInterview();
    }
}

async function handleStopInterview() {
    if (confirm('Are you sure you want to end the interview?')) {
        await window.interviewManager.endInterview();
    }
}

async function handleDoneSpeaking() {
    // Manually trigger the silence callback
    if (window.interviewManager.state === 'recording') {
        await window.interviewManager.processRecording();
    }
}

function handleKeyboardShortcuts(event) {
    // Spacebar to start/pause/resume
    if (event.code === 'Space' && !event.target.matches('input, textarea, select')) {
        event.preventDefault();
        
        switch (window.interviewManager.state) {
            case 'idle':
                handleStartInterview();
                break;
            case 'recording':
            case 'processing':
            case 'speaking':
                handlePauseResume();
                break;
            case 'paused':
                handlePauseResume();
                break;
        }
    }
    
    // Escape to stop
    if (event.code === 'Escape') {
        if (window.interviewManager.state !== 'idle') {
            handleStopInterview();
        }
    }
    
    // Ctrl/Cmd + E to export
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyE') {
        event.preventDefault();
        window.interviewManager.exportTranscript();
    }
}

function showInitializationError(message) {
    const container = document.querySelector('.interview-container');
    container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <h2 style="color: #dc2626; margin-bottom: 1rem;">Initialization Error</h2>
            <p style="color: #64748b; margin-bottom: 2rem;">${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">
                Reload Page
            </button>
        </div>
    `;
}

// Handle page unload to clean up resources
window.addEventListener('beforeunload', () => {
    if (window.audioManager) {
        window.audioManager.cleanup();
    }
});

// Add visual feedback for microphone permission
navigator.permissions.query({ name: 'microphone' }).then((result) => {
    if (result.state === 'denied') {
        showInitializationError('Microphone access is required for this application. Please enable microphone permissions and reload the page.');
    }
    
    result.addEventListener('change', () => {
        if (result.state === 'denied') {
            showInitializationError('Microphone access was denied. Please enable microphone permissions and reload the page.');
        }
    });
}).catch(() => {
    // Permissions API not supported, will handle when getUserMedia is called
});

function showConversationHistory() {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');
    
    // Show modal
    modal.classList.add('show');
    
    // Load conversations
    try {
        const conversations = window.conversationStorage.getAllConversations();
        const stats = window.conversationStorage.getStorageStats();
        
        if (conversations.length === 0) {
            content.innerHTML = `
                <div class="history-empty">
                    <h3>No conversations yet</h3>
                    <p>Your completed interviews will appear here.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="history-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.conversationCount}</div>
                    <div class="stat-label">Conversations</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.totalMessages}</div>
                    <div class="stat-label">Total Messages</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.round(stats.totalDuration / 60)}m</div>
                    <div class="stat-label">Total Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.storageUsed}</div>
                    <div class="stat-label">Storage Used</div>
                </div>
            </div>
        `;
        
        conversations.forEach(conv => {
            const date = new Date(conv.date);
            const duration = Math.round(conv.duration / 60);
            const language = conv.language === 'es' ? 'Español' : 'English';
            
            html += `
                <div class="history-item" onclick="viewConversation('${conv.id}')">
                    <div class="history-item-header">
                        <div class="history-item-date">
                            ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                        </div>
                        <button class="btn-icon" onclick="event.stopPropagation(); deleteConversation('${conv.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                    <div class="history-item-meta">
                        <span>📝 ${conv.messageCount} messages</span>
                        <span>⏱️ ${duration}m</span>
                        <span>🌍 ${language}</span>
                        <span>💼 ${conv.interviewType}</span>
                        <span>🎭 ${conv.interviewerStyle}</span>
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
        
    } catch (error) {
        content.innerHTML = `
            <div class="history-empty">
                <h3>Error loading history</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function viewConversation(conversationId) {
    const conversation = window.conversationStorage.getConversation(conversationId);
    if (conversation) {
        // Export individual conversation
        Utils.exportTranscript(conversation.messages, 'txt');
    }
}

function deleteConversation(conversationId) {
    if (confirm('Are you sure you want to delete this conversation?')) {
        window.conversationStorage.deleteConversation(conversationId);
        showConversationHistory(); // Refresh the list
    }
}

function exportAllHistory() {
    window.conversationStorage.exportAllConversations();
}

function clearAllHistory() {
    if (confirm('Are you sure you want to delete ALL conversation history? This cannot be undone.')) {
        window.conversationStorage.clearAllConversations();
        showConversationHistory(); // Refresh the list
    }
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    modal.classList.remove('show');
}

// Export utility function for debugging
window.debugApp = {
    getState: () => ({
        interviewState: window.interviewManager.state,
        audioReady: window.audioManager.isReady(),
        recordingState: window.audioManager.getRecordingState(),
        messageCount: window.interviewManager.conversationManager?.getMessageCount() || 0
    }),
    
    testAudio: async () => {
        try {
            await window.audioManager.initialize();
            console.log('Audio initialized successfully');
            return true;
        } catch (error) {
            console.error('Audio test failed:', error);
            return false;
        }
    },
    
    testAPI: async () => {
        try {
            const apiKey = CONFIG.openai.apiKey || getApiKey();
            const client = new OpenAIClient(apiKey);
            const connected = await client.testConnection();
            console.log('API connection:', connected ? 'Success' : 'Failed');
            return connected;
        } catch (error) {
            console.error('API test failed:', error);
            return false;
        }
    }
};