// Audio handling module for recording and playback

class AudioManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isRecording = false;
        this.audioChunks = [];
        this.visualizer = null;
        this.silenceDetectionTimer = null;
        this.onSilenceCallback = null;
        this.stream = null;
    }

    async initialize() {
        try {
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Browser does not support audio recording');
            }

            // Mobile-optimized audio constraints
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const audioConstraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: isMobile ? 16000 : CONFIG.audio.sampleRate,
                    // Mobile-specific constraints
                    ...(isMobile && {
                        latency: 0.1,
                        channelCount: 1
                    })
                }
            };

            // Request microphone permission
            this.stream = await navigator.mediaDevices.getUserMedia(audioConstraints);

            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Create analyser for visualization
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = CONFIG.audio.fftSize;
            this.analyser.smoothingTimeConstant = CONFIG.audio.smoothingTimeConstant;

            // Connect microphone to analyser
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.microphone.connect(this.analyser);

            // Initialize visualizer
            this.initializeVisualizer();

            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            throw error;
        }
    }

    initializeVisualizer() {
        const canvas = document.getElementById('visualizerCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(dataArray);

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#2563eb');
                gradient.addColorStop(1, '#1d4ed8');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }

            // Update silence detection
            if (this.isRecording && this.onSilenceCallback) {
                this.detectSilence(dataArray);
            }
        };

        draw();
    }

    detectSilence(dataArray) {
        const audioLevel = Utils.calculateAudioLevel(dataArray);

        // Debug logging (remove in production)
        if (window.debugAudio) {
            console.log(`Audio level: ${audioLevel.toFixed(2)} dB (threshold: ${CONFIG.audio.silenceThreshold} dB)`);
        }

        if (audioLevel < CONFIG.audio.silenceThreshold) {
            if (!this.silenceDetectionTimer) {
                this.silenceDetectionTimer = setTimeout(() => {
                    if (this.onSilenceCallback) {
                        console.log('Silence detected, triggering callback');
                        this.onSilenceCallback();
                    }
                }, CONFIG.audio.silenceDuration);
            }
        } else {
            if (this.silenceDetectionTimer) {
                clearTimeout(this.silenceDetectionTimer);
                this.silenceDetectionTimer = null;
            }
        }
    }

    async startRecording(onSilence) {
        if (this.isRecording) return;

        try {
            this.audioChunks = [];
            this.onSilenceCallback = onSilence;

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: CONFIG.audio.mimeType
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;

            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        if (!this.isRecording) return null;

        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: CONFIG.audio.mimeType });
                this.audioChunks = [];
                this.isRecording = false;
                
                // Clear silence detection
                if (this.silenceDetectionTimer) {
                    clearTimeout(this.silenceDetectionTimer);
                    this.silenceDetectionTimer = null;
                }
                this.onSilenceCallback = null;

                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    async playAudio(audioUrl) {
        const audio = new Audio(audioUrl);
        audio.volume = 0.8;
        
        return new Promise((resolve, reject) => {
            audio.onended = resolve;
            audio.onerror = reject;
            audio.play().catch(reject);
        });
    }

    async playBase64Audio(base64Audio, format = 'mp3') {
        const audioBlob = Utils.base64ToBlob(base64Audio, `audio/${format}`);
        const audioUrl = URL.createObjectURL(audioBlob);
        
        try {
            await this.playAudio(audioUrl);
        } finally {
            URL.revokeObjectURL(audioUrl);
        }
    }

    pauseRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
        }
    }

    resumeRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
        }
    }

    async convertBlobToWav(blob) {
        // For Whisper API, we might need to convert to WAV format
        // This is a simplified version - in production, use a proper audio conversion library
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create WAV file
        const length = audioBuffer.length * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, audioBuffer.sampleRate, true);
        view.setUint32(28, audioBuffer.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Convert float samples to 16-bit PCM
        const channelData = audioBuffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < channelData.length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    }

    cleanup() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        if (this.silenceDetectionTimer) {
            clearTimeout(this.silenceDetectionTimer);
        }
    }

    getRecordingState() {
        return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
    }

    isReady() {
        return this.stream && this.audioContext && this.mediaRecorder;
    }
}

// Create global instance
window.audioManager = new AudioManager();