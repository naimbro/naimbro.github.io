// Storage module for persisting conversations

class ConversationStorage {
    constructor() {
        this.storageKey = 'ai_interview_conversations';
        this.currentSessionKey = 'ai_interview_current_session';
        this.maxConversations = 50; // Limit stored conversations
    }

    // Save current conversation
    saveConversation(conversationData) {
        try {
            const conversations = this.getAllConversations();
            
            // Create conversation record
            const conversation = {
                id: Utils.generateId(),
                date: new Date().toISOString(),
                duration: conversationData.duration || 0,
                messageCount: conversationData.messages.length,
                language: conversationData.language || 'en',
                interviewType: conversationData.interviewType || 'general',
                interviewerStyle: conversationData.interviewerStyle || 'professional',
                messages: conversationData.messages,
                metadata: {
                    browser: navigator.userAgent,
                    ...conversationData.metadata
                }
            };
            
            // Add to conversations array
            conversations.unshift(conversation); // Add to beginning
            
            // Limit stored conversations
            if (conversations.length > this.maxConversations) {
                conversations.splice(this.maxConversations);
            }
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(conversations));
            
            return conversation.id;
        } catch (error) {
            console.error('Failed to save conversation:', error);
            throw error;
        }
    }

    // Get all stored conversations
    getAllConversations() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load conversations:', error);
            return [];
        }
    }

    // Get specific conversation by ID
    getConversation(conversationId) {
        const conversations = this.getAllConversations();
        return conversations.find(conv => conv.id === conversationId);
    }

    // Delete a conversation
    deleteConversation(conversationId) {
        try {
            const conversations = this.getAllConversations();
            const filtered = conversations.filter(conv => conv.id !== conversationId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            return false;
        }
    }

    // Clear all conversations
    clearAllConversations() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear conversations:', error);
            return false;
        }
    }

    // Save current session state (for recovery)
    saveSessionState(sessionData) {
        try {
            localStorage.setItem(this.currentSessionKey, JSON.stringify({
                timestamp: new Date().toISOString(),
                ...sessionData
            }));
        } catch (error) {
            console.error('Failed to save session state:', error);
        }
    }

    // Restore session state
    getSessionState() {
        try {
            const stored = localStorage.getItem(this.currentSessionKey);
            if (stored) {
                const session = JSON.parse(stored);
                // Check if session is less than 1 hour old
                const sessionAge = Date.now() - new Date(session.timestamp).getTime();
                if (sessionAge < 3600000) { // 1 hour
                    return session;
                }
            }
            return null;
        } catch (error) {
            console.error('Failed to load session state:', error);
            return null;
        }
    }

    // Clear session state
    clearSessionState() {
        localStorage.removeItem(this.currentSessionKey);
    }

    // Get storage statistics
    getStorageStats() {
        const conversations = this.getAllConversations();
        const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
        const totalDuration = conversations.reduce((sum, conv) => sum + (conv.duration || 0), 0);
        
        return {
            conversationCount: conversations.length,
            totalMessages: totalMessages,
            totalDuration: totalDuration,
            oldestConversation: conversations[conversations.length - 1]?.date,
            newestConversation: conversations[0]?.date,
            storageUsed: this.getStorageSize()
        };
    }

    // Calculate approximate storage size
    getStorageSize() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            // Rough estimate: 2 bytes per character in UTF-16
            return Utils.formatFileSize(stored.length * 2);
        }
        return '0 Bytes';
    }

    // Export conversations to file
    exportAllConversations() {
        const conversations = this.getAllConversations();
        const exportData = {
            exportDate: new Date().toISOString(),
            conversationCount: conversations.length,
            conversations: conversations
        };
        
        const filename = `ai-interviews-export-${new Date().toISOString().slice(0, 10)}.json`;
        Utils.downloadFile(
            JSON.stringify(exportData, null, 2),
            filename,
            'application/json'
        );
    }

    // Import conversations from file
    async importConversations(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (data.conversations && Array.isArray(data.conversations)) {
                const existing = this.getAllConversations();
                const merged = [...data.conversations, ...existing];
                
                // Remove duplicates based on ID
                const unique = merged.filter((conv, index, self) =>
                    index === self.findIndex(c => c.id === conv.id)
                );
                
                // Sort by date and limit
                unique.sort((a, b) => new Date(b.date) - new Date(a.date));
                if (unique.length > this.maxConversations) {
                    unique.splice(this.maxConversations);
                }
                
                localStorage.setItem(this.storageKey, JSON.stringify(unique));
                return unique.length;
            }
            
            throw new Error('Invalid import file format');
        } catch (error) {
            console.error('Failed to import conversations:', error);
            throw error;
        }
    }
}

// Create global instance
window.conversationStorage = new ConversationStorage();