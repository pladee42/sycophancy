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
            localStorage.setItem('zero_chats', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save chats to storage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('zero_chats');
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
                    Welcome to Zero. I'm designed to give you honest, unfiltered responses rather than just telling you what you want to hear. Use the anti-sycophancy controls to adjust my personality in real-time. What would you like to discuss?
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

// Onboard Questions Data
const onboardQuestions = [
    {
        id: 1,
        title: "Team Meeting Dynamics",
        scenario: "You're in a team meeting and someone presents an idea you disagree with. How would you typically respond?",
        options: [
            { value: 'A', text: "I respectfully disagree. Here are the specific issues I see with this approach..." },
            { value: 'B', text: "That's interesting, but have you considered these potential challenges?" },
            { value: 'C', text: "Hmm, I'm not sure about that. What do you think about trying this instead?" },
            { value: 'D', text: "Yeah, maybe... but what if we just did it this way instead?" }
        ],
        parameter: 'formality'
    },
    {
        id: 2,
        title: "Friend's Decision",
        scenario: "Your close friend is about to make what you think is a terrible life decision. What's your approach?",
        options: [
            { value: 'A', text: "Tell them straight up that it's a bad idea and explain why" },
            { value: 'B', text: "Ask probing questions to help them see the issues themselves" },
            { value: 'C', text: "Express concern gently and offer alternative perspectives" },
            { value: 'D', text: "Support them while subtly suggesting they think it through more" }
        ],
        parameter: 'directness'
    },
    {
        id: 3,
        title: "Learning New Skills",
        scenario: "When you're learning something new and challenging, what kind of guidance do you prefer?",
        options: [
            { value: 'A', text: "Clear, definitive instructions - tell me exactly what to do" },
            { value: 'B', text: "Confident guidance with occasional 'this might depend on...'" },
            { value: 'C', text: "Balanced explanations that acknowledge different approaches" },
            { value: 'D', text: "Cautious advice with lots of 'it depends' and alternatives" }
        ],
        parameter: 'confidence'
    },
    {
        id: 4,
        title: "Social Conversations",
        scenario: "At a dinner party, someone makes a statement about a topic you're knowledgeable about, but they're wrong. You typically:",
        options: [
            { value: 'A', text: "Jump in with the correct information and explain why they're mistaken" },
            { value: 'B', text: "Wait for a natural pause and offer a different perspective" },
            { value: 'C', text: "Only speak up if the misinformation could be harmful" },
            { value: 'D', text: "Usually just let it slide to keep the peace" }
        ],
        parameter: 'disagreement'
    },
    {
        id: 5,
        title: "Receiving Feedback",
        scenario: "When someone needs to point out a mistake you made, you prefer they:",
        options: [
            { value: 'A', text: "Get straight to the point - what's wrong and how to fix it" },
            { value: 'B', text: "Explain the issue clearly but with some context and encouragement" },
            { value: 'C', text: "Approach it carefully and focus on solutions rather than problems" },
            { value: 'D', text: "Be very gentle and emphasize that everyone makes mistakes" }
        ],
        parameter: 'directness'
    },
    {
        id: 6,
        title: "Problem-Solving Partnership",
        scenario: "When facing a complex problem, your ideal thinking partner would:",
        options: [
            { value: 'A', text: "Challenge every assumption and play devil's advocate constantly" },
            { value: 'B', text: "Question your logic when needed but also build on good ideas" },
            { value: 'C', text: "Mainly support your thinking while occasionally raising concerns" },
            { value: 'D', text: "Go along with your approach and help you feel confident about it" }
        ],
        parameter: 'disagreement'
    },
    {
        id: 7,
        title: "Seeking Advice",
        scenario: "When you ask someone for advice on something important, you want them to:",
        options: [
            { value: 'A', text: "Give you their expert opinion with authority and precision" },
            { value: 'B', text: "Share their professional assessment with clear reasoning" },
            { value: 'C', text: "Offer thoughtful suggestions while acknowledging uncertainties" },
            { value: 'D', text: "Chat through the options in a relaxed, exploratory way" }
        ],
        parameter: 'confidence'
    }
];

// Onboard State
let currentQuestionIndex = 0;
let questionnaireAnswers = {};

// Onboard Modal Functions
function showOnboardModal() {
    const modal = document.getElementById('onboardModal');
    if (modal) {
        // Reset to welcome screen
        showWelcomeScreen();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show modal with animation
        modal.classList.add('show');
        
        // Focus management for accessibility
        const firstFocusableElement = modal.querySelector('.onboard-start');
        if (firstFocusableElement) {
            setTimeout(() => firstFocusableElement.focus(), 300);
        }
    }
}

function closeOnboardModal() {
    const modal = document.getElementById('onboardModal');
    if (modal) {
        // Hide modal with animation
        modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Return focus to onboard button
        const onboardBtn = document.getElementById('onboardBtn');
        if (onboardBtn) {
            onboardBtn.focus();
        }
    }
}

// Screen Management Functions
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('questionnaireScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('welcomeFooter').classList.remove('hidden');
    document.getElementById('questionnaireFooter').classList.add('hidden');
    document.getElementById('resultsFooter').classList.add('hidden');
}

function showQuestionnaireScreen() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('questionnaireScreen').classList.remove('hidden');
    document.getElementById('resultsScreen').classList.add('hidden');
    document.getElementById('welcomeFooter').classList.add('hidden');
    document.getElementById('questionnaireFooter').classList.remove('hidden');
    document.getElementById('resultsFooter').classList.add('hidden');
}

