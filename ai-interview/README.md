# AI Interview Assistant

An interactive web application that conducts AI-powered interviews using OpenAI's GPT-4, Whisper, and Text-to-Speech APIs.

## Features

- **Voice-based Interaction**: Natural conversation with AI using speech recognition and synthesis
- **Real-time Transcription**: See the conversation as it happens
- **Multiple Interview Types**: Job, technical, behavioral, research, and general conversations
- **Customizable Interviewer Styles**: Friendly, professional, formal, or conversational
- **Transcript Export**: Save interviews as text, JSON, or PDF
- **Visual Audio Feedback**: Real-time audio visualization
- **Keyboard Shortcuts**: Space to start/pause, Escape to stop, Ctrl+E to export

## Setup

1. **Get OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com)
   - Generate an API key from your account dashboard

2. **Test the Application**
   - Open `test.html` in a modern browser
   - Run through the compatibility tests
   - Test your API key connection

3. **Launch the Application**
   - Open `index.html`
   - Enter your OpenAI API key when prompted
   - Grant microphone permissions

## Usage

1. **Starting an Interview**
   - Select interview type and style
   - Click "Start Interview" or press Space
   - Wait for the AI to greet you

2. **During the Interview**
   - Speak naturally when the status shows "Listening..."
   - The AI will automatically detect when you stop speaking
   - Your responses and AI replies appear in the transcript

3. **Controlling the Interview**
   - Pause: Click pause button or press Space
   - Resume: Click resume button or press Space
   - End: Click stop button or press Escape

4. **Exporting Transcripts**
   - Click "Export Transcript" or press Ctrl+E
   - Choose format (text, JSON, or PDF)

## Browser Requirements

### Desktop
- Chrome 89+ or Edge 89+
- Firefox 76+
- Safari 14.1+

### Mobile
- **iOS**: Safari 14.1+, Chrome 89+
- **Android**: Chrome 89+, Firefox 88+

### Required Features
- MediaRecorder API
- Web Audio API
- getUserMedia (microphone access)
- Fetch API

### Mobile-Specific Notes
- **iOS**: Works in Safari and Chrome
- **Android**: Works in Chrome and Firefox
- **Microphone permissions**: Must be granted for each session
- **HTTPS required**: Most mobile browsers require secure connection

## Deployment

To deploy to your personal website:

```bash
# Copy all files to your website directory
cp -r * /c/Users/naim.bro.k/naimbro.github.io/ai-interview/

# Navigate to the directory
cd /c/Users/naim.bro.k/naimbro.github.io/

# Add files to git
git add ai-interview/

# Commit and push
git commit -m "Add AI Interview Assistant"
git push
```

The application will be available at: `https://[your-username].github.io/ai-interview/`

## Security Notes

- **API Key Storage**: The API key is stored in browser localStorage for convenience during development. For production, consider implementing a proxy server.
- **HTTPS Required**: The application requires HTTPS for microphone access (GitHub Pages provides this).
- **Rate Limiting**: Built-in rate limiting prevents excessive API usage.

## Troubleshooting

### General Issues
1. **Microphone not working**
   - Check browser permissions
   - Ensure you're using HTTPS
   - Try a different browser

2. **API errors**
   - Verify your API key is valid
   - Check your OpenAI account has credits
   - Ensure you're not hitting rate limits

3. **Audio playback issues**
   - Check system volume
   - Verify no other apps are using the audio device
   - Try refreshing the page

### Mobile-Specific Issues
1. **iPhone/iPad (iOS)**
   - Use Safari or Chrome (latest versions)
   - Grant microphone permission when prompted
   - If audio doesn't work, try toggling airplane mode
   - Close other apps that might use the microphone

2. **Android Phones**
   - Use Chrome or Firefox (latest versions)
   - Check microphone permissions in browser settings
   - Disable battery optimization for the browser
   - Try clearing browser cache if issues persist

3. **Mobile Performance Tips**
   - Close other apps to free memory
   - Use Wi-Fi instead of cellular for better stability
   - Keep screen on during interviews
   - Use "Done Speaking" button if auto-detection fails

## Configuration

Edit `config/settings.js` to customize:
- AI model settings
- Interview prompts
- Audio parameters
- UI behavior
- Rate limits

## Development

The application is built with vanilla JavaScript and no external dependencies. Key modules:

- `audio.js`: Audio recording and visualization
- `openai.js`: OpenAI API integration
- `interview.js`: Interview flow management
- `app.js`: Main application logic
- `utils.js`: Utility functions

## License

This project is for personal use. Please respect OpenAI's usage policies and terms of service.