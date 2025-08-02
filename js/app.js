// Application state
let currentParameters = {
    directness: 75,
    confidence: 60,
    disagreement: 40,
    formality: 70
};

let messageHistory = [];
let disagreementCount = 0;
let pushbackCount = 0;
let config = null;
let selectedModel = 'openai/gpt-4';

// Chat management system
class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.chats = {};
        this.loadFromStorage();
    }

    // Generate unique chat ID
    generateChatId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate chat title from first user message
    generateChatTitle(firstMessage) {
        if (!firstMessage) return 'New Chat';
        const title = firstMessage.length > 30 
            ? firstMessage.substring(0, 30) + '...' 
            : firstMessage;
        return title;
    }

    // Create new chat
    createNewChat() {
        // Save current chat if it has messages
        if (this.currentChatId && messageHistory.length > 0) {
            this.saveCurrentChat();
        }

        // Create new chat with current timestamp to ensure it appears at top
        const chatId = this.generateChatId();
        const now = Date.now();
        this.currentChatId = chatId;
        this.chats[chatId] = {
            title: 'New Chat',
            messages: [],
            parameters: {...currentParameters},
            createdAt: now,
            lastActive: now + 1 // Ensure it's newer than any existing chat
        };

        // Reset current session
        messageHistory = [];
        disagreementCount = 0;
        pushbackCount = 0;
        
        this.saveToStorage();
        return chatId;
    }

    // Save current chat session
    saveCurrentChat() {
        if (!this.currentChatId) return;

        if (this.chats[this.currentChatId]) {
            this.chats[this.currentChatId].messages = [...messageHistory];
            this.chats[this.currentChatId].parameters = {...currentParameters};
            this.chats[this.currentChatId].lastActive = Date.now();
            
            // Update title from first user message if still 'New Chat'
            if (this.chats[this.currentChatId].title === 'New Chat' && messageHistory.length > 0) {
                const firstUserMessage = messageHistory.find(msg => msg.sender === 'user');
                if (firstUserMessage) {
                    this.chats[this.currentChatId].title = this.generateChatTitle(firstUserMessage.content);
                }
            }
        }
        
        this.saveToStorage();
    }

    // Load specific chat
    loadChat(chatId) {
        if (!this.chats[chatId]) return false;

        // Save current chat before switching
        this.saveCurrentChat();

        // Load selected chat
        const chat = this.chats[chatId];
        this.currentChatId = chatId;
        messageHistory = [...chat.messages];
        currentParameters = {...chat.parameters};
        
        // Update UI sliders
        this.updateParameterSliders();
        
        // Update counters
        disagreementCount = 0;
        pushbackCount = 0;
        
        // Update last active
        chat.lastActive = Date.now();
        this.saveToStorage();
        
        return true;
    }

    // Update parameter sliders in UI
    updateParameterSliders() {
        Object.keys(currentParameters).forEach(param => {
            const slider = document.getElementById(param + 'Slider');
            const valueDisplay = document.getElementById(param + 'Value');
            const track = document.getElementById(param + 'Track');
            
            if (slider && valueDisplay && track) {
                slider.value = currentParameters[param];
                valueDisplay.textContent = currentParameters[param];
                track.style.width = currentParameters[param] + '%';
            }
        });
    }

    // Get all chats sorted by last active (most recent first)
    getAllChats() {
        return Object.entries(this.chats)
            .map(([id, chat]) => ({id, ...chat}))
            .sort((a, b) => b.lastActive - a.lastActive);
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                currentChatId: this.currentChatId,
                chats: this.chats
            };
            localStorage.setItem('sycophancy_chats', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save chats to storage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('sycophancy_chats');
            if (data) {
                const parsed = JSON.parse(data);
                this.currentChatId = parsed.currentChatId;
                this.chats = parsed.chats || {};
            }
        } catch (error) {
            console.error('Failed to load chats from storage:', error);
            this.chats = {};
            this.currentChatId = null;
        }
    }

    // Delete chat
    deleteChat(chatId) {
        if (this.chats[chatId]) {
            delete this.chats[chatId];
            if (this.currentChatId === chatId) {
                this.currentChatId = null;
            }
            this.saveToStorage();
            return true;
        }
        return false;
    }
}

// Initialize chat manager
const chatManager = new ChatManager();

// Initialize Anti-Sycophancy Engine (will be configured after loading config)
let antiSycophancyEngine = new AntiSycophancyEngine();

