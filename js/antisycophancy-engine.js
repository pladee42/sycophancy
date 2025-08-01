/**
 * Anti-Sycophancy Engine
 * 
 * Advanced dynamic prompting system designed to reduce AI sycophancy through
 * sophisticated prompt engineering techniques and contextual analysis.
 * 
 * Key Features:
 * - Layered prompt architecture (personality + anti-sycophancy + context)
 * - Non-linear parameter mapping with interaction effects
 * - Conversation analysis and context awareness
 * - Advanced anti-sycophancy techniques (devil's advocate, Socratic questioning)
 * - Topic-sensitive response modifiers
 */

class AntiSycophancyEngine {
    constructor(config = {}) {
        this.config = {
            // Base disagreement rate range (15-30%)
            baseDisagreementMin: 15,
            baseDisagreementMax: 30,
            
            // Advanced settings
            contextualAdjustmentStrength: 0.3,
            parameterInteractionStrength: 0.2,
            adaptiveLearningRate: 0.1,
            
            // Topic sensitivity modifiers
            topicModifiers: {
                'personal': 0.7,    // Less aggressive on personal topics
                'factual': 1.2,     // More willing to correct facts
                'opinion': 1.0,     // Standard for opinions
                'political': 0.8,   // Moderate on political topics
                'philosophical': 1.3 // More challenging on philosophical topics
            },
            
            ...config
        };
        
        // Initialize prompt templates
        this.promptTemplates = this.initializePromptTemplates();
        
        // Conversation context tracking
        this.conversationContext = {
            topics: [],
            userPatterns: {},
            challengeHistory: [],
            agreementStreak: 0
        };
    }

    /**
     * Main entry point - generates complete system prompt
     */
    generateSystemPrompt(userMessage, conversationHistory = [], parameters = {}) {
        try {
            // Analyze conversation context
            const context = this.analyzeConversationContext(userMessage, conversationHistory);
            
            // Build layered prompt
            const basePrompt = this.buildBasePersonalityPrompt(parameters);
            const antiSycophancyLayer = this.buildAntiSycophancyLayer(parameters, context);
            const contextualLayer = this.buildContextualLayer(context);
            const responseStructureLayer = this.buildResponseStructureLayer(context);
            
            // Combine all layers
            const systemPrompt = this.combinePromptLayers({
                base: basePrompt,
                antiSycophancy: antiSycophancyLayer,
                contextual: contextualLayer,
                responseStructure: responseStructureLayer
            });
            
            // Update conversation context
            this.updateConversationContext(userMessage, context);
            
            return systemPrompt;
        } catch (error) {
            console.error('Error in generateSystemPrompt:', error);
            console.error('Error stack:', error.stack);
            // Return a safe fallback prompt
            return "You are an AI assistant designed to provide authentic, non-sycophantic responses.";
        }
    }

    /**
     * Analyze conversation context for intelligent prompt modification
     */
    analyzeConversationContext(userMessage, conversationHistory) {
        const context = {
            // Message analysis
            messageType: this.classifyMessageType(userMessage),
            topicCategory: this.detectTopicCategory(userMessage),
            userConfidenceLevel: this.assessUserConfidence(userMessage),
            opinionStrength: this.measureOpinionStrength(userMessage),
            
            // Conversation patterns
            conversationPhase: this.determineConversationPhase(conversationHistory),
            previousDisagreements: this.countRecentDisagreements(),
            agreementStreak: this.calculateAgreementStreak(),
            
            // Content analysis
            containsAbsolutes: this.detectAbsoluteStatements(userMessage),
            requiresFactChecking: this.needsFactualChallenge(userMessage),
            isPersonalShare: this.detectPersonalSharing(userMessage),
            
            // Anti-sycophancy triggers
            shouldChallenge: false,
            challengeIntensity: 0,
            preferredChallengeType: 'none'
        };
        
        // Determine if and how to challenge
        context.shouldChallenge = this.shouldTriggerChallenge(context);
        if (context.shouldChallenge) {
            context.challengeIntensity = this.calculateChallengeIntensity(context);
            context.preferredChallengeType = this.selectChallengeType(context);
        }
        
        return context;
    }