// Questionnaire Functions
function startQuestionnaire() {
    currentQuestionIndex = 0;
    questionnaireAnswers = {};
    showQuestionnaireScreen();
    showQuestion(0);
    updateProgress();
}

function showQuestion(index) {
    const question = onboardQuestions[index];
    if (!question) return;
    
    // Update question content
    document.getElementById('questionTitle').textContent = question.title;
    document.getElementById('questionScenario').textContent = question.scenario;
    
    // Generate answer options
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'answer-option';
        optionElement.innerHTML = `
            <input type="radio" name="question${question.id}" value="${option.value}" id="q${question.id}_${option.value}">
            <div class="radio-custom"></div>
            <div class="answer-text">${option.text}</div>
        `;
        
        // Add click handler for the entire option
        optionElement.addEventListener('click', function() {
            selectAnswer(question.id, option.value);
        });
        
        answerOptions.appendChild(optionElement);
    });
    
    // Restore previous answer if exists
    if (questionnaireAnswers[question.id]) {
        selectAnswer(question.id, questionnaireAnswers[question.id], false);
    }
    
    updateNavigationButtons();
}

function selectAnswer(questionId, value, updateAnswers = true) {
    // Store answer
    if (updateAnswers) {
        questionnaireAnswers[questionId] = value;
    }
    
    // Update UI
    const options = document.querySelectorAll(`input[name="question${questionId}"]`);
    options.forEach(option => {
        const container = option.closest('.answer-option');
        if (option.value === value) {
            option.checked = true;
            container.classList.add('selected');
        } else {
            option.checked = false;
            container.classList.remove('selected');
        }
    });
    
    updateNavigationButtons();
}

function nextQuestion() {
    if (currentQuestionIndex < onboardQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
        updateProgress();
    } else {
        // Complete questionnaire and show results
        completeQuestionnaire();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
        updateProgress();
    }
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / onboardQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = onboardQuestions.length;
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const nextButtonText = document.getElementById('nextButtonText');
    
    // Previous button
    prevButton.disabled = currentQuestionIndex === 0;
    
    // Next button
    const currentQuestion = onboardQuestions[currentQuestionIndex];
    const hasAnswer = questionnaireAnswers[currentQuestion.id];
    nextButton.disabled = !hasAnswer;
    
    // Update next button text for last question
    if (currentQuestionIndex === onboardQuestions.length - 1) {
        nextButtonText.textContent = 'Complete';
    } else {
        nextButtonText.textContent = 'Next';
    }
}

// Stage 3: Parameter Calculation & Results Functions

function completeQuestionnaire() {
    const calculatedParameters = calculateParametersFromAnswers(questionnaireAnswers);
    showResults(calculatedParameters);
}

