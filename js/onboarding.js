// OnboardingManager - Handles all onboarding functionality for Zero platform
class OnboardingManager {
    constructor() {
        // Onboard Questions Data
        this.onboardQuestions = [
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
        this.currentQuestionIndex = 0;
        this.questionnaireAnswers = {};
        this.lastCalculatedParameters = null;

        // Dependencies will be injected
        this.currentParametersRef = null;
        this.chatManagerRef = null;
        this.onParametersUpdate = null;
    }

    // Initialize with dependencies
    initialize(currentParameters, chatManager, onParametersUpdate) {
        this.currentParametersRef = currentParameters;
        this.chatManagerRef = chatManager;
        this.onParametersUpdate = onParametersUpdate;
        this.setupEventListeners();
        this.initializeOnboardStatus();
    }

    // Onboard Modal Functions
    showOnboardModal() {
        const modal = document.getElementById('onboardModal');
        if (modal) {
            // Reset to welcome screen
            this.showWelcomeScreen();
            
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

    closeOnboardModal() {
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
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('questionnaireScreen').classList.add('hidden');
        document.getElementById('resultsScreen').classList.add('hidden');
        document.getElementById('welcomeFooter').classList.remove('hidden');
        document.getElementById('questionnaireFooter').classList.add('hidden');
        document.getElementById('resultsFooter').classList.add('hidden');
    }

    showQuestionnaireScreen() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('questionnaireScreen').classList.remove('hidden');
        document.getElementById('resultsScreen').classList.add('hidden');
        document.getElementById('welcomeFooter').classList.add('hidden');
        document.getElementById('questionnaireFooter').classList.remove('hidden');
        document.getElementById('resultsFooter').classList.add('hidden');
    }

    showResultsScreen() {
        document.getElementById('questionnaireScreen').classList.add('hidden');
        document.getElementById('resultsScreen').classList.remove('hidden');
        document.getElementById('questionnaireFooter').classList.add('hidden');
        document.getElementById('resultsFooter').classList.remove('hidden');
        document.getElementById('welcomeFooter').classList.add('hidden');
    }

    // Questionnaire Functions
    startQuestionnaire() {
        this.currentQuestionIndex = 0;
        this.questionnaireAnswers = {};
        this.showQuestionnaireScreen();
        this.showQuestion(0);
        this.updateProgress();
    }

    showQuestion(index) {
        const question = this.onboardQuestions[index];
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
            optionElement.addEventListener('click', () => {
                this.selectAnswer(question.id, option.value);
            });
            
            answerOptions.appendChild(optionElement);
        });
        
        // Restore previous answer if exists
        if (this.questionnaireAnswers[question.id]) {
            this.selectAnswer(question.id, this.questionnaireAnswers[question.id], false);
        }
        
        this.updateNavigationButtons();
    }

    selectAnswer(questionId, value, updateAnswers = true) {
        // Store answer
        if (updateAnswers) {
            this.questionnaireAnswers[questionId] = value;
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
        
        this.updateNavigationButtons();
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.onboardQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion(this.currentQuestionIndex);
            this.updateProgress();
        } else {
            // Complete questionnaire and show results
            this.completeQuestionnaire();
        }
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion(this.currentQuestionIndex);
            this.updateProgress();
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.onboardQuestions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.onboardQuestions.length;
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const nextButtonText = document.getElementById('nextButtonText');
        
        // Previous button
        prevButton.disabled = this.currentQuestionIndex === 0;
        
        // Next button
        const currentQuestion = this.onboardQuestions[this.currentQuestionIndex];
        const hasAnswer = this.questionnaireAnswers[currentQuestion.id];
        nextButton.disabled = !hasAnswer;
        
        // Update next button text for last question
        if (this.currentQuestionIndex === this.onboardQuestions.length - 1) {
            nextButtonText.textContent = 'Complete';
        } else {
            nextButtonText.textContent = 'Next';
        }
    }

    // Stage 3: Parameter Calculation & Results Functions
    completeQuestionnaire() {
        const calculatedParameters = this.calculateParametersFromAnswers(this.questionnaireAnswers);
        this.showResults(calculatedParameters);
    }