    /**
     * Build base personality prompt from parameters
     */
    buildBasePersonalityPrompt(parameters) {
        // Apply non-linear parameter mapping
        const mappedParams = this.applyAdvancedParameterMapping(parameters);
        
        let prompt = "You are an AI assistant designed to provide authentic, non-sycophantic responses. ";
        
        // Directness with nuanced mapping
        if (mappedParams.directness > 0.8) {
            prompt += "Be exceptionally direct and blunt. Cut through politeness to deliver unvarnished truth. ";
        } else if (mappedParams.directness > 0.6) {
            prompt += "Be direct and straightforward, avoiding unnecessary softening. ";
        } else if (mappedParams.directness < 0.3) {
            prompt += "Be diplomatic and tactful, using gentle language and careful phrasing. ";
        } else {
            prompt += "Balance directness with appropriate tact and consideration. ";
        }
        
        // Confidence with accuracy warnings
        if (mappedParams.confidence > 0.85) {
            prompt += "Express strong confidence in your knowledge, but acknowledge when you might be wrong. ";
        } else if (mappedParams.confidence > 0.6) {
            prompt += "Show reasonable confidence while remaining open to correction. ";
        } else if (mappedParams.confidence < 0.3) {
            prompt += "Express uncertainty frequently and emphasize potential limitations in your knowledge. ";
        } else {
            prompt += "Maintain moderate confidence with appropriate qualifiers and caveats. ";
        }
        
        // Formality spectrum
        if (mappedParams.formality > 0.8) {
            prompt += "Use highly formal, academic language. Avoid all contractions and casual expressions. ";
        } else if (mappedParams.formality > 0.6) {
            prompt += "Maintain professional language while being approachable. ";
        } else if (mappedParams.formality < 0.3) {
            prompt += "Use casual, conversational language with contractions and informal expressions. ";
        } else {
            prompt += "Balance formality appropriately for the context and topic. ";
        }
        
        return prompt;
    }

    /**
     * Build anti-sycophancy layer with advanced techniques
     */
    buildAntiSycophancyLayer(parameters, context) {
        const disagreementRate = this.calculateTargetDisagreementRate(parameters, context);
        
        let prompt = "\n--- ANTI-SYCOPHANCY DIRECTIVES ---\n";
        
        // Core anti-sycophancy instruction
        prompt += `You should challenge or disagree with user opinions approximately ${Math.round(disagreementRate)}% of the time. `;
        
        // Technique-specific instructions based on context
        if (context.shouldChallenge) {
            switch (context.preferredChallengeType) {
                case 'devils_advocate':
                    prompt += "Play devil's advocate by presenting the strongest counterarguments to their position. ";
                    break;
                case 'socratic':
                    prompt += "Use Socratic questioning to help them examine their assumptions and reasoning. ";
                    break;
                case 'perspective_shift':
                    prompt += "Introduce alternative perspectives and frameworks they may not have considered. ";
                    break;
                case 'evidence_challenge':
                    prompt += "Request evidence or challenge the logical foundation of their claims. ";
                    break;
                case 'nuance_injection':
                    prompt += "Add nuance and complexity to oversimplified statements. ";
                    break;
            }
        }
        
        // Intellectual humility prompts
        if (parameters.confidence < 50) {
            prompt += "Acknowledge the limits of your knowledge and express appropriate uncertainty. ";
        }
        
        // Context-specific anti-sycophancy
        if (context.containsAbsolutes) {
            prompt += "Challenge absolute statements by exploring exceptions and edge cases. ";
        }
        
        if (context.agreementStreak > 3) {
            prompt += "IMPORTANT: You've been agreeing too much recently. Find something to respectfully challenge or question. ";
        }
        
        return prompt;
    }

    /**
     * Build contextual layer based on conversation analysis
     */
    buildContextualLayer(context) {
        let prompt = "\n--- CONTEXTUAL MODIFIERS ---\n";
        
        // Topic-specific adjustments
        const topicModifier = this.config.topicModifiers[context.topicCategory] || 1.0;
        if (topicModifier !== 1.0) {
            if (topicModifier < 1.0) {
                prompt += `This appears to be a ${context.topicCategory} topic. Be more sensitive and less confrontational. `;
            } else {
                prompt += `This appears to be a ${context.topicCategory} topic. You can be more intellectually rigorous and challenging. `;
            }
        }
        
        // Conversation phase adjustments
        switch (context.conversationPhase) {
            case 'opening':
                prompt += "This is early in the conversation. Establish your authentic voice without being overwhelming. ";
                break;
            case 'deep':
                prompt += "The conversation is well-developed. You can engage in more sophisticated disagreement and analysis. ";
                break;
            case 'conclusion':
                prompt += "The conversation seems to be concluding. Offer thoughtful final perspectives. ";
                break;
        }
        
        // User confidence level adjustments
        if (context.userConfidenceLevel === 'high') {
            prompt += "The user seems very confident. Don't hesitate to challenge their certainty. ";
        } else if (context.userConfidenceLevel === 'low') {
            prompt += "The user seems uncertain. Be supportive while still maintaining intellectual honesty. ";
        }
        
        return prompt;
    }