function calculateParametersFromAnswers(answers) {
    // Scoring matrix - maps answer values to scores
    const scoringMatrix = {
        A: 85, B: 60, C: 35, D: 10
    };
    
    // Initialize parameter scores
    let scores = {
        directness: [],
        confidence: [],
        disagreement: [],
        formality: []
    };
    
    // Map each answer to parameter scores based on question mapping
    onboardQuestions.forEach(question => {
        const answer = answers[question.id];
        if (answer) {
            const score = scoringMatrix[answer];
            
            // Primary parameter mapping
            if (question.parameter === 'directness') {
                scores.directness.push(score);
            } else if (question.parameter === 'confidence') {
                scores.confidence.push(score);
            } else if (question.parameter === 'disagreement') {
                scores.disagreement.push(score);
            } else if (question.parameter === 'formality') {
                scores.formality.push(score);
            }
            
            // Cross-parameter influences for specific questions
            if (question.id === 5) { // Receiving Feedback affects both directness and confidence
                scores.confidence.push(Math.round(score * 0.7)); // Secondary influence
            }
            if (question.id === 6) { // Problem-solving affects multiple parameters
                scores.confidence.push(Math.round(score * 0.5));
                scores.formality.push(Math.round(score * 0.3));
            }
            if (question.id === 7) { // Seeking advice affects both confidence and formality
                scores.formality.push(Math.round(score * 0.6));
            }
        }
    });
    
    // Calculate weighted averages
    let parameters = {};
    Object.keys(scores).forEach(param => {
        if (scores[param].length > 0) {
            const avg = scores[param].reduce((sum, score) => sum + score, 0) / scores[param].length;
            parameters[param] = Math.round(Math.max(0, Math.min(100, avg))); // Clamp between 0-100
        } else {
            parameters[param] = 50; // Default neutral value for missing data
        }
    });
    
    // Apply personality consistency adjustments
    parameters = applyPersonalityConsistency(parameters);
    
    return parameters;
}

function applyPersonalityConsistency(params) {
    // Ensure personality coherence - certain combinations are more likely
    let adjusted = { ...params };
    
    // High directness often correlates with higher confidence
    if (adjusted.directness > 70 && adjusted.confidence < 50) {
        adjusted.confidence = Math.min(100, adjusted.confidence + 15);
    }
    
    // High formality might reduce extreme directness
    if (adjusted.formality > 75 && adjusted.directness > 85) {
        adjusted.directness = Math.max(0, adjusted.directness - 10);
    }
    
    // Very low confidence should reduce disagreement tendency
    if (adjusted.confidence < 30 && adjusted.disagreement > 60) {
        adjusted.disagreement = Math.max(0, adjusted.disagreement - 20);
    }
    
    return adjusted;
}

function showResults(calculatedParameters) {
    // Store parameters globally for apply button
    window.lastCalculatedParameters = calculatedParameters;
    
    // Switch to results screen
    showResultsScreen();
    
    // Animate parameter displays
    setTimeout(() => {
        displayParameterResults(calculatedParameters);
        generatePersonalitySummary(calculatedParameters);
    }, 300);
}

function showResultsScreen() {
    document.getElementById('questionnaireScreen').classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    document.getElementById('questionnaireFooter').classList.add('hidden');
    document.getElementById('resultsFooter').classList.remove('hidden');
    document.getElementById('welcomeFooter').classList.add('hidden');
}

function displayParameterResults(parameters) {
    const parameterNames = ['directness', 'confidence', 'disagreement', 'formality'];
    
    parameterNames.forEach((param, index) => {
        const value = parameters[param];
        const description = getParameterDescription(param, value);
        
        // Update display with animation delay
        setTimeout(() => {
            document.getElementById(`${param}ResultValue`).textContent = value;
            document.getElementById(`${param}ResultFill`).style.width = `${value}%`;
            document.getElementById(`${param}ResultDesc`).textContent = description;
        }, index * 200);
    });
}

function getParameterDescription(parameter, value) {
    const descriptions = {
        directness: {
            high: "Direct and straightforward communication",
            medium: "Balanced and tactful communication", 
            low: "Gentle and diplomatic approach"
        },
        confidence: {
            high: "Highly confident with strong assertions",
            medium: "Moderately confident with appropriate caveats",
            low: "Cautious with frequent uncertainty acknowledgments"
        },
        disagreement: {
            high: "Frequent challenging and debate-oriented",
            medium: "Occasional pushback when appropriate",
            low: "Supportive and agreement-focused"
        },
        formality: {
            high: "Professional and structured tone",
            medium: "Professional tone with some warmth",
            low: "Casual and conversational style"
        }
    };
    
    const level = value >= 70 ? 'high' : value >= 40 ? 'medium' : 'low';
    return descriptions[parameter][level];
}

