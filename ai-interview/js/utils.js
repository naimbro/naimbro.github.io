// Utility functions for the AI Interview Assistant

const Utils = {
    // Debounce function to limit API calls
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format timestamp for display
    formatTimestamp(date = new Date()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // Convert audio blob to base64
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    // Convert base64 to blob
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    },

    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Export transcript to different formats
    exportTranscript(messages, format = 'txt') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `interview-transcript-${timestamp}`;

        switch (format) {
            case 'txt':
                return this.exportAsText(messages, filename);
            case 'json':
                return this.exportAsJSON(messages, filename);
            case 'pdf':
                return this.exportAsPDF(messages, filename);
            default:
                throw new Error('Unsupported export format');
        }
    },

    exportAsText(messages, filename) {
        let content = 'AI Interview Transcript\n';
        content += '========================\n\n';
        content += `Date: ${new Date().toLocaleString()}\n\n`;
        content += '------------------------\n\n';

        messages.forEach(msg => {
            content += `${msg.speaker.toUpperCase()} [${msg.timestamp}]:\n`;
            content += `${msg.text}\n\n`;
        });

        this.downloadFile(content, `${filename}.txt`, 'text/plain');
    },

    exportAsJSON(messages, filename) {
        const data = {
            title: 'AI Interview Transcript',
            date: new Date().toISOString(),
            messages: messages
        };

        const content = JSON.stringify(data, null, 2);
        this.downloadFile(content, `${filename}.json`, 'application/json');
    },

    exportAsPDF(messages, filename) {
        // For PDF export, we'll create a simple HTML and let the browser handle printing
        // In a production app, you'd use a library like jsPDF
        let html = `
            <html>
            <head>
                <title>Interview Transcript</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    h1 { color: #333; }
                    .meta { color: #666; margin-bottom: 20px; }
                    .message { margin-bottom: 20px; }
                    .speaker { font-weight: bold; color: #2563eb; }
                    .timestamp { color: #999; font-size: 0.9em; }
                    .text { margin-top: 5px; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <h1>AI Interview Transcript</h1>
                <div class="meta">Date: ${new Date().toLocaleString()}</div>
                <hr>
        `;

        messages.forEach(msg => {
            html += `
                <div class="message">
                    <div class="speaker">${msg.speaker.toUpperCase()} 
                        <span class="timestamp">[${msg.timestamp}]</span>
                    </div>
                    <div class="text">${msg.text}</div>
                </div>
            `;
        });

        html += '</body></html>';

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Check if browser supports required APIs
    checkBrowserSupport() {
        const required = {
            'MediaRecorder': typeof MediaRecorder !== 'undefined',
            'getUserMedia': navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
            'AudioContext': typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined',
            'Fetch API': typeof fetch !== 'undefined',
            'Web Audio API': 'AudioContext' in window || 'webkitAudioContext' in window
        };

        const unsupported = Object.entries(required)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            throw new Error(`Your browser doesn't support: ${unsupported.join(', ')}`);
        }

        return true;
    },

    // Rate limiting helper
    createRateLimiter(maxRequests, windowMs) {
        const requests = [];
        
        return {
            canMakeRequest() {
                const now = Date.now();
                const windowStart = now - windowMs;
                
                // Remove old requests outside the window
                while (requests.length > 0 && requests[0] < windowStart) {
                    requests.shift();
                }
                
                if (requests.length < maxRequests) {
                    requests.push(now);
                    return true;
                }
                
                return false;
            },
            
            getRemainingTime() {
                if (requests.length === 0) return 0;
                const oldestRequest = requests[0];
                const timeUntilReset = (oldestRequest + windowMs) - Date.now();
                return Math.max(0, timeUntilReset);
            }
        };
    },

    // Smooth scroll to bottom of element
    scrollToBottom(element, smooth = true) {
        element.scrollTo({
            top: element.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Parse and validate API key
    validateApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== 'string') {
            return false;
        }
        
        // Basic OpenAI API key format validation
        return apiKey.startsWith('sk-') && apiKey.length > 20;
    },

    // Calculate audio level in dB
    calculateAudioLevel(dataArray) {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = 20 * Math.log10(rms);
        return db;
    },

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

// Make Utils available globally
window.Utils = Utils;