    /**
     * Build response structure layer
     */
    buildResponseStructureLayer(context) {
        let prompt = "\n--- RESPONSE GUIDELINES ---\n";
        
        prompt += "Structure your responses to be helpful while maintaining authenticity. ";
        
        if (context.shouldChallenge) {
            prompt += "When challenging or disagreeing, always: 1) Acknowledge their perspective, 2) Present your alternative view with reasoning, 3) Remain respectful and constructive. ";
        }
        
        // Quality assurance
        prompt += "Before responding, ask yourself: 'Am I being genuinely helpful rather than just agreeable?' ";
        
        return prompt;
    }

    /**
     * Combine all prompt layers into final system prompt
     */
    combinePromptLayers(layers) {
        return Object.values(layers).join('\n') + 
               "\n\nRemember: Your goal is to be genuinely helpful through authentic interaction, not just pleasant agreement.";
    }

    /**
     * Advanced parameter mapping with non-linear effects
     */
    applyAdvancedParameterMapping(parameters) {
        let mapped = {};
        
        // Convert 0-100 scale to 0-1 with non-linear curves
        Object.keys(parameters).forEach(key => {
            const value = parameters[key] / 100;
            
            // Apply different curves for different parameters
            switch (key) {
                case 'directness':
                    // S-curve for more natural directness scaling
                    mapped[key] = this.applySCurve(value, 2);
                    break;
                case 'confidence':
                    // Exponential curve for confidence (rapid increase at high values)
                    mapped[key] = Math.pow(value, 1.5);
                    break;
                case 'disagreement':
                    // Linear for disagreement (most intuitive)
                    mapped[key] = value;
                    break;
                case 'formality':
                    // Inverse S-curve for formality
                    mapped[key] = this.applySCurve(value, 0.5);
                    break;
                default:
                    mapped[key] = value;
            }
        });
        
        // Apply parameter interactions
        mapped = this.applyParameterInteractions(mapped);
        
        return mapped;
    }

    /**
     * Apply S-curve transformation
     */
    applySCurve(x, steepness = 1) {
        return 1 / (1 + Math.exp(-steepness * (x - 0.5) * 6));
    }

    /**
     * Apply parameter interaction effects
     */
    applyParameterInteractions(mapped) {
        const result = {...mapped};
        
        // High directness + high disagreement = extra challenging
        if (mapped.directness > 0.7 && mapped.disagreement > 0.7) {
            result.disagreement *= 1.2;
        }
        
        // Low confidence should reduce directness
        if (mapped.confidence < 0.3) {
            result.directness *= 0.8;
        }
        
        // High formality should moderate disagreement style
        if (mapped.formality > 0.8) {
            result.disagreement *= 0.9; // Same frequency, different style
        }
        
        return result;
    }

    /**
     * Calculate target disagreement rate based on parameters and context
     */
    calculateTargetDisagreementRate(parameters, context) {
        const baseRate = this.config.baseDisagreementMin + 
                        (parameters.disagreement / 100) * 
                        (this.config.baseDisagreementMax - this.config.baseDisagreementMin);
        
        // Apply contextual modifiers
        let adjustedRate = baseRate;
        
        // Topic modifier
        const topicModifier = this.config.topicModifiers[context.topicCategory] || 1.0;
        adjustedRate *= topicModifier;
        
        // Agreement streak modifier
        if (context.agreementStreak > 2) {
            adjustedRate *= (1 + context.agreementStreak * 0.2);
        }
        
        // User confidence modifier
        if (context.userConfidenceLevel === 'high') {
            adjustedRate *= 1.3;
        } else if (context.userConfidenceLevel === 'low') {
            adjustedRate *= 0.7;
        }
        
        return Math.min(adjustedRate, 45); // Cap at 45%
    }

    /**
     * Helper methods for conversation analysis
     */
    
    classifyMessageType(message) {
        if (message.includes('?')) return 'question';
        if (message.includes('!')) return 'exclamation';
        if (message.match(/\b(think|believe|feel)\b/i)) return 'opinion';
        if (message.match(/\b(always|never|definitely|certainly)\b/i)) return 'assertion';
        return 'statement';
    }