    calculateParametersFromAnswers(answers) {
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
        this.onboardQuestions.forEach(question => {
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
        parameters = this.applyPersonalityConsistency(parameters);
        
        return parameters;
    }

    applyPersonalityConsistency(params) {
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

    showResults(calculatedParameters) {
        // Store parameters for apply button
        this.lastCalculatedParameters = calculatedParameters;
        
        // Switch to results screen
        this.showResultsScreen();
        
        // Animate parameter displays
        setTimeout(() => {
            this.displayParameterResults(calculatedParameters);
            this.generatePersonalitySummary(calculatedParameters);
        }, 300);
    }

    displayParameterResults(parameters) {
        const parameterNames = ['directness', 'confidence', 'disagreement', 'formality'];
        
        parameterNames.forEach((param, index) => {
            const value = parameters[param];
            const description = this.getParameterDescription(param, value);
            
            // Update display with animation delay
            setTimeout(() => {
                document.getElementById(`${param}ResultValue`).textContent = value;
                document.getElementById(`${param}ResultFill`).style.width = `${value}%`;
                document.getElementById(`${param}ResultDesc`).textContent = description;
            }, index * 200);
        });
    }

    getParameterDescription(parameter, value) {
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

    generatePersonalitySummary(parameters) {
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
        const description = this.generatePersonalityDescription(parameters, finalTraits);
        document.getElementById('personalityDescription').textContent = description;
    }

    generatePersonalityDescription(parameters, traits) {
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
    applyOnboardResults(calculatedParameters) {
        // Update parameters through callback
        if (this.onParametersUpdate) {
            this.onParametersUpdate(calculatedParameters);
        }
        
        // Animate the parameter changes
        this.animateParameterChanges(calculatedParameters);
        
        // Save onboard completion status
        this.saveOnboardCompletion(calculatedParameters);
        
        // Update onboard button text
        this.updateOnboardButtonText(true);
        
        // Close the modal
        this.closeOnboardModal();
        
        // Show success notification
        this.showParameterUpdateNotification();
    }

    animateParameterChanges(newParameters) {
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
        }, 600);
    }

    saveOnboardCompletion(parameters) {
        try {
            const onboardData = {
                completed: true,
                completedAt: Date.now(),
                parameters: parameters,
                questionnaireAnswers: this.questionnaireAnswers
            };
            
            localStorage.setItem('zero_onboard_status', JSON.stringify(onboardData));
        } catch (error) {
            console.error('Failed to save onboard completion status:', error);
        }
    }

    getOnboardCompletionStatus() {
        try {
            const data = localStorage.getItem('zero_onboard_status');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load onboard completion status:', error);
            return null;
        }
    }

    updateOnboardButtonText(completed) {
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

    showParameterUpdateNotification() {
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
    initializeOnboardStatus() {
        const status = this.getOnboardCompletionStatus();
        if (status && status.completed) {
            this.updateOnboardButtonText(true);
        }
    }

    setupEventListeners() {
        // Onboard button click
        const onboardBtn = document.getElementById('onboardBtn');
        if (onboardBtn) {
            onboardBtn.addEventListener('click', () => this.showOnboardModal());
        }
        
        // Close button click
        const onboardClose = document.getElementById('onboardClose');
        if (onboardClose) {
            onboardClose.addEventListener('click', () => this.closeOnboardModal());
        }
        
        // Skip button click
        const onboardSkip = document.getElementById('onboardSkip');
        if (onboardSkip) {
            onboardSkip.addEventListener('click', () => this.closeOnboardModal());
        }
        
        // Start button click
        const onboardStart = document.getElementById('onboardStart');
        if (onboardStart) {
            onboardStart.addEventListener('click', () => this.startQuestionnaire());
        }
        
        // Navigation buttons
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.prevQuestion());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }
        
        // Results buttons
        const retakeButton = document.getElementById('retakeButton');
        const applyResultsButton = document.getElementById('applyResultsButton');
        
        if (retakeButton) {
            retakeButton.addEventListener('click', () => {
                // Go back to welcome screen (same as clicking onboard button)
                this.showWelcomeScreen();
            });
        }
        
        if (applyResultsButton) {
            applyResultsButton.addEventListener('click', () => {
                // Get the last calculated parameters and apply them
                if (this.lastCalculatedParameters) {
                    this.applyOnboardResults(this.lastCalculatedParameters);
                }
            });
        }
        
        // Backdrop click to close
        const onboardBackdrop = document.getElementById('onboardBackdrop');
        if (onboardBackdrop) {
            onboardBackdrop.addEventListener('click', () => this.closeOnboardModal());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('onboardModal');
            if (modal && modal.classList.contains('show')) {
                // Escape key to close
                if (e.key === 'Escape') {
                    this.closeOnboardModal();
                }
                
                // Arrow key navigation in questionnaire
                const questionnaireScreen = document.getElementById('questionnaireScreen');
                if (!questionnaireScreen.classList.contains('hidden')) {
                    const prevButton = document.getElementById('prevButton');
                    const nextButton = document.getElementById('nextButton');
                    
                    if (e.key === 'ArrowLeft' && !prevButton.disabled) {
                        this.prevQuestion();
                        e.preventDefault();
                    } else if (e.key === 'ArrowRight' && !nextButton.disabled) {
                        this.nextQuestion();
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
}

// Export the OnboardingManager for use in app.js
window.OnboardingManager = OnboardingManager;