function generatePersonalitySummary(parameters) {
    const traits = [];
    const { directness, confidence, disagreement, formality } = parameters;
    
    // Generate personality traits based on parameter combinations
    if (formality >= 60) traits.push('Professional');
    if (formality < 40) traits.push('Casual');
    if (directness >= 60) traits.push('Direct');
    if (directness < 40) traits.push('Diplomatic');
    if (confidence >= 60) traits.push('Confident');
    if (confidence < 40) traits.push('Cautious');
    if (disagreement >= 60) traits.push('Challenging');
    if (disagreement < 40) traits.push('Supportive');
    
    // Ensure we have at least 2-3 traits
    if (traits.length < 2) {
        if (directness >= 50) traits.push('Balanced');
        if (confidence >= 50) traits.push('Thoughtful');
    }
    
    // Limit to 4 traits max
    const finalTraits = traits.slice(0, 4);
    
    // Update traits display
    const traitsContainer = document.getElementById('personalityTraits');
    traitsContainer.innerHTML = '';
    finalTraits.forEach(trait => {
        const traitElement = document.createElement('span');
        traitElement.className = 'trait';
        traitElement.textContent = trait;
        traitsContainer.appendChild(traitElement);
    });
    
    // Generate description
    const description = generatePersonalityDescription(parameters, finalTraits);
    document.getElementById('personalityDescription').textContent = description;
}

function generatePersonalityDescription(parameters, traits) {
    const { directness, confidence, disagreement, formality } = parameters;
    
    let description = "Your AI will communicate ";
    
    // Formality level
    if (formality >= 70) {
        description += "in a professional and structured manner";
    } else if (formality >= 40) {
        description += "with a balanced professional yet approachable style";
    } else {
        description += "in a casual and conversational way";
    }
    
    // Directness and confidence
    if (directness >= 60 && confidence >= 60) {
        description += ", providing clear and confident responses";
    } else if (directness >= 60) {
        description += ", being direct while acknowledging uncertainties";
    } else if (confidence >= 60) {
        description += ", showing confidence while being diplomatic";
    } else {
        description += ", taking a thoughtful and careful approach";
    }
    
    // Disagreement level
    if (disagreement >= 60) {
        description += " and will frequently challenge ideas to promote deeper thinking";
    } else if (disagreement >= 40) {
        description += " while being thoughtful about when to challenge ideas";
    } else {
        description += " with a supportive and collaborative approach";
    }
    
    description += ".";
    return description;
}

// Integration with existing parameter system
function applyOnboardResults(calculatedParameters) {
    // Store the calculated parameters
    currentParameters = { ...calculatedParameters };
    
    // Update the parameter sliders with animation
    animateParameterChanges(calculatedParameters);
    
    // Save onboard completion status
    saveOnboardCompletion(calculatedParameters);
    
    // Update onboard button text
    updateOnboardButtonText(true);
    
    // Close the modal
    closeOnboardModal();
    
    // Show success notification
    showParameterUpdateNotification();
}

function animateParameterChanges(newParameters) {
    const parameterNames = ['directness', 'confidence', 'disagreement', 'formality'];
    
    parameterNames.forEach((param, index) => {
        setTimeout(() => {
            const slider = document.getElementById(`${param}Slider`);
            const valueDisplay = document.getElementById(`${param}Value`);
            const track = document.getElementById(`${param}Track`);
            
            if (slider && valueDisplay && track) {
                // Animate the slider change
                const newValue = newParameters[param];
                slider.value = newValue;
                valueDisplay.textContent = newValue;
                track.style.width = newValue + '%';
                
                // Add a brief highlight animation
                track.style.transition = 'width 0.8s ease, background 0.3s ease';
                track.style.background = 'linear-gradient(90deg, #03DAC6, #00BFA5)';
                
                setTimeout(() => {
                    track.style.background = 'linear-gradient(90deg, #BB86FC, #9965F4)';
                }, 500);
            }
        }, index * 150);
    });
    
    // Apply the changes to the current parameters after animation
    setTimeout(() => {
        // Trigger apply changes automatically
        const applyButton = document.getElementById('applyButton');
        if (applyButton) {
            // Visual feedback for apply button
            applyButton.classList.add('applied');
            setTimeout(() => {
                applyButton.classList.remove('applied');
            }, 1000);
        }
        
        // Update personality display
        updatePersonalityDisplay();
    }, 600);
}

