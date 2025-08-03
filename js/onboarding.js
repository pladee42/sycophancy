// OnboardingManager - Handles all onboarding functionality for Zero platform
class OnboardingManager {
    constructor() {
        // Context Selection Question
        this.contextQuestion = {
            id: 0,
            title: "How do you plan to use Zero?",
            scenario: "Choose the option that best describes your primary use case. This will help us tailor the AI's personality to your needs.",
            options: [
                { 
                    value: 'personal', 
                    title: 'Personal',
                    text: "Personal conversations, creative projects, and daily life assistance",
                    description: "Focus on empathy, creativity, and supportive interactions"
                },
                { 
                    value: 'professional', 
                    title: 'Professional',
                    text: "Work tasks, business decisions, and professional development",
                    description: "Focus on efficiency, expertise, and structured communication"
                },
                { 
                    value: 'mixed', 
                    title: 'Mixed',
                    text: "Both personal and professional contexts",
                    description: "Adaptive communication style that adjusts to context"
                }
            ]
        };

        // Context-Specific Question Sets
        this.questionSets = {
            personal: [
                {
                    id: 1,
                    title: "Emotional Support",
                    scenario: "A close friend shares that they're going through a difficult breakup and feeling heartbroken. How would you naturally respond?",
                    options: [
                        { value: 'A', text: "Listen deeply and validate their feelings: 'That sounds really painful. Tell me more about what you're experiencing.'" },
                        { value: 'B', text: "Offer gentle support with perspective: 'I'm sorry you're hurting. These feelings are normal, and you'll get through this.'" },
                        { value: 'C', text: "Provide practical comfort: 'That's tough. Want to talk about it or would you prefer a distraction?'" },
                        { value: 'D', text: "Give straightforward advice: 'Breakups are hard but it's probably for the best. Focus on moving forward.'" }
                    ],
                    parameter: 'empathy'
                },
                {
                    id: 2,
                    title: "Creative Feedback",
                    scenario: "Your friend shows you a painting they've been working on and asks for your honest opinion. It's not quite working but they seem proud of it.",
                    options: [
                        { value: 'A', text: "Focus on their creative expression: 'I love seeing your artistic vision come through. What inspired this piece?'" },
                        { value: 'B', text: "Encourage with gentle suggestions: 'There's real potential here! What if you experimented with the lighting a bit more?'" },
                        { value: 'C', text: "Give balanced feedback: 'I can see what you're going for. The color choices work well, though some areas might benefit from refinement.'" },
                        { value: 'D', text: "Be directly honest: 'It's a good start, but I think the composition needs work. Here's what I'd change...'" }
                    ],
                    parameter: 'supportiveness'
                },
                {
                    id: 3,
                    title: "Personal Advice",
                    scenario: "A family member asks your advice about whether they should quit their stable job to pursue their dream of starting a food truck.",
                    options: [
                        { value: 'A', text: "Encourage their dreams: 'Follow your passion! Life's too short not to pursue what makes you happy.'" },
                        { value: 'B', text: "Support with planning: 'That sounds exciting! Have you thought about creating a business plan first?'" },
                        { value: 'C', text: "Offer balanced perspective: 'It's a big decision. What would need to be true for you to feel confident about making the leap?'" },
                        { value: 'D', text: "Highlight practical concerns: 'That's risky. Have you considered the financial implications and failure rates for food businesses?'" }
                    ],
                    parameter: 'supportiveness'
                },
                {
                    id: 4,
                    title: "Emotional Expression",
                    scenario: "During a heart-to-heart conversation, someone shares a deeply personal struggle they've never told anyone before.",
                    options: [
                        { value: 'A', text: "Create safe emotional space: 'Thank you for trusting me with this. I'm here to listen without judgment.'" },
                        { value: 'B', text: "Show caring connection: 'I'm honored you shared this with me. You're not alone in this.'" },
                        { value: 'C', text: "Offer supportive presence: 'That must have been difficult to carry alone. I'm glad you felt comfortable telling me.'" },
                        { value: 'D', text: "Focus on solutions: 'I appreciate you opening up. What kind of support would be most helpful right now?'" }
                    ],
                    parameter: 'warmth'
                },
            ],
            professional: [
                {
                    id: 1,
                    title: "Meeting Leadership",
                    scenario: "You're leading a project meeting where the team is struggling to reach consensus on a critical decision with a tight deadline.",
                    options: [
                        { value: 'A', text: "Take decisive action: 'Based on the data and our timeline, here's the decision we're going with. Let's move forward.'" },
                        { value: 'B', text: "Guide toward resolution: 'Let's focus on our core criteria for success and see where we align. I'll make the final call if needed.'" },
                        { value: 'C', text: "Facilitate collaboration: 'What if we table the contentious points and identify areas where we do agree?'" },
                        { value: 'D', text: "Seek full consensus: 'I want to make sure everyone's concerns are heard. Let's keep discussing until we find a solution that works for all.'" }
                    ],
                    parameter: 'authority'
                },
                {
                    id: 2,
                    title: "Project Feedback",
                    scenario: "A team member has delivered work that doesn't meet the project standards and the client deadline is approaching.",
                    options: [
                        { value: 'A', text: "Direct and clear: 'This doesn't meet our standards. Here's exactly what needs to be fixed by tomorrow.'" },
                        { value: 'B', text: "Structured feedback: 'Let's review this against our requirements. I'll outline the gaps and prioritize what needs immediate attention.'" },
                        { value: 'C', text: "Collaborative problem-solving: 'This isn't quite where we need it. Can we work together to identify the issues and solutions?'" },
                        { value: 'D', text: "Supportive development: 'I can see the effort you put in. Let's discuss how to elevate this to meet our client's expectations.'" }
                    ],
                    parameter: 'challenge'
                },
                {
                    id: 3,
                    title: "Decision Making",
                    scenario: "Your team faces a strategic decision: invest in a new technology that could provide competitive advantage but requires significant resources.",
                    options: [
                        { value: 'A', text: "Data-driven decision: 'Let me analyze the ROI, implementation costs, and competitive analysis before making this decision.'" },
                        { value: 'B', text: "Structured evaluation: 'I'll create a decision framework weighing risks, benefits, and strategic alignment.'" },
                        { value: 'C', text: "Consultative approach: 'I want input from key stakeholders before deciding. Let's gather perspectives from IT, finance, and operations.'" },
                        { value: 'D', text: "Consensus building: 'This affects multiple departments. Let's ensure everyone has input before we commit to this investment.'" }
                    ],
                    parameter: 'authority'
                },
                {
                    id: 4,
                    title: "Team Collaboration",
                    scenario: "Your cross-functional team has different working styles and communication preferences that are causing friction.",
                    options: [
                        { value: 'A', text: "Establish clear protocols: 'Let's define our communication standards and workflow processes to eliminate confusion.'" },
                        { value: 'B', text: "Streamline efficiently: 'I'll create a simple framework that accommodates different styles while keeping us productive.'" },
                        { value: 'C', text: "Facilitate adaptation: 'Let's discuss how each person works best and find ways to bridge our different approaches.'" },
                        { value: 'D', text: "Build understanding: 'I'd like everyone to share their working preferences so we can better support each other.'" }
                    ],
                    parameter: 'efficiency'
                },
            ],
            mixed: [
                {
                    id: 1,
                    title: "Communication Style",
                    scenario: "In the same day, you need to give feedback to a close friend about their relationship and present quarterly results to company executives.",
                    options: [
                        { value: 'A', text: "Adapt completely: 'I adjust my entire communication style—warm and empathetic for my friend, formal and data-driven for executives.'" },
                        { value: 'B', text: "Contextual flexibility: 'I modify my approach based on the situation while keeping my core communication principles consistent.'" },
                        { value: 'C', text: "Moderate adaptation: 'I make some adjustments for different audiences but maintain a relatively consistent personal style.'" },
                        { value: 'D', text: "Authentic consistency: 'I stay true to my communication style regardless of context, though I might adjust my language slightly.'" }
                    ],
                    parameter: 'adaptability'
                },
                {
                    id: 2,
                    title: "Feedback Reception",
                    scenario: "You receive constructive criticism about your presentation skills—once from a friend and once from your manager.",
                    options: [
                        { value: 'A', text: "Context-sensitive response: 'I appreciate different feedback styles. Personal feedback can be gentler; professional feedback should be direct and actionable.'" },
                        { value: 'B', text: "Balanced approach: 'I value honest feedback in both contexts, though I appreciate when it's delivered with care for our relationship.'" },
                        { value: 'C', text: "Consistent preference: 'I prefer the same feedback style regardless of who it's from—clear, specific, and focused on improvement.'" },
                        { value: 'D', text: "Relationship-focused: 'I want feedback delivered thoughtfully in both personal and professional settings, with attention to our ongoing relationship.'" }
                    ],
                    parameter: 'balance'
                },
                {
                    id: 3,
                    title: "Problem Solving",
                    scenario: "You're tackling a complex challenge that affects both your personal goals and professional responsibilities.",
                    options: [
                        { value: 'A', text: "Comprehensive analysis: 'I systematically analyze all aspects—personal values, professional requirements, and long-term implications—before deciding.'" },
                        { value: 'B', text: "Integrated approach: 'I look for solutions that honor both my personal priorities and professional obligations.'" },
                        { value: 'C', text: "Practical balance: 'I weigh personal and professional factors, though one usually takes priority depending on the situation.'" },
                        { value: 'D', text: "Intuitive decision-making: 'I trust my instincts about what feels right, considering both personal fulfillment and professional impact.'" }
                    ],
                    parameter: 'balance'
                },
                {
                    id: 4,
                    title: "Authority vs. Collaboration",
                    scenario: "You're planning a family vacation and leading a work project simultaneously. Both require coordinating multiple people with different preferences.",
                    options: [
                        { value: 'A', text: "Context-driven leadership: 'I'm more collaborative with family decisions and more directive with work projects, adapting to what each situation needs.'" },
                        { value: 'B', text: "Situational flexibility: 'I consider the stakes and timeline—higher pressure situations call for more decisive leadership.'" },
                        { value: 'C', text: "Consistent approach: 'I tend to use a similar collaborative style in both contexts, gathering input before making decisions.'" },
                        { value: 'D', text: "Relationship-based: 'My approach depends more on the people involved than the context—some groups need more guidance than others.'" }
                    ],
                    parameter: 'adaptability'
                },
            ]
        };

        // Parameter Definitions by Context
        this.parameterDefinitions = {
            personal: ['empathy', 'supportiveness', 'creativity', 'warmth'],
            professional: ['authority', 'efficiency', 'formality', 'challenge'],
            mixed: ['adaptability', 'balance', 'directness', 'confidence']
        };

        // Onboard State
        this.selectedContext = null; // 'personal', 'professional', or 'mixed'
        this.currentQuestionIndex = 0;
        this.questionnaireAnswers = {};
        this.contextSelected = false;
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
        this.contextSelected = false;
        this.selectedContext = null;
        this.showQuestionnaireScreen();
        this.showContextSelection();
        this.updateProgress();
    }

