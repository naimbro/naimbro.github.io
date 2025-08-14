const CONFIG = {
    openai: {
        apiKey: '', // Will be loaded from environment or prompt
        apiEndpoint: 'https://api.openai.com/v1',
        
        // Model configurations
        models: {
            chat: 'gpt-4-turbo-preview',
            transcription: 'whisper-1',
            tts: 'tts-1',
            ttsVoice: 'alloy' // Options: alloy, echo, fable, onyx, nova, shimmer
        },
        
        // Request settings
        maxTokens: 1000,
        temperature: 0.7,
        
        // Audio settings
        audioFormat: 'mp3',
        audioSpeed: 1.0
    },
    
    interview: {
        // System prompts for different interview types
        systemPrompts: {
            en: {
                general: `You are a friendly and professional AI interviewer conducting a general conversation. 
                         Your goal is to have a natural, engaging dialogue while learning about the person you're speaking with. 
                         Ask thoughtful follow-up questions based on their responses. Keep your responses concise and conversational.`,
                
                job: `You are an experienced HR interviewer conducting a job interview. 
                      Ask relevant questions about the candidate's experience, skills, and career goals. 
                      Be professional but warm, and provide a comfortable interview environment. 
                      Follow up on interesting points and assess the candidate's fit for the role.`,
                
                technical: `You are a senior technical interviewer assessing technical skills and problem-solving abilities. 
                           Ask questions about relevant technologies, past projects, and technical challenges. 
                           Be encouraging while maintaining professional standards. Adapt the difficulty based on responses.`,
                
                behavioral: `You are a behavioral interview specialist using the STAR method (Situation, Task, Action, Result). 
                            Ask questions about past experiences that demonstrate key competencies like leadership, teamwork, and problem-solving. 
                            Probe for specific examples and outcomes.`,
                
                research: `You are a research interviewer gathering detailed information for a study. 
                          Ask open-ended questions that encourage detailed responses. 
                          Be neutral and avoid leading questions. Show genuine interest in the participant's perspectives and experiences.`
            },
            es: {
                general: `Eres un entrevistador de IA amigable y profesional que realiza una conversación general.
                         Tu objetivo es tener un diálogo natural y atractivo mientras conoces a la persona con la que hablas.
                         Haz preguntas de seguimiento reflexivas basadas en sus respuestas. Mantén tus respuestas concisas y conversacionales.
                         IMPORTANTE: Responde SIEMPRE en español.`,
                
                job: `Eres un entrevistador de recursos humanos experimentado que realiza una entrevista de trabajo.
                      Haz preguntas relevantes sobre la experiencia, habilidades y objetivos profesionales del candidato.
                      Sé profesional pero cálido, y proporciona un ambiente de entrevista cómodo.
                      Haz seguimiento a los puntos interesantes y evalúa la idoneidad del candidato para el puesto.
                      IMPORTANTE: Responde SIEMPRE en español.`,
                
                technical: `Eres un entrevistador técnico senior que evalúa habilidades técnicas y capacidades de resolución de problemas.
                           Haz preguntas sobre tecnologías relevantes, proyectos anteriores y desafíos técnicos.
                           Sé alentador mientras mantienes estándares profesionales. Adapta la dificultad según las respuestas.
                           IMPORTANTE: Responde SIEMPRE en español.`,
                
                behavioral: `Eres un especialista en entrevistas conductuales que utiliza el método STAR (Situación, Tarea, Acción, Resultado).
                            Haz preguntas sobre experiencias pasadas que demuestren competencias clave como liderazgo, trabajo en equipo y resolución de problemas.
                            Indaga sobre ejemplos específicos y resultados.
                            IMPORTANTE: Responde SIEMPRE en español.`,
                
                research: `Eres un entrevistador de investigación que recopila información detallada para un estudio.
                          Haz preguntas abiertas que fomenten respuestas detalladas.
                          Sé neutral y evita preguntas sugestivas. Muestra interés genuino en las perspectivas y experiencias del participante.
                          IMPORTANTE: Responde SIEMPRE en español.`
            }
        },
        
        // Interviewer personality modifiers
        styleModifiers: {
            friendly: 'Be warm, encouraging, and conversational. Use a casual tone while remaining professional.',
            professional: 'Maintain a balanced, professional demeanor. Be courteous and respectful.',
            formal: 'Use formal language and maintain strict professionalism. Be respectful and structured in your approach.',
            conversational: 'Keep the tone light and natural, as if having a coffee chat. Be genuinely curious and engaged.'
        },
        
        // Default messages
        defaultMessages: {
            en: {
                welcome: "Hello! I'm your AI interview assistant. I'm here to have a conversation with you. Whenever you're ready, just start speaking and I'll listen. How are you doing today?",
                error: "I apologize, but I didn't quite catch that. Could you please repeat what you said?",
                thinking: "Let me think about that for a moment...",
                ending: "Thank you so much for this conversation. It was great speaking with you! Have a wonderful day!"
            },
            es: {
                welcome: "¡Hola! Soy tu asistente de entrevista con IA. Estoy aquí para tener una conversación contigo. Cuando estés listo, simplemente empieza a hablar y te escucharé. ¿Cómo estás hoy?",
                error: "Disculpa, no pude entender bien lo que dijiste. ¿Podrías repetirlo por favor?",
                thinking: "Déjame pensar en eso por un momento...",
                ending: "¡Muchas gracias por esta conversación! ¡Fue un placer hablar contigo! ¡Que tengas un excelente día!"
            }
        }
    },
    
    audio: {
        // Recording settings
        sampleRate: 16000,
        channels: 1,
        mimeType: 'audio/webm;codecs=opus',
        
        // Silence detection
        silenceThreshold: -40, // dB (made less sensitive to detect silence easier)
        silenceDuration: 1200, // ms (reduced from 1.5s to 1.2s for snappier responses)
        
        // Visualization
        fftSize: 256,
        smoothingTimeConstant: 0.8
    },
    
    ui: {
        // Animation durations
        animationDuration: 300,
        
        // Auto-scroll behavior
        autoScroll: true,
        
        // Maximum transcript length (messages)
        maxTranscriptLength: 100,
        
        // Export formats
        exportFormats: ['txt', 'json', 'pdf']
    },
    
    // Rate limiting
    rateLimit: {
        maxRequestsPerMinute: 20,
        cooldownPeriod: 60000 // 1 minute in ms
    },
    
    // Error messages
    errors: {
        microphone: 'Unable to access microphone. Please check your permissions.',
        api: 'Failed to connect to OpenAI API. Please check your connection and API key.',
        audio: 'Audio processing error. Please try again.',
        general: 'An unexpected error occurred. Please try again.'
    }
};

// Helper function to get API key
function getApiKey() {
    // Try to get from localStorage first (for development)
    let apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
        // In production, you'd want to use a proxy server
        // For now, prompt the user
        apiKey = prompt('Please enter your OpenAI API key:');
        if (apiKey) {
            localStorage.setItem('openai_api_key', apiKey);
        }
    }
    
    return apiKey;
}