// Chat history rendering functions
function renderChatHistory() {
    const chatHistoryContainer = document.getElementById('chatHistory');
    const chats = chatManager.getAllChats();
    
    if (chats.length === 0) {
        chatHistoryContainer.innerHTML = '<div class="no-chats">No chat history yet</div>';
        return;
    }
    
    let html = '<div class="history-section"><div class="history-title">Recent</div>';
    
    chats.forEach(chat => {
        const isActive = chat.id === chatManager.currentChatId ? 'active' : '';
        html += `
            <div class="chat-item ${isActive}" data-chat-id="${chat.id}">
                ${chat.title}
            </div>
        `;
    });
    
    html += '</div>';
    chatHistoryContainer.innerHTML = html;
    
    // Add click listeners to chat items
    attachChatItemListeners();
}

function attachChatItemListeners() {
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            if (chatId && chatManager.loadChat(chatId)) {
                // Update UI
                chatItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Render loaded chat messages
                renderChatMessages();
                
                // Update counters display
                updateCountersDisplay();
            }
        });
    });
}

function renderChatMessages() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';
    
    if (messageHistory.length === 0) {
        // Show welcome message for new chats
        chatMessages.innerHTML = `
            <div class="message ai">
                <div class="personality-badge">Direct • Confident • Formal</div>
                <div class="message-bubble">
                    Welcome to Sycophancy. I'm designed to give you honest, unfiltered responses rather than just telling you what you want to hear. Use the anti-sycophancy controls to adjust my personality in real-time. What would you like to discuss?
                </div>
            </div>
        `;
        return;
    }
    
    messageHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender}`;
        
        if (msg.sender === 'ai') {
            const personalityBadge = getPersonalityBadgeFromParameters(msg.parameters || currentParameters);
            const formattedContent = formatMessage(msg.content);
            messageDiv.innerHTML = `
                <div class="personality-badge">${personalityBadge}</div>
                <div class="message-bubble">${formattedContent}</div>
            `;
        } else {
            // For user messages, escape HTML but preserve line breaks
            const escapedContent = msg.content
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/\n/g, '<br>');
            messageDiv.innerHTML = `<div class="message-bubble">${escapedContent}</div>`;
        }
        
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getPersonalityBadgeFromParameters(params) {
    let traits = [];
    
    if (params.directness > 50) traits.push('Direct');
    else traits.push('Diplomatic');
    
    if (params.confidence > 50) traits.push('Confident');
    else traits.push('Cautious');
    
    if (params.formality > 50) traits.push('Formal');
    else traits.push('Casual');
    
    return traits.join(' • ');
}

function updateCountersDisplay() {
    document.getElementById('disagreementCount').textContent = disagreementCount;
    document.getElementById('pushbackCount').textContent = pushbackCount;
}

// Initialize chat system
function initializeChatSystem() {
    // Render initial chat history
    renderChatHistory();
    
    // If no current chat or current chat doesn't exist, create a new one
    if (!chatManager.currentChatId || !chatManager.chats[chatManager.currentChatId]) {
        const newChatId = chatManager.createNewChat();
        renderChatHistory(); // Re-render to show the new chat
    } else {
        // Load the current chat
        chatManager.loadChat(chatManager.currentChatId);
        renderChatMessages();
        updateCountersDisplay();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    initializeSliders();
    initializeChatInput();
    initializeApplyButton();
    initializeUI();
    
    // Initialize chat system
    initializeChatSystem();
});

// Load configuration from config.public.json and config.private.json
async function loadConfig() {
    try {
        // Load public configuration (safe to commit to repo)
        const publicResponse = await fetch('config.public.json');
        if (!publicResponse.ok) {
            throw new Error('Failed to load config.public.json');
        }
        config = await publicResponse.json();
        
        // Try to load private configuration (contains API key)
        let privateConfig = {};
        try {
            const privateResponse = await fetch('config.private.json');
            if (privateResponse.ok) {
                privateConfig = await privateResponse.json();
            }
        } catch (privateError) {
            console.log('No private config found, will use environment variables or prompt for API key');
        }
        
        // Merge private config into main config
        config = { ...config, ...privateConfig };
        
        // Validate API key is available (should be loaded from config.private.json)
        if (!config.openRouterApiKey || config.openRouterApiKey === 'your-openrouter-api-key-here') {
            throw new Error('OpenRouter API key not found. Please check the deployment configuration.');
        }
        
        console.log('✅ OpenRouter API key loaded successfully');
        
        // Update model selector with available models
        const modelSelector = document.getElementById('modelSelector');
        modelSelector.innerHTML = '';
        
        config.availableModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelector.appendChild(option);
        });
        
        // Set default model
        modelSelector.value = config.defaultModel;
        selectedModel = config.defaultModel;
        
        // Add change listener
        modelSelector.addEventListener('change', function(e) {
            selectedModel = e.target.value;
        });
        
        // Apply color palette from config if available
        if (config.colorPalette) {
            applyColorPalette(config.colorPalette);
        }
        
        // Initialize Anti-Sycophancy Engine with config
        if (config.antiSycophancyEngine) {
            antiSycophancyEngine = new AntiSycophancyEngine(config.antiSycophancyEngine);
        }
    } catch (error) {
        console.error('Error loading config:', error);
        alert('Failed to load configuration. Please ensure config.public.json exists and config.private.json contains your OpenRouter API key.');
    }
}

// Initialize UI controls
function initializeUI() {
    const controlsToggle = document.getElementById('controlsToggle');
    const controlPanel = document.getElementById('controlPanel');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const newChatBtn = document.getElementById('newChatBtn');
    
    // Controls panel toggle
    controlsToggle.addEventListener('click', function() {
        controlPanel.classList.toggle('open');
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        controlPanel.classList.remove('open');
    });
    
    // New chat functionality
    newChatBtn.addEventListener('click', function() {
        startNewChat();
    });
}

// Start new chat
function startNewChat() {
    // Create new chat using ChatManager
    const newChatId = chatManager.createNewChat();
    
    // Reset counters display
    updateCountersDisplay();
    
    // Render the welcome message
    renderChatMessages();
    
    // Update chat history UI
    renderChatHistory();
}

// This function is now handled by ChatManager.loadChat()

// Initialize slider controls
function initializeSliders() {
    const sliders = ['directness', 'confidence', 'disagreement', 'formality'];
    
    sliders.forEach(param => {
        const slider = document.getElementById(param + 'Slider');
        const valueDisplay = document.getElementById(param + 'Value');
        const track = document.getElementById(param + 'Track');
        
        slider.addEventListener('input', function() {
            const value = this.value;
            valueDisplay.textContent = value;
            track.style.width = value + '%';
            currentParameters[param] = parseInt(value);
        });
    });
}

// Initialize chat input functionality
function initializeChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter (but allow Shift+Enter for new lines)
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

// Initialize apply button
function initializeApplyButton() {
    const applyButton = document.getElementById('applyButton');
    
    applyButton.addEventListener('click', function() {
        const controlPanel = document.getElementById('controlPanel');
        
        // Visual feedback
        this.textContent = 'Applied!';
        this.classList.add('applied');
        
        // Update personality badge in real-time
        updatePersonalityDisplay();
        
        // Save current parameters to chat
        chatManager.saveCurrentChat();
        
        setTimeout(() => {
            this.textContent = 'Apply Changes';
            this.classList.remove('applied');
            
            // Hide the control panel with smooth animation
            controlPanel.classList.remove('open');
        }, 800);
    });
}

// Send message function
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate AI response
    generateAIResponse(message).then(() => {
        hideTypingIndicator();
    }).catch(() => {
        hideTypingIndicator();
    });
}

// Format message content with markdown support
function formatMessage(content) {
    // Configure marked options
    marked.setOptions({
        breaks: true, // Preserve line breaks
        gfm: true, // GitHub Flavored Markdown
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (e) {}
            }
            return hljs.highlightAuto(code).value;
        },
        headerIds: false,
        mangle: false
    });
    
    // Parse markdown to HTML
    const formattedContent = marked.parse(content);
    
    return formattedContent;
}

// Add message to chat display
function addMessageToChat(sender, content) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (sender === 'ai') {
        const personalityBadge = getPersonalityBadge();
        const formattedContent = formatMessage(content);
        messageDiv.innerHTML = `
            <div class="personality-badge">${personalityBadge}</div>
            <div class="message-bubble">${formattedContent}</div>
        `;
    } else {
        // For user messages, escape HTML but preserve line breaks
        const escapedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
        messageDiv.innerHTML = `<div class="message-bubble">${escapedContent}</div>`;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store in history with timestamp
    const messageData = { 
        sender, 
        content, 
        parameters: {...currentParameters},
        timestamp: Date.now()
    };
    messageHistory.push(messageData);
    
    // Auto-save chat after adding message
    chatManager.saveCurrentChat();
    
    // Update chat history UI to reflect any title changes
    if (sender === 'user') {
        renderChatHistory();
    }
}

// Generate AI response based on current parameters
async function generateAIResponse(userMessage) {
    if (!config || !config.openRouterApiKey || config.openRouterApiKey === 'your-openrouter-api-key-here') {
        addMessageToChat('ai', 'Please configure your OpenRouter API key in config.json to use the chat functionality.');
        return;
    }
    
    try {
        // Build the system prompt using Anti-Sycophancy Engine
        let systemPrompt;
        try {
            systemPrompt = antiSycophancyEngine.generateSystemPrompt(
                userMessage, 
                messageHistory, 
                currentParameters
            );
            
            // Debug logging if enabled
            if (config.debug) {
                console.log('=== SYSTEM PROMPT DEBUG ===');
                console.log('User Message:', userMessage);
                console.log('Current Parameters:', currentParameters);
                console.log('Generated System Prompt:');
                console.log(systemPrompt);
                console.log('========================');
            }
        } catch (engineError) {
            console.error('AntiSycophancyEngine error:', engineError);
            // Fallback to basic system prompt
            systemPrompt = "You are an AI assistant designed to provide authentic, non-sycophantic responses.";
            
            if (config.debug) {
                console.log('=== FALLBACK SYSTEM PROMPT ===');
                console.log(systemPrompt);
                console.log('============================');
            }
        }
        
        // Call OpenRouter API
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.openRouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'Sycophancy AI'
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messageHistory.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    })),
                    { role: 'user', content: userMessage }
                ],
                temperature: config.temperature || 0.7,
                max_tokens: config.maxTokens || 4096
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        let aiResponse = data.choices[0].message.content;
        
        // Apply anti-sycophancy engine logic
        const context = antiSycophancyEngine.analyzeConversationContext(userMessage, messageHistory);
        if (context.shouldChallenge) {
            if (context.preferredChallengeType === 'devils_advocate' || 
                context.preferredChallengeType === 'perspective_shift') {
                disagreementCount++;
                document.getElementById('disagreementCount').textContent = disagreementCount;
            }
            
            if (context.preferredChallengeType === 'socratic' || 
                context.preferredChallengeType === 'evidence_challenge') {
                pushbackCount++;
                document.getElementById('pushbackCount').textContent = pushbackCount;
            }
        }
        
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error calling OpenRouter API:', error);
        addMessageToChat('ai', 'Sorry, I encountered an error while processing your request. Please check your API configuration and try again.');
    }
}

// System prompt generation is now handled by the AntiSycophancyEngine
// The old buildSystemPrompt function has been replaced with advanced dynamic prompting

// Anti-sycophancy engine logic is now handled by the AntiSycophancyEngine class
// These functions have been replaced with sophisticated conversation analysis and contextual prompting

// Get personality badge text
function getPersonalityBadge() {
    const { directness, confidence, disagreement, formality } = currentParameters;
    
    let traits = [];
    
    if (directness > 50) traits.push('Direct');
    else traits.push('Diplomatic');
    
    if (confidence > 50) traits.push('Confident');
    else traits.push('Cautious');
    
    if (formality > 50) traits.push('Formal');
    else traits.push('Casual');
    
    return traits.join(' • ');
}

// Update personality display
function updatePersonalityDisplay() {
    // This would trigger an update to show the new personality in the next message
    console.log('Personality updated:', currentParameters);
}

// Typing indicator functions
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'message ai';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Apply color palette from config to CSS custom properties
function applyColorPalette(colorPalette) {
    const root = document.documentElement;
    
    // Set CSS custom properties for dynamic color theming
    root.style.setProperty('--primary-color', colorPalette.primary || '#BB86FC');
    root.style.setProperty('--primary-variant-color', colorPalette.primaryVariant || '#3700B3');
    root.style.setProperty('--secondary-color', colorPalette.secondary || '#03DAC6');
    root.style.setProperty('--background-color', colorPalette.background || '#121212');
    root.style.setProperty('--surface-color', colorPalette.surface || '#121212');
    root.style.setProperty('--error-color', colorPalette.error || '#CF6679');
    root.style.setProperty('--on-primary-color', colorPalette.onPrimary || '#000000');
    root.style.setProperty('--on-secondary-color', colorPalette.onSecondary || '#000000');
    root.style.setProperty('--on-background-color', colorPalette.onBackground || '#FFFFFF');
    root.style.setProperty('--on-surface-color', colorPalette.onSurface || '#FFFFFF');
    root.style.setProperty('--on-error-color', colorPalette.onError || '#000000');
    
    console.log('Applied color palette from config:', colorPalette);
}