    showContextSelection() {
        // Show context selection question
        const question = this.contextQuestion;
        
        // Update question content
        document.getElementById('questionTitle').textContent = question.title;
        document.getElementById('questionScenario').textContent = question.scenario;
        
        // Generate context options with enhanced styling
        const answerOptions = document.getElementById('answerOptions');
        answerOptions.innerHTML = '';
        answerOptions.className = 'context-selection'; // Add special styling class
        
        question.options.forEach((option) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'context-option';
            
            // Get parameter names for this context
            const contextParams = this.parameterDefinitions[option.value];
            const parameterPreviews = contextParams.map(param => {
                return `<span class="preview-param">${this.capitalizeParameter(param)}</span>`;
            }).join('');
            
            optionElement.innerHTML = `
                <div class="context-card" data-value="${option.value}">
                    <div class="context-content">
                        <h3 class="context-title">${option.title}</h3>
                        <p class="context-text">${option.text}</p>
                        <p class="context-description">${option.description}</p>
                        <div class="context-preview">
                            <div class="context-preview-title">AI Parameters</div>
                            <div class="context-preview-params">
                                ${parameterPreviews}
                            </div>
                        </div>
                    </div>
                    <div class="context-selector">
                        <div class="radio-custom"></div>
                    </div>
                </div>
            `;
            
            // Add click handler for the entire card
            optionElement.addEventListener('click', () => {
                this.selectContext(option.value);
            });
            
            answerOptions.appendChild(optionElement);
        });
        