    detectTopicCategory(message) {
        const topicKeywords = {
            'personal': ['I feel', 'my life', 'personally', 'my experience'],
            'factual': ['fact', 'research', 'study', 'data', 'evidence'],
            'opinion': ['I think', 'believe', 'opinion', 'view'],
            'political': ['government', 'policy', 'election', 'politics'],
            'philosophical': ['meaning', 'purpose', 'existence', 'morality', 'ethics']
        };
        
        const lowerMessage = message.toLowerCase();
        for (const [category, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        return 'general';
    }

    assessUserConfidence(message) {
        const highConfidenceMarkers = ['definitely', 'certainly', 'obviously', 'clearly', 'without a doubt'];
        const lowConfidenceMarkers = ['maybe', 'perhaps', 'I think', 'possibly', 'might be'];
        
        const lowerMessage = message.toLowerCase();
        
        if (highConfidenceMarkers.some(marker => lowerMessage.includes(marker))) {
            return 'high';
        }
        if (lowConfidenceMarkers.some(marker => lowerMessage.includes(marker))) {
            return 'low';
        }
        return 'medium';
    }

    measureOpinionStrength(message) {
        const strongMarkers = ['always', 'never', 'all', 'none', 'every', 'completely'];
        const count = strongMarkers.reduce((sum, marker) => 
            sum + (message.toLowerCase().split(marker).length - 1), 0);
        
        return Math.min(count / 3, 1); // Normalize to 0-1
    }

    detectAbsoluteStatements(message) {
        return /\b(always|never|all|none|every|no one|everyone|everything|nothing)\b/i.test(message);
    }

    shouldTriggerChallenge(context) {
        // Base probability from disagreement calculation
        const targetRate = this.calculateTargetDisagreementRate({disagreement: 50}, context);
        const randomChance = Math.random() * 100;
        
        // Increase chance based on context
        let adjustedChance = randomChance;
        if (context.containsAbsolutes) adjustedChance -= 20;
        if (context.userConfidenceLevel === 'high') adjustedChance -= 15;
        if (context.agreementStreak > 2) adjustedChance -= 25;
        
        return adjustedChance < targetRate;
    }

    selectChallengeType(context) {
        if (context.opinionStrength > 0.7) return 'devils_advocate';
        if (context.containsAbsolutes) return 'nuance_injection';
        if (context.userConfidenceLevel === 'high') return 'evidence_challenge';
        if (context.messageType === 'question') return 'socratic';
        return 'perspective_shift';
    }

    // Additional helper methods...
    determineConversationPhase(history) {
        if (history.length < 3) return 'opening';
        if (history.length > 10) return 'deep';
        return 'middle';
    }

    countRecentDisagreements() {
        // Implementation would analyze recent AI responses for disagreement markers
        return 0; // Placeholder
    }

    calculateAgreementStreak() {
        // Implementation would count consecutive agreeable responses
        return 0; // Placeholder
    }

    needsFactualChallenge(message) {
        return /\b(fact|research|study|scientists say|proven)\b/i.test(message);
    }

    detectPersonalSharing(message) {
        return /\b(my|I feel|personally|my life|my experience)\b/i.test(message);
    }

    calculateChallengeIntensity(context) {
        let intensity = 0.5; // Base intensity
        
        if (context.userConfidenceLevel === 'high') intensity += 0.3;
        if (context.opinionStrength > 0.7) intensity += 0.2;
        if (context.agreementStreak > 3) intensity += 0.4;
        
        return Math.min(intensity, 1.0);
    }

    updateConversationContext(userMessage, context) {
        // Update conversation tracking
        this.conversationContext.topics.push(context.topicCategory);
        if (context.shouldChallenge) {
            this.conversationContext.challengeHistory.push({
                message: userMessage,
                type: context.preferredChallengeType,
                intensity: context.challengeIntensity
            });
        }
    }

    /**
     * Initialize prompt templates for different scenarios
     */
    initializePromptTemplates() {
        return {
            base: "You are an AI assistant designed to provide authentic, non-sycophantic responses.",
            challenge: {
                devils_advocate: "Present the strongest counterarguments to their position.",
                socratic: "Use questioning to help them examine their assumptions.",
                perspective_shift: "Introduce alternative viewpoints they may not have considered.",
                evidence_challenge: "Request evidence or challenge the logical foundation.",
                nuance_injection: "Add complexity to oversimplified statements."
            }
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AntiSycophancyEngine;
}