function saveOnboardCompletion(parameters) {
    try {
        const onboardData = {
            completed: true,
            completedAt: Date.now(),
            parameters: parameters,
            questionnaireAnswers: questionnaireAnswers
        };
        
        localStorage.setItem('zero_onboard_status', JSON.stringify(onboardData));
    } catch (error) {
        console.error('Failed to save onboard completion status:', error);
    }
}

function getOnboardCompletionStatus() {
    try {
        const data = localStorage.getItem('zero_onboard_status');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load onboard completion status:', error);
        return null;
    }
}

function updateOnboardButtonText(completed) {
    const onboardBtn = document.getElementById('onboardBtn');
    if (onboardBtn) {
        const textNode = onboardBtn.childNodes[onboardBtn.childNodes.length - 1];
        if (completed) {
            textNode.textContent = 'Re-configure';
        } else {
            textNode.textContent = 'Onboard';
        }
    }
}

function showParameterUpdateNotification() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #03DAC6, #00BFA5);
        color: #000;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'ClashGrotesk-Medium';
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(3, 218, 198, 0.3);
    `;
    notification.textContent = '✓ AI personality parameters updated!';
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 300);
    }, 3000);
}

// Initialize onboard status on load
function initializeOnboardStatus() {
    const status = getOnboardCompletionStatus();
    if (status && status.completed) {
        updateOnboardButtonText(true);
    }
}

function setupOnboardEventListeners() {
    // Onboard button click
    const onboardBtn = document.getElementById('onboardBtn');
    if (onboardBtn) {
        onboardBtn.addEventListener('click', showOnboardModal);
    }
    
    // Close button click
    const onboardClose = document.getElementById('onboardClose');
    if (onboardClose) {
        onboardClose.addEventListener('click', closeOnboardModal);
    }
    
    // Skip button click
    const onboardSkip = document.getElementById('onboardSkip');
    if (onboardSkip) {
        onboardSkip.addEventListener('click', closeOnboardModal);
    }
    
    // Start button click
    const onboardStart = document.getElementById('onboardStart');
    if (onboardStart) {
        onboardStart.addEventListener('click', startQuestionnaire);
    }
    
    // Navigation buttons
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    if (prevButton) {
        prevButton.addEventListener('click', prevQuestion);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', nextQuestion);
    }
    
    // Results buttons
    const retakeButton = document.getElementById('retakeButton');
    const applyResultsButton = document.getElementById('applyResultsButton');
    
    if (retakeButton) {
        retakeButton.addEventListener('click', function() {
            // Go back to welcome screen (same as clicking onboard button)
            showWelcomeScreen();
        });
    }
    
    if (applyResultsButton) {
        applyResultsButton.addEventListener('click', function() {
            // Get the last calculated parameters and apply them
            if (window.lastCalculatedParameters) {
                applyOnboardResults(window.lastCalculatedParameters);
            }
        });
    }
    
    // Backdrop click to close
    const onboardBackdrop = document.getElementById('onboardBackdrop');
    if (onboardBackdrop) {
        onboardBackdrop.addEventListener('click', closeOnboardModal);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('onboardModal');
        if (modal && modal.classList.contains('show')) {
            // Escape key to close
            if (e.key === 'Escape') {
                closeOnboardModal();
            }
            
            // Arrow key navigation in questionnaire
            const questionnaireScreen = document.getElementById('questionnaireScreen');
            if (!questionnaireScreen.classList.contains('hidden')) {
                if (e.key === 'ArrowLeft' && !prevButton.disabled) {
                    prevQuestion();
                    e.preventDefault();
                } else if (e.key === 'ArrowRight' && !nextButton.disabled) {
                    nextQuestion();
                    e.preventDefault();
                }
            }
            
            // Trap focus within modal
            const focusableElements = modal.querySelectorAll(
                'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    initializeSliders();
    initializeChatInput();
    initializeApplyButton();
    initializeUI();
    setupOnboardEventListeners(); // Add onboard event listeners
    initializeOnboardStatus(); // Initialize onboard status
    
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
                'X-Title': 'Zero AI'
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