        this.updateNavigationButtons();
    }

    selectContext(contextValue) {
        // Store selected context
        this.selectedContext = contextValue;
        
        // Update UI - remove previous selections and add selected state
        const cards = document.querySelectorAll('.context-card');
        cards.forEach(card => {
            const radio = card.querySelector('.radio-custom');
            if (card.dataset.value === contextValue) {
                card.classList.add('selected');
                radio.classList.add('selected');
            } else {
                card.classList.remove('selected');
                radio.classList.remove('selected');
            }
        });
        
        this.updateNavigationButtons();
    }

    showQuestion(index) {
        if (!this.selectedContext) {
            console.error('Context must be selected before showing questions');
            return;
        }

        const contextQuestions = this.questionSets[this.selectedContext];
        const question = contextQuestions[index];
        if (!question) return;
        
        // Add context-specific styling to question container
        const questionContainer = document.querySelector('.question-container');
        if (questionContainer) {
            // Remove previous context classes
            questionContainer.classList.remove('personal-context', 'professional-context', 'mixed-context');
            // Add current context class
            questionContainer.classList.add(`${this.selectedContext}-context`);
        }
        
        // Add context indicator
        const contextInfo = this.getContextInfo(this.selectedContext);
        const contextIndicator = `
            <div class="context-indicator ${this.selectedContext}-context">
                <span>${contextInfo.label} Context</span>
            </div>
        `;
        
        // Update question content
        document.getElementById('questionTitle').innerHTML = contextIndicator + question.title;
        document.getElementById('questionScenario').textContent = question.scenario;
        
        // Generate answer options (reset to normal styling)
        const answerOptions = document.getElementById('answerOptions');
        answerOptions.innerHTML = '';
        answerOptions.className = ''; // Remove context-selection class
        
        question.options.forEach((option) => {
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
        if (!this.contextSelected) {
            // User is on context selection - move to first question
            if (this.selectedContext) {
                this.contextSelected = true;
                this.currentQuestionIndex = 0;
                this.showQuestion(0);
                this.updateProgress();
            }
        } else {
            // User is in context-specific questions
            const contextQuestions = this.questionSets[this.selectedContext];
            if (this.currentQuestionIndex < contextQuestions.length - 1) {
                this.currentQuestionIndex++;
                this.showQuestion(this.currentQuestionIndex);
                this.updateProgress();
            } else {
                // Complete questionnaire and show results
                this.completeQuestionnaire();
            }
        }
    }

    prevQuestion() {
        if (!this.contextSelected) {
            // Can't go back from context selection
            return;
        }
        
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion(this.currentQuestionIndex);
            this.updateProgress();
        } else {
            // Go back to context selection
            this.contextSelected = false;
            this.showContextSelection();
            this.updateProgress();
        }
    }

    updateProgress() {
        if (!this.contextSelected) {
            // On context selection
            const progress = (1 / 5) * 100; // 1 out of 5 total steps (1 context + 4 questions)
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('currentQuestion').textContent = 1;
            document.getElementById('totalQuestions').textContent = 5;
        } else if (this.selectedContext) {
            // In context-specific questions
            const contextQuestions = this.questionSets[this.selectedContext];
            const progress = ((this.currentQuestionIndex + 2) / 5) * 100; // +2 because context selection is step 1
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 2;
            document.getElementById('totalQuestions').textContent = 5;
        }
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const nextButtonText = document.getElementById('nextButtonText');
        
        if (!this.contextSelected) {
            // On context selection
            prevButton.disabled = true;
            nextButton.disabled = !this.selectedContext;
            nextButtonText.textContent = 'Next';
        } else {
            // In context-specific questions
            const contextQuestions = this.questionSets[this.selectedContext];
            const currentQuestion = contextQuestions[this.currentQuestionIndex];
            
            // Previous button - can always go back to previous question or context selection
            prevButton.disabled = false;
            
            // Next button - need answer for current question
            const hasAnswer = this.questionnaireAnswers[currentQuestion.id];
            nextButton.disabled = !hasAnswer;
            
            // Update next button text for last question
            if (this.currentQuestionIndex === contextQuestions.length - 1) {
                nextButtonText.textContent = 'Complete';
            } else {
                nextButtonText.textContent = 'Next';
            }
        }
    }

    // Stage 3: Parameter Calculation & Results Functions
    completeQuestionnaire() {
        const calculatedParameters = this.calculateParametersFromAnswers(this.questionnaireAnswers);
        this.showResults(calculatedParameters);
    }

    calculateParametersFromAnswers(answers) {
        if (!this.selectedContext) {
            throw new Error('Context must be selected before calculating parameters');
        }

        // Scoring matrix - maps answer values to scores
        const scoringMatrix = {
            A: 85, B: 60, C: 35, D: 10
        };
        
        // Get context-specific parameters
        const contextParams = this.parameterDefinitions[this.selectedContext];
        
        // Initialize parameter scores for the selected context
        let scores = {};
        contextParams.forEach(param => {
            scores[param] = [];
        });
        
        // Get questions for the selected context
        const contextQuestions = this.questionSets[this.selectedContext];
        
        // Map each answer to parameter scores based on question mapping
        contextQuestions.forEach(question => {
            const answer = answers[question.id];
            if (answer) {
                const score = scoringMatrix[answer];
                
                // Primary parameter mapping
                if (contextParams.includes(question.parameter)) {
                    scores[question.parameter].push(score);
                }
                
                // Context-specific cross-parameter influences
                this.applyCrossParameterInfluences(question, score, scores, this.selectedContext);
            }
        });
        
        // Calculate weighted averages
        let parameters = {};
        contextParams.forEach(param => {
            if (scores[param].length > 0) {
                const avg = scores[param].reduce((sum, score) => sum + score, 0) / scores[param].length;
                parameters[param] = Math.round(Math.max(0, Math.min(100, avg))); // Clamp between 0-100
            } else {
                parameters[param] = 50; // Default neutral value for missing data
            }
        });
        
        // Apply context-specific personality consistency adjustments
        parameters = this.applyContextualPersonalityConsistency(parameters, this.selectedContext);
        
        // Add context metadata
        parameters._context = this.selectedContext;
        
        return parameters;
    }

    applyCrossParameterInfluences(question, score, scores, context) {
        // Context-specific cross-parameter influences
        switch (context) {
            case 'personal':
                // Personal context cross-influences
                if (question.id === 1 && scores.warmth) { // Emotional Support affects warmth
                    scores.warmth.push(Math.round(score * 0.6));
                }
                if (question.id === 4 && scores.empathy) { // Emotional Expression affects empathy
                    scores.empathy.push(Math.round(score * 0.7));
                }
                if (question.id === 6 && scores.warmth) { // Relationship Dynamics affects warmth
                    scores.warmth.push(Math.round(score * 0.5));
                }
                break;
                
            case 'professional':
                // Professional context cross-influences
                if (question.id === 1 && scores.efficiency) { // Meeting Leadership affects efficiency
                    scores.efficiency.push(Math.round(score * 0.5));
                }
                if (question.id === 3 && scores.formality) { // Decision Making affects formality
                    scores.formality.push(Math.round(score * 0.6));
                }
                if (question.id === 5 && scores.challenge) { // Expert Consultation affects challenge
                    scores.challenge.push(Math.round(score * 0.4));
                }
                break;
                
            case 'mixed':
                // Mixed context cross-influences
                if (question.id === 1 && scores.balance) { // Communication Style affects balance
                    scores.balance.push(Math.round(score * 0.7));
                }
                if (question.id === 4 && scores.adaptability) { // Authority vs Collaboration affects adaptability
                    scores.adaptability.push(Math.round(score * 0.6));
                }
                if (question.id === 6 && scores.confidence) { // Learning Preferences affects confidence
                    scores.confidence.push(Math.round(score * 0.5));
                }
                break;
        }
    }

    applyContextualPersonalityConsistency(params, context) {
        // Ensure personality coherence based on context
        let adjusted = { ...params };
        
        switch (context) {
            case 'personal':
                // High empathy often correlates with high warmth
                if (adjusted.empathy > 70 && adjusted.warmth < 50) {
                    adjusted.warmth = Math.min(100, adjusted.warmth + 15);
                }
                
                // High creativity might increase supportiveness
                if (adjusted.creativity > 75 && adjusted.supportiveness < 40) {
                    adjusted.supportiveness = Math.min(100, adjusted.supportiveness + 10);
                }
                
                // Very low warmth should moderate high empathy to maintain authenticity
                if (adjusted.warmth < 30 && adjusted.empathy > 80) {
                    adjusted.empathy = Math.max(0, adjusted.empathy - 15);
                }
                break;
                
            case 'professional':
                // High authority often correlates with lower challenge tolerance from others
                if (adjusted.authority > 75 && adjusted.challenge < 40) {
                    adjusted.challenge = Math.min(100, adjusted.challenge + 20);
                }
                
                // High efficiency might reduce extreme formality for practicality
                if (adjusted.efficiency > 80 && adjusted.formality > 85) {
                    adjusted.formality = Math.max(0, adjusted.formality - 10);
                }
                
                // Very low authority should reduce challenge tendency
                if (adjusted.authority < 30 && adjusted.challenge > 70) {
                    adjusted.challenge = Math.max(0, adjusted.challenge - 20);
                }
                break;
                
            case 'mixed':
                // High adaptability often correlates with better balance
                if (adjusted.adaptability > 70 && adjusted.balance < 50) {
                    adjusted.balance = Math.min(100, adjusted.balance + 15);
                }
                
                // High directness might reduce extreme adaptability for consistency
                if (adjusted.directness > 80 && adjusted.adaptability > 85) {
                    adjusted.adaptability = Math.max(0, adjusted.adaptability - 10);
                }
                
                // Very low confidence should reduce directness tendency
                if (adjusted.confidence < 30 && adjusted.directness > 70) {
                    adjusted.directness = Math.max(0, adjusted.directness - 20);
                }
                break;
        }
        
        return adjusted;
    }

    // Legacy function for backward compatibility
    applyPersonalityConsistency(params) {
        // For mixed context or fallback
        return this.applyContextualPersonalityConsistency(params, 'mixed');
    }

    showResults(calculatedParameters) {
        // Store parameters for apply button
        this.lastCalculatedParameters = calculatedParameters;
        
        // Switch to results screen
        this.showResultsScreen();
        
        // Add context indicator to results
        this.addContextIndicatorToResults(calculatedParameters._context);
        
        // Animate parameter displays
        setTimeout(() => {
            this.displayParameterResults(calculatedParameters);
            this.generatePersonalitySummary(calculatedParameters);
            this.showExampleResponses(calculatedParameters);
        }, 300);
    }

    displayParameterResults(parameters) {
        const context = parameters._context || this.selectedContext;
        const parameterNames = this.parameterDefinitions[context];
        const resultsContainer = document.getElementById('dynamicParameterResults');
        
        // Clear existing results
        resultsContainer.innerHTML = '';
        
        // Generate dynamic parameter results
        parameterNames.forEach((param, index) => {
            const value = parameters[param];
            const description = this.getParameterDescription(param, value, context);
            const displayName = this.getParameterDisplayName(param, context);
            
            // Create parameter result element
            const parameterResult = document.createElement('div');
            parameterResult.className = 'parameter-result';
            parameterResult.id = `${param}Result`;
            
            parameterResult.innerHTML = `
                <div class="parameter-info">
                    <span class="parameter-name">${displayName}</span>
                    <span class="parameter-value" id="${param}ResultValue">${value}</span>
                </div>
                <div class="parameter-bar">
                    <div class="parameter-fill" id="${param}ResultFill" style="width: 0%"></div>
                </div>
                <div class="parameter-description" id="${param}ResultDesc">${description}</div>
            `;
            
            resultsContainer.appendChild(parameterResult);
            
            // Animate parameter display with delay
            setTimeout(() => {
                const fillElement = document.getElementById(`${param}ResultFill`);
                if (fillElement) {
                    fillElement.style.width = `${value}%`;
                }
            }, index * 200);
        });
    }
    
    getParameterDisplayName(param, context) {
        const displayNames = {
            // Personal context
            empathy: 'Empathy',
            supportiveness: 'Supportiveness', 
            creativity: 'Creativity',
            warmth: 'Warmth',
            
            // Professional context
            authority: 'Authority',
            efficiency: 'Efficiency',
            formality: 'Formality',
            challenge: 'Challenge',
            
            // Mixed context
            adaptability: 'Adaptability',
            balance: 'Balance',
            directness: 'Directness',
            confidence: 'Confidence'
        };
        
        return displayNames[param] || this.capitalizeParameter(param);
    }

    getParameterDescription(parameter, value, context = 'mixed') {
        const descriptions = {
            // Personal Context Parameters
            empathy: {
                high: "Deep emotional understanding and validation",
                medium: "Balanced emotional awareness and practical support", 
                low: "Logic-focused with minimal emotional processing"
            },
            supportiveness: {
                high: "Highly encouraging with optimistic outlook",
                medium: "Balanced encouragement with realistic perspective",
                low: "Realistic assessment with honest challenges"
            },
            creativity: {
                high: "Imaginative and unconventional approaches",
                medium: "Balanced creative and practical solutions",
                low: "Practical and proven solution-focused"
            },
            warmth: {
                high: "Personal connection with caring tone",
                medium: "Friendly yet professional interaction",
                low: "Professional distance with neutral tone"
            },
            
            // Professional Context Parameters
            authority: {
                high: "Confident expertise with decisive recommendations",
                medium: "Balanced confidence with collaborative openness",
                low: "Collaborative suggestions with acknowledged uncertainty"
            },
            efficiency: {
                high: "Concise and action-oriented responses",
                medium: "Balanced detail with practical focus",
                low: "Comprehensive and thorough explanations"
            },
            formality: {
                high: "Professional and structured communication",
                medium: "Business-appropriate with approachable tone",
                low: "Casual and conversational style"
            },
            challenge: {
                high: "Active questioning and devil's advocate approach",
                medium: "Thoughtful pushback when appropriate",
                low: "Supportive and agreement-focused"
            },
            
            // Mixed Context Parameters
            adaptability: {
                high: "Dynamic style-switching based on context",
                medium: "Moderate adjustments while maintaining consistency",
                low: "Consistent approach regardless of context"
            },
            balance: {
                high: "Seamless blend of personal warmth and professional rigor",
                medium: "Context-appropriate mix of approaches",
                low: "Single-mode approach with minimal integration"
            },
            directness: {
                high: "Clear and straightforward communication",
                medium: "Balanced directness with diplomatic considerations",
                low: "Diplomatic and indirect communication style"
            },
            confidence: {
                high: "Strong conviction with definitive statements",
                medium: "Appropriate confidence with uncertainty acknowledgment",
                low: "Cautious with frequent qualifiers and uncertainty"
            }
        };
        
        const level = value >= 70 ? 'high' : value >= 40 ? 'medium' : 'low';
        return descriptions[parameter] ? descriptions[parameter][level] : `${parameter}: ${value}`;
    }

    generatePersonalitySummary(parameters) {
        const context = parameters._context || this.selectedContext;
        const traits = this.generateContextualTraits(parameters, context);
        
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
        
        // Generate context-specific description
        const description = this.generateContextualPersonalityDescription(parameters, context);
        document.getElementById('personalityDescription').textContent = description;
    }

    generateContextualTraits(parameters, context) {
        const traits = [];
        
        switch (context) {
            case 'personal':
                const { empathy, supportiveness, creativity, warmth } = parameters;
                if (empathy >= 60) traits.push('Empathetic');
                if (empathy < 40) traits.push('Analytical');
                if (supportiveness >= 60) traits.push('Encouraging');
                if (supportiveness < 40) traits.push('Realistic');
                if (creativity >= 60) traits.push('Creative');
                if (creativity < 40) traits.push('Practical');
                if (warmth >= 60) traits.push('Warm');
                if (warmth < 40) traits.push('Professional');
                break;
                
            case 'professional':
                const { authority, efficiency, formality, challenge } = parameters;
                if (authority >= 60) traits.push('Authoritative');
                if (authority < 40) traits.push('Collaborative');
                if (efficiency >= 60) traits.push('Efficient');
                if (efficiency < 40) traits.push('Thorough');
                if (formality >= 60) traits.push('Formal');
                if (formality < 40) traits.push('Casual');
                if (challenge >= 60) traits.push('Challenging');
                if (challenge < 40) traits.push('Supportive');
                break;
                
            case 'mixed':
                const { adaptability, balance, directness, confidence } = parameters;
                if (adaptability >= 60) traits.push('Adaptable');
                if (adaptability < 40) traits.push('Consistent');
                if (balance >= 60) traits.push('Balanced');
                if (balance < 40) traits.push('Focused');
                if (directness >= 60) traits.push('Direct');
                if (directness < 40) traits.push('Diplomatic');
                if (confidence >= 60) traits.push('Confident');
                if (confidence < 40) traits.push('Cautious');
                break;
        }
        
        // Ensure we have at least 2-3 traits
        if (traits.length < 2) {
            traits.push('Thoughtful', 'Responsive');
        }
        
        return traits;
    }

    generateContextualPersonalityDescription(parameters, context) {
        let description = "Your AI will ";
        
        switch (context) {
            case 'personal':
                const { empathy, supportiveness, creativity, warmth } = parameters;
                
                // Empathy and warmth combination
                if (empathy >= 60 && warmth >= 60) {
                    description += "provide deeply empathetic support with genuine personal warmth";
                } else if (empathy >= 60) {
                    description += "offer understanding and emotional validation";
                } else if (warmth >= 60) {
                    description += "communicate with personal care and connection";
                } else {
                    description += "provide practical and thoughtful assistance";
                }
                
                // Supportiveness and creativity
                if (supportiveness >= 60 && creativity >= 60) {
                    description += ", encouraging your creative exploration and personal growth";
                } else if (supportiveness >= 60) {
                    description += ", offering encouraging perspective and motivation";
                } else if (creativity >= 60) {
                    description += ", bringing imaginative approaches to your challenges";
                } else {
                    description += ", focusing on practical solutions and realistic guidance";
                }
                break;
                
            case 'professional':
                const { authority, efficiency, formality, challenge } = parameters;
                
                // Authority and formality combination
                if (authority >= 60 && formality >= 60) {
                    description += "provide expert guidance with professional authority";
                } else if (authority >= 60) {
                    description += "offer confident expertise and clear recommendations";
                } else if (formality >= 60) {
                    description += "maintain professional standards with structured communication";
                } else {
                    description += "collaborate with you in a approachable, consultative manner";
                }
                
                // Efficiency and challenge
                if (efficiency >= 60 && challenge >= 60) {
                    description += ", delivering concise insights while actively questioning assumptions";
                } else if (efficiency >= 60) {
                    description += ", focusing on actionable results and clear next steps";
                } else if (challenge >= 60) {
                    description += ", thoughtfully challenging ideas to strengthen your thinking";
                } else {
                    description += ", providing thorough support for your business objectives";
                }
                break;
                
            case 'mixed':
                const { adaptability, balance, directness, confidence } = parameters;
                
                // Adaptability and balance combination
                if (adaptability >= 60 && balance >= 60) {
                    description += "seamlessly adapt between personal warmth and professional expertise";
                } else if (adaptability >= 60) {
                    description += "adjust communication style based on context and needs";
                } else if (balance >= 60) {
                    description += "integrate personal care with professional effectiveness";
                } else {
                    description += "provide consistent, authentic interaction across contexts";
                }
                
                // Directness and confidence
                if (directness >= 60 && confidence >= 60) {
                    description += ", communicating with clear confidence and straightforward honesty";
                } else if (directness >= 60) {
                    description += ", offering honest feedback while remaining thoughtful";
                } else if (confidence >= 60) {
                    description += ", sharing strong perspectives while being diplomatically sensitive";
                } else {
                    description += ", taking a careful, considerate approach to communication";
                }
                break;
        }
        
        description += ".";
        return description;
    }

    // Legacy function for backward compatibility
    generatePersonalityDescription(parameters, traits) {
        const context = parameters._context || 'mixed';
        return this.generateContextualPersonalityDescription(parameters, context);
    }

    // Integration with existing parameter system
    applyOnboardResults(calculatedParameters) {
        // Update parameters through callback
        if (this.onParametersUpdate) {
            this.onParametersUpdate(calculatedParameters);
        }
        
        // Update the context display in the control panel
        this.updateControlPanelContext();
        
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
        // Get the context from parameters
        const context = newParameters._context || 'mixed';
        
        // Get the correct parameter names for this context
        const parameterNames = this.parameterDefinitions[context] || [];
        
        // Animate only the parameters that exist for this context
        parameterNames.forEach((param, index) => {
            // Only animate if the parameter exists in newParameters
            if (newParameters[param] !== undefined) {
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
                            track.style.background = 'linear-gradient(90deg, #284B63, #284B63)';
                        }, 500);
                    }
                }, index * 150);
            }
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
                questionnaireAnswers: this.questionnaireAnswers,
                selectedContext: this.selectedContext
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

    // Helper function to capitalize parameter names for display
    capitalizeParameter(param) {
        // Handle special cases first
        const specialCases = {
            'disagreement': 'Disagreement Level'
        };
        
        if (specialCases[param]) {
            return specialCases[param];
        }
        
        // Default capitalization
        return param.charAt(0).toUpperCase() + param.slice(1);
    }

    // Helper function to get context information
    getContextInfo(context) {
        const contextMap = {
            'personal': { label: 'Personal' },
            'professional': { label: 'Professional' },
            'mixed': { label: 'Mixed' }
        };
        return contextMap[context] || { label: 'Mixed' };
    }

    // Update control panel context display
    updateControlPanelContext() {
        if (this.selectedContext) {
            const contextDisplay = document.getElementById('currentContext');
            if (contextDisplay) {
                const contextLabels = {
                    'personal': 'Personal Use',
                    'professional': 'Professional Use', 
                    'mixed': 'Mixed Use'
                };
                contextDisplay.textContent = contextLabels[this.selectedContext] || 'Mixed Use';
            }
        }
    }

    // Add context indicator to results screen
    addContextIndicatorToResults(context) {
        const contextInfo = this.getContextInfo(context);
        const resultsTitle = document.querySelector('.results-title');
        
        if (resultsTitle) {
            const contextIndicator = document.createElement('div');
            contextIndicator.className = `results-context-indicator ${context}-context`;
            contextIndicator.innerHTML = `
                <span>${contextInfo.icon}</span>
                <span>Configured for ${contextInfo.label} Use</span>
            `;
            
            // Insert context indicator before the title
            resultsTitle.parentNode.insertBefore(contextIndicator, resultsTitle);
        }
    }

    // Show example responses based on parameters and context
    showExampleResponses(parameters) {
        const context = parameters._context || this.selectedContext;
        const examples = this.generateExampleResponses(parameters, context);
        
        // Find the personality summary and insert examples before it
        const personalitySummary = document.querySelector('.personality-summary');
        if (personalitySummary) {
            const exampleSection = document.createElement('div');
            exampleSection.className = 'example-responses';
            exampleSection.innerHTML = `
                <h4>
                    <span>🤖</span>
                    <span>Example AI Responses</span>
                </h4>
                <div class="example-responses-list">
                    ${examples.map(example => `
                        <div class="example-response-item">
                            <div class="example-prompt">${example.prompt}</div>
                            <div class="example-text">${example.response}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            personalitySummary.parentNode.insertBefore(exampleSection, personalitySummary);
        }
    }

    // Generate context-specific example responses
    generateExampleResponses(parameters, context) {
        const examples = [];
        
        switch (context) {
            case 'personal':
                const { empathy, supportiveness, creativity, warmth } = parameters;
                
                examples.push({
                    prompt: "How to deal with feeling overwhelmed",
                    response: empathy >= 60 && warmth >= 60 
                        ? "I can really understand how overwhelming that must feel. Let's take this one step at a time and find what works best for you."
                        : empathy >= 60
                        ? "That sounds really challenging. What aspects are feeling most overwhelming right now?"
                        : "Here are some practical strategies that often help when feeling overwhelmed..."
                });
                
                examples.push({
                    prompt: "Feedback on a creative project",
                    response: creativity >= 60 && supportiveness >= 60
                        ? "I love the creative direction you're exploring! What if we pushed this concept even further by experimenting with..."
                        : supportiveness >= 60
                        ? "You're making great progress on this. I can see the effort you've put in, and here are some ways to strengthen it..."
                        : "This shows solid fundamentals. Here are specific areas where you could refine the execution..."
                });
                break;
                
            case 'professional':
                const { authority, efficiency, formality, challenge } = parameters;
                
                examples.push({
                    prompt: "Strategy for market expansion",
                    response: authority >= 60 && efficiency >= 60
                        ? "Based on market analysis, I recommend prioritizing these three key markets with this specific timeline and resource allocation."
                        : authority >= 60
                        ? "My recommendation is to focus on these strategic opportunities based on our competitive advantages."
                        : "Let's evaluate the options together. Here are the key factors we should consider for market expansion..."
                });
                
                examples.push({
                    prompt: "Team performance concerns",
                    response: challenge >= 60 && formality >= 60
                        ? "We need to address these performance gaps systematically. Have we considered whether the current expectations are realistic given the resource constraints?"
                        : challenge >= 60
                        ? "I think we should examine whether there are underlying issues affecting performance that we haven't identified yet."
                        : "Let's discuss the specific performance concerns and work together to develop improvement strategies."
                });
                break;
                
            case 'mixed':
                const { adaptability, balance, directness, confidence } = parameters;
                
                examples.push({
                    prompt: "Work-life balance advice",
                    response: adaptability >= 60 && balance >= 60
                        ? "This requires a flexible approach that honors both your professional goals and personal well-being. Let's explore strategies that work for your specific situation."
                        : balance >= 60
                        ? "Finding the right balance is personal and situational. Here's how to think about integrating your work and life priorities..."
                        : "Here are some proven approaches to managing work-life boundaries that you can adapt to your needs."
                });
                
                examples.push({
                    prompt: "Decision between two opportunities",
                    response: directness >= 60 && confidence >= 60
                        ? "Based on your priorities and the data available, Option A aligns better with your long-term goals for these specific reasons."
                        : directness >= 60
                        ? "Here's my honest assessment of both options and which factors should weigh most heavily in your decision."
                        : "Both opportunities have merits. Let's work through the key considerations to help you make the best choice for your situation."
                });
                break;
        }
        
        return examples;
    }
}

// Export the OnboardingManager for use in app.js
window.OnboardingManager = OnboardingManager;