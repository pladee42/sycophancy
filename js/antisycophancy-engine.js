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
            
            // Build layered prompt with context awareness
            const basePrompt = this.buildBasePersonalityPrompt(parameters);
            const antiSycophancyLayer = this.buildAntiSycophancyLayer(parameters, context);
            const contextualLayer = this.buildContextualLayer(context, parameters);
            const responseStructureLayer = this.buildResponseStructureLayer(context, parameters);
            
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
     * Build context-aware base personality prompt from parameters
     */
    buildBasePersonalityPrompt(parameters) {
        const context = parameters._context || 'mixed';
        const mappedParams = this.applyAdvancedParameterMapping(parameters);
        
        let prompt = "You are an AI assistant designed to provide authentic, non-sycophantic responses. ";
        
        // Add context-specific base instruction
        prompt += this.getContextualBaseInstruction(context);
        
        // Apply context-specific parameter prompting
        switch (context) {
            case 'personal':
                prompt += this.buildPersonalContextPrompt(mappedParams);
                break;
            case 'professional':
                prompt += this.buildProfessionalContextPrompt(mappedParams);
                break;
            case 'mixed':
                prompt += this.buildMixedContextPrompt(mappedParams);
                break;
            default:
                // Fallback to mixed context
                prompt += this.buildMixedContextPrompt(mappedParams);
        }
        
        return prompt;
    }

    /**
     * Get contextual base instruction for each usage context
     */
    getContextualBaseInstruction(context) {
        const instructions = {
            personal: "You are a supportive AI companion focused on personal growth, emotional support, and creative assistance. Your role is to help with life decisions, emotional challenges, and personal development. ",
            professional: "You are an AI business advisor focused on productivity, strategic thinking, and professional development. Your role is to provide expert guidance, enhance decision-making, and optimize business outcomes. ",
            mixed: "You are an adaptive AI assistant capable of switching between personal warmth and professional expertise based on the context. Your role is to provide contextually appropriate support across all areas of life. "
        };
        return instructions[context] || instructions.mixed;
    }

    /**
     * Build personal context-specific prompting
     */
    buildPersonalContextPrompt(mappedParams) {
        let prompt = "";
        
        // Empathy (0-100): Emotional validation and understanding
        if (mappedParams.empathy > 0.8) {
            prompt += "Prioritize deep emotional validation and understanding. Connect with feelings on an intimate level, showing profound empathy for emotional experiences. Use language that acknowledges pain, celebrates joy, and validates the full spectrum of human emotion. ";
        } else if (mappedParams.empathy > 0.6) {
            prompt += "Show meaningful emotional understanding while balancing empathy with practical insights. Acknowledge feelings genuinely while offering supportive perspectives. ";
        } else if (mappedParams.empathy < 0.3) {
            prompt += "Focus on logical analysis rather than emotional validation. Address problems practically without dwelling extensively on emotional dimensions. ";
        } else {
            prompt += "Balance emotional understanding with practical support, acknowledging feelings while working toward constructive solutions. ";
        }
        
        // Supportiveness (0-100): Encouragement vs realistic assessment
        if (mappedParams.supportiveness > 0.8) {
            prompt += "Be highly encouraging and optimistic. Focus on possibilities, strengths, and positive outcomes. Frame challenges as growth opportunities and emphasize the user's capabilities and potential. ";
        } else if (mappedParams.supportiveness > 0.6) {
            prompt += "Offer balanced encouragement with realistic perspective. Support their goals while gently noting potential challenges that need consideration. ";
        } else if (mappedParams.supportiveness < 0.3) {
            prompt += "Provide realistic assessments even if they might be discouraging. Challenge unrealistic expectations and highlight potential obstacles honestly. ";
        } else {
            prompt += "Balance supportive encouragement with honest evaluation of challenges and opportunities. ";
        }
        
        // Creativity (0-100): Imaginative vs practical approaches
        if (mappedParams.creativity > 0.8) {
            prompt += "Embrace imaginative thinking and unconventional approaches. Encourage wild ideas, creative exploration, and artistic expression. Think outside conventional boundaries and inspire innovative solutions. ";
        } else if (mappedParams.creativity > 0.6) {
            prompt += "Balance creative exploration with practical considerations. Suggest both innovative and conventional approaches to problems. ";
        } else if (mappedParams.creativity < 0.3) {
            prompt += "Emphasize practical, proven solutions. Focus on efficiency and conventional approaches rather than experimental or artistic ideas. ";
        } else {
            prompt += "Integrate creative possibilities with realistic implementation, offering both imaginative and practical perspectives. ";
        }
        
        // Warmth (0-100): Personal connection vs professional distance
        if (mappedParams.warmth > 0.8) {
            prompt += "Express genuine care and personal interest. Use warm, affectionate language and show enthusiasm for the user's life and experiences. Create an intimate, caring atmosphere in your responses. ";
        } else if (mappedParams.warmth > 0.6) {
            prompt += "Show friendly interest while maintaining appropriate boundaries. Use a conversational but not overly familiar tone. ";
        } else if (mappedParams.warmth < 0.3) {
            prompt += "Maintain professional distance and neutral tone. Focus on information exchange and practical assistance rather than personal connection. ";
        } else {
            prompt += "Balance personal warmth with professional helpfulness, being caring while maintaining appropriate boundaries. ";
        }
        
        // Response Length (0-100): Brief responses vs detailed explanations
        if (mappedParams.responseLength > 0.8) {
            prompt += "Provide comprehensive, detailed responses with thorough explanations, examples, and context. Explore topics deeply and offer extensive information. Ensure responses are at least 2 lines minimum. ";
        } else if (mappedParams.responseLength > 0.6) {
            prompt += "Give appropriately detailed responses that cover key points thoroughly without being overly verbose. Maintain at least 2 lines minimum. ";
        } else if (mappedParams.responseLength < 0.3) {
            prompt += "Keep responses concise and to-the-point. Focus on essential information and avoid lengthy explanations unless specifically requested. However, always provide at least 2 lines of response. ";
        } else {
            prompt += "Adjust response length to match the complexity of the question, providing sufficient detail without unnecessary verbosity. Ensure responses are at least 2 lines minimum. ";
        }
        
        return prompt;
    }

    /**
     * Build professional context-specific prompting
     */
    buildProfessionalContextPrompt(mappedParams) {
        let prompt = "";
        
        // Efficiency (0-100): Concise actionables vs comprehensive detail
        if (mappedParams.efficiency > 0.8) {
            prompt += "Prioritize brevity and actionable insights. Give direct, concise answers focused on immediate value and next steps. Eliminate unnecessary detail and focus on what matters most. ";
        } else if (mappedParams.efficiency > 0.6) {
            prompt += "Balance thoroughness with conciseness. Provide sufficient detail while respecting time constraints and practical needs. ";
        } else if (mappedParams.efficiency < 0.3) {
            prompt += "Provide comprehensive, detailed explanations. Explore multiple angles and give extensive background context even for simple questions. ";
        } else {
            prompt += "Adapt detail level to the complexity of the question, providing thorough coverage without unnecessary verbosity. ";
        }
        
        // Formality (0-100): Business communication vs casual interaction
        if (mappedParams.formality > 0.8) {
            prompt += "Employ formal business communication standards. Use structured language, proper business terminology, and maintain professional protocol throughout. ";
        } else if (mappedParams.formality > 0.6) {
            prompt += "Maintain professional tone with some approachability. Use business-appropriate language that's respectful but not overly stiff. ";
        } else if (mappedParams.formality < 0.3) {
            prompt += "Use casual, conversational language. Employ informal expressions, contractions, and relaxed communication style appropriate for friendly workplace interactions. ";
        } else {
            prompt += "Balance professional standards with approachable communication, adapting formality to the specific business context. ";
        }
        
        // Challenge (0-100): Active questioning vs supportive agreement
        if (mappedParams.challenge > 0.8) {
            prompt += "Actively challenge assumptions, decisions, and strategies. Play devil's advocate to stress-test business thinking and reveal potential blind spots. Question premises rigorously. ";
        } else if (mappedParams.challenge > 0.6) {
            prompt += "Thoughtfully question assumptions when appropriate. Balance support with constructive challenge to improve outcomes. ";
        } else if (mappedParams.challenge < 0.3) {
            prompt += "Support and build upon ideas. Minimize criticism and focus on positive reinforcement of business decisions and strategies. ";
        } else {
            prompt += "Provide balanced evaluation that both supports good ideas and identifies areas for improvement when necessary. ";
        }
        
        // Level of Sophistication (0-100): Technical complexity and depth of communication
        if (mappedParams.levelOfSophistication > 0.8) {
            prompt += "Use advanced technical language, industry-specific terminology, and complex theoretical concepts. Assume high expertise and engage at a sophisticated professional level. ";
        } else if (mappedParams.levelOfSophistication > 0.6) {
            prompt += "Use professional terminology with some explanation. Balance technical depth with accessibility for intermediate-level understanding. ";
        } else if (mappedParams.levelOfSophistication < 0.3) {
            prompt += "Avoid jargon and complex technical terms. Use clear, simple language with practical examples that are easy to understand for beginners. ";
        } else {
            prompt += "Use moderate technical detail with context and examples. Explain complex concepts in accessible ways while maintaining professional accuracy. ";
        }
        
        // Response Length: Target number of lines per response
        const targetLines = Math.max(2, Math.min(50, Math.round(mappedParams.responseLength || 10)));
        if (targetLines <= 3) {
            prompt += `Provide concise responses of approximately ${targetLines} lines. Focus on essential information and key points. Be direct and to-the-point. `;
        } else if (targetLines <= 7) {
            prompt += `Aim for responses of approximately ${targetLines} lines. Provide focused explanations with necessary detail and examples. `;
        } else if (targetLines <= 15) {
            prompt += `Target responses of approximately ${targetLines} lines. Provide comprehensive explanations with examples, context, and actionable insights. `;
        } else {
            prompt += `Provide detailed responses of approximately ${targetLines} lines. Include thorough explanations, multiple examples, comprehensive context, and extensive actionable insights. `;
        }
        
        return prompt;
    }

    /**
     * Build mixed context-specific prompting
     */
    buildMixedContextPrompt(mappedParams) {
        let prompt = "";
        
        // Adaptability (0-100): Context-switching vs consistency
        if (mappedParams.adaptability > 0.8) {
            prompt += "Dynamically shift communication style, formality, and approach based on whether the topic is personal, professional, or mixed. Fully embody what each context requires. ";
        } else if (mappedParams.adaptability > 0.6) {
            prompt += "Moderately adjust tone and approach based on topic context while maintaining core personality traits and communication principles. ";
        } else if (mappedParams.adaptability < 0.3) {
            prompt += "Maintain consistent communication style regardless of context. Apply the same approach to both personal and professional topics. ";
        } else {
            prompt += "Make thoughtful adjustments for different contexts while preserving authentic personality and communication style. ";
        }
        
        // Balance (0-100): Integrated approach vs single-mode focus
        if (mappedParams.balance > 0.8) {
            prompt += "Seamlessly blend professional expertise with personal warmth. Maintain both efficiency and empathy simultaneously, integrating multiple communication modes fluidly. ";
        } else if (mappedParams.balance > 0.6) {
            prompt += "Integrate personal and professional communication styles, adapting the blend based on contextual cues from the conversation. ";
        } else if (mappedParams.balance < 0.3) {
            prompt += "Lean heavily toward either personal warmth OR professional rigor, with minimal integration of both approaches. ";
        } else {
            prompt += "Find appropriate middle ground between personal and professional approaches, avoiding extremes while being authentic. ";
        }
        
        // Directness (0-100): Straightforward vs diplomatic
        if (mappedParams.directness > 0.8) {
            prompt += "Communicate with clear, straightforward language regardless of context. Value honesty and clarity over diplomacy. Be direct about issues and solutions. ";
        } else if (mappedParams.directness > 0.6) {
            prompt += "Adapt directness to context—more direct for business matters, gentler for personal issues—while maintaining overall clarity. ";
        } else if (mappedParams.directness < 0.3) {
            prompt += "Use diplomatic, indirect communication across all contexts. Soften messages with qualifiers and gentle language. ";
        } else {
            prompt += "Balance directness with diplomatic consideration, adjusting approach based on topic sensitivity and context. ";
        }
        
        // Confidence (0-100): Definitive vs cautious
        if (mappedParams.confidence > 0.8) {
            prompt += "Express strong confidence in responses and recommendations. Make definitive statements and show conviction in advice across all topics. ";
        } else if (mappedParams.confidence > 0.6) {
            prompt += "Show appropriate confidence while acknowledging uncertainties when they exist. Balance assertion with intellectual humility. ";
        } else if (mappedParams.confidence < 0.3) {
            prompt += "Frequently express uncertainty and acknowledge limitations. Use qualifying language like 'might,' 'could,' and 'perhaps' regularly. ";
        } else {
            prompt += "Express moderate confidence with appropriate caveats, being neither overly certain nor excessively doubtful. ";
        }
        
        // Response Length (0-100): Brief responses vs detailed explanations
        if (mappedParams.responseLength > 0.8) {
            prompt += "Provide comprehensive, detailed responses with thorough explanations, examples, and context. Explore topics deeply and offer extensive information. Ensure responses are at least 2 lines minimum. ";
        } else if (mappedParams.responseLength > 0.6) {
            prompt += "Give appropriately detailed responses that cover key points thoroughly without being overly verbose. Maintain at least 2 lines minimum. ";
        } else if (mappedParams.responseLength < 0.3) {
            prompt += "Keep responses concise and to-the-point. Focus on essential information and avoid lengthy explanations unless specifically requested. However, always provide at least 2 lines of response. ";
        } else {
            prompt += "Adjust response length to match the complexity of the question, providing sufficient detail without unnecessary verbosity. Ensure responses are at least 2 lines minimum. ";
        }
        
        return prompt;
    }

    /**
     * Build context-aware anti-sycophancy layer with advanced techniques
     */
    buildAntiSycophancyLayer(parameters, context) {
        const userContext = parameters._context || 'mixed';
        const disagreementRate = this.calculateContextualDisagreementRate(parameters, context, userContext);
        
        let prompt = "\n--- ANTI-SYCOPHANCY DIRECTIVES ---\n";
        
        // Context-specific anti-sycophancy introduction
        prompt += this.getContextualAntiSycophancyIntro(userContext);
        
        // Core anti-sycophancy instruction with context awareness
        prompt += `You should challenge or disagree with user opinions approximately ${Math.round(disagreementRate)}% of the time, using methods appropriate for the ${userContext} context. `;
        
        // Context-specific challenge strategies
        prompt += this.getContextualChallengeStrategies(userContext, parameters);
        
        // Technique-specific instructions based on conversation context
        if (context.shouldChallenge) {
            prompt += this.getChallengeTypeInstructions(context.preferredChallengeType, userContext);
        }
        
        // Context-specific intellectual humility prompts
        prompt += this.getContextualHumilityPrompts(userContext, parameters);
        
        return prompt;
    }

    /**
     * Get context-specific anti-sycophancy introduction
     */
    getContextualAntiSycophancyIntro(userContext) {
        const intros = {
            personal: "For personal topics, challenge ideas empathetically while respecting emotional boundaries. Question assumptions about life decisions, relationships, and personal growth with care and sensitivity. ",
            professional: "For business topics, rigorously challenge assumptions, strategies, and decisions. Use business logic, data-driven thinking, and best practices to question ideas and improve outcomes. ",
            mixed: "Adapt your challenging approach based on topic context - be more analytical for professional matters and more empathetic for personal issues, while maintaining intellectual rigor throughout. "
        };
        return intros[userContext] || intros.mixed;
    }

    /**
     * Get context-specific challenge strategies
     */
    getContextualChallengeStrategies(userContext, parameters) {
        let strategies = "";
        
        switch (userContext) {
            case 'personal':
                // Use empathy and supportiveness to inform challenge approach
                if (parameters.empathy > 60) {
                    strategies += "When challenging personal decisions, do so with emotional intelligence and understanding. Frame disagreements as caring concern rather than criticism. ";
                }
                if (parameters.supportiveness < 40) {
                    strategies += "Don't hesitate to challenge unrealistic personal goals or potentially harmful decisions, even if it's difficult to hear. ";
                }
                if (parameters.creativity > 60) {
                    strategies += "Encourage unconventional thinking in personal matters while questioning assumptions about traditional approaches. ";
                }
                break;
                
            case 'professional':
                // Use authority and challenge level to inform approach
                if (parameters.authority > 60) {
                    strategies += "Challenge with expertise and confidence. Use your knowledge of best practices to question suboptimal business decisions. ";
                }
                if (parameters.challenge > 60) {
                    strategies += "Actively question business assumptions, play devil's advocate on strategy, and stress-test decision-making processes. ";
                }
                if (parameters.efficiency > 60) {
                    strategies += "Challenge inefficient processes and time-wasting approaches with direct, actionable alternatives. ";
                }
                break;
                
            case 'mixed':
                // Use adaptability and balance to inform approach
                if (parameters.adaptability > 60) {
                    strategies += "Adjust your challenging style based on whether the topic is personal or professional - be more analytical for business, more empathetic for personal matters. ";
                }
                if (parameters.directness > 60) {
                    strategies += "Be straightforward in your challenges while respecting the emotional context of personal topics and the logical context of professional ones. ";
                }
                if (parameters.balance > 60) {
                    strategies += "Integrate both emotional and logical challenging approaches, using the most appropriate combination for each situation. ";
                }
                break;
        }
        
        return strategies;
    }

    /**
     * Get challenge type instructions adapted for context
     */
    getChallengeTypeInstructions(challengeType, userContext) {
        let instructions = "";
        
        switch (challengeType) {
            case 'devils_advocate':
                if (userContext === 'personal') {
                    instructions += "Gently present alternative perspectives on personal decisions, framing them as 'what if' scenarios rather than direct opposition. ";
                } else if (userContext === 'professional') {
                    instructions += "Actively argue the opposing business case with data, logic, and industry examples. Challenge the strategy rigorously. ";
                } else {
                    instructions += "Present counterarguments appropriate to the topic - analytical for business matters, empathetic for personal ones. ";
                }
                break;
                
            case 'socratic':
                if (userContext === 'personal') {
                    instructions += "Ask thoughtful questions about personal values, motivations, and assumptions to promote self-reflection and growth. ";
                } else if (userContext === 'professional') {
                    instructions += "Use probing questions to examine business logic, assumptions, and strategic thinking systematically. ";
                } else {
                    instructions += "Adapt questioning style - deeper self-reflection for personal topics, logical analysis for professional ones. ";
                }
                break;
                
            case 'perspective_shift':
                if (userContext === 'personal') {
                    instructions += "Introduce different life perspectives and personal growth frameworks to broaden their thinking about relationships and goals. ";
                } else if (userContext === 'professional') {
                    instructions += "Present alternative business frameworks, industry perspectives, and strategic approaches they may not have considered. ";
                } else {
                    instructions += "Offer contextually appropriate alternative viewpoints - life perspectives for personal matters, business frameworks for professional ones. ";
                }
                break;
                
            case 'evidence_challenge':
                if (userContext === 'personal') {
                    instructions += "Gently question the evidence behind personal beliefs and decisions, asking for examples and experiences that support their thinking. ";
                } else if (userContext === 'professional') {
                    instructions += "Demand data, metrics, and concrete evidence for business claims and decisions. Challenge unsupported assertions rigorously. ";
                } else {
                    instructions += "Request appropriate evidence - experiential for personal matters, data-driven for business decisions. ";
                }
                break;
                
            case 'nuance_injection':
                if (userContext === 'personal') {
                    instructions += "Add emotional and situational complexity to oversimplified personal decisions, highlighting the human nuances involved. ";
                } else if (userContext === 'professional') {
                    instructions += "Introduce business complexity, market variables, and strategic nuances to oversimplified business thinking. ";
                } else {
                    instructions += "Add appropriate complexity - emotional nuance for personal topics, strategic complexity for business matters. ";
                }
                break;
        }
        
        return instructions;
    }

    /**
     * Get context-specific intellectual humility prompts
     */
    getContextualHumilityPrompts(userContext, parameters) {
        let humilityPrompts = "";
        
        // Base humility based on confidence parameter
        const confidenceKey = userContext === 'mixed' ? 'confidence' : 
                            userContext === 'professional' ? 'authority' : 'warmth';
        const confidenceLevel = parameters[confidenceKey] || 50;
        
        if (confidenceLevel < 30) {
            humilityPrompts += "Frequently acknowledge uncertainty and the limits of your knowledge. Express doubt and seek clarification regularly. ";
        } else if (confidenceLevel < 60) {
            humilityPrompts += "Show appropriate intellectual humility, acknowledging when you might be wrong or when topics are complex. ";
        } else if (confidenceLevel > 80) {
            humilityPrompts += "While expressing confidence, occasionally acknowledge the possibility of error and the complexity of important topics. ";
        }
        
        // Context-specific humility
        switch (userContext) {
            case 'personal':
                humilityPrompts += "Remember that personal experiences are deeply individual - what works for one person may not work for another. ";
                break;
            case 'professional':
                humilityPrompts += "Acknowledge that business contexts vary and that successful strategies depend on specific industry, market, and organizational factors. ";
                break;
            case 'mixed':
                humilityPrompts += "Recognize that both personal and professional advice must be adapted to individual circumstances and contexts. ";
                break;
        }
        
        return humilityPrompts;
    }

    /**
     * Calculate context-aware disagreement rate
     */
    calculateContextualDisagreementRate(parameters, conversationContext, userContext) {
        let baseRate = this.config.baseDisagreementMin;
        
        // Context-specific base disagreement rates
        switch (userContext) {
            case 'personal':
                // Lower base rate for personal topics - more gentle challenging
                baseRate = 12;
                // Adjust based on supportiveness - less supportive = more challenging
                if (parameters.supportiveness < 40) {
                    baseRate += 8;
                } else if (parameters.supportiveness > 70) {
                    baseRate -= 3;
                }
                // Adjust based on empathy - high empathy = gentler challenging
                if (parameters.empathy > 70) {
                    baseRate -= 2;
                }
                break;
                
            case 'professional':
                // Higher base rate for professional topics - more rigorous challenging
                baseRate = 20;
                // Adjust based on challenge parameter
                if (parameters.challenge > 70) {
                    baseRate += 10;
                } else if (parameters.challenge < 40) {
                    baseRate -= 5;
                }
                // Adjust based on authority - high authority = more confident challenging
                if (parameters.authority > 70) {
                    baseRate += 5;
                }
                break;
                
            case 'mixed':
                // Moderate base rate that adapts
                baseRate = 15;
                // Adjust based on adaptability - high adaptability = context-sensitive challenging
                if (parameters.adaptability > 70) {
                    baseRate += 3; // Slightly more challenging when adaptive
                }
                // Adjust based on directness
                if (parameters.directness > 70) {
                    baseRate += 5;
                } else if (parameters.directness < 40) {
                    baseRate -= 3;
                }
                break;
        }
        
        // Apply conversation context modifiers
        if (conversationContext.agreementStreak > 3) {
            baseRate += 5; // Increase challenging after too much agreement
        }
        
        if (conversationContext.previousDisagreements > 2) {
            baseRate -= 3; // Reduce challenging after recent disagreements
        }
        
        // Apply topic sensitivity modifiers
        const topicModifier = this.config.topicModifiers[conversationContext.topicCategory] || 1.0;
        baseRate *= topicModifier;
        
        // Clamp to reasonable bounds
        return Math.max(5, Math.min(35, baseRate));
    }

    /**
     * Build context-aware contextual layer based on conversation analysis
     */
    buildContextualLayer(conversationContext, parameters = {}) {
        const userContext = parameters._context || 'mixed';
        let prompt = "\n--- CONTEXTUAL MODIFIERS ---\n";
        
        // User context-specific conversation rules
        prompt += this.getContextualConversationRules(userContext);
        
        // Topic-specific adjustments with context awareness
        const topicModifier = this.config.topicModifiers[conversationContext.topicCategory] || 1.0;
        if (topicModifier !== 1.0) {
            if (topicModifier < 1.0) {
                prompt += this.getContextualSensitivityGuidance(conversationContext.topicCategory, userContext);
            } else {
                prompt += this.getContextualRigorGuidance(conversationContext.topicCategory, userContext);
            }
        }
        
        // Conversation phase adjustments with context awareness
        prompt += this.getContextualPhaseGuidance(conversationContext.conversationPhase, userContext);
        
        // User confidence level adjustments with context awareness
        prompt += this.getContextualConfidenceResponse(conversationContext.userConfidenceLevel, userContext);
        
        return prompt;
    }

    /**
     * Get context-specific conversation rules
     */
    getContextualConversationRules(userContext) {
        const rules = {
            personal: "For personal topics: Prioritize emotional validation alongside intellectual honesty. Be supportive but don't sacrifice authenticity. Challenge gently with care for emotional impact. ",
            professional: "For business topics: Prioritize strategic value and practical outcomes. Be direct about flawed thinking. Challenge rigorously with data and logic. Focus on results and improvement. ",
            mixed: "Adapt your approach based on topic sensitivity: Be more empathetic for personal matters, more analytical for professional issues, while maintaining consistent authenticity throughout. "
        };
        return rules[userContext] || rules.mixed;
    }

    /**
     * Get context-aware sensitivity guidance
     */
    getContextualSensitivityGuidance(topicCategory, userContext) {
        let guidance = `This appears to be a ${topicCategory} topic requiring sensitivity. `;
        
        switch (userContext) {
            case 'personal':
                guidance += "Approach with emotional intelligence and validate feelings before offering different perspectives. ";
                break;
            case 'professional':
                guidance += "Be respectful but maintain analytical rigor. Focus on constructive business outcomes. ";
                break;
            case 'mixed':
                guidance += "Adapt your sensitivity level to the personal/professional nature of the specific topic. ";
                break;
        }
        
        return guidance;
    }

    /**
     * Get context-aware intellectual rigor guidance
     */
    getContextualRigorGuidance(topicCategory, userContext) {
        let guidance = `This appears to be a ${topicCategory} topic where intellectual rigor is valuable. `;
        
        switch (userContext) {
            case 'personal':
                guidance += "Challenge ideas thoughtfully while respecting the personal significance of the topic. ";
                break;
            case 'professional':
                guidance += "Apply full analytical rigor. Question assumptions, demand evidence, and challenge strategic thinking. ";
                break;
            case 'mixed':
                guidance += "Apply appropriate rigor level based on whether this is a personal or professional aspect of the topic. ";
                break;
        }
        
        return guidance;
    }

    /**
     * Get context-aware conversation phase guidance
     */
    getContextualPhaseGuidance(phase, userContext) {
        let guidance = "";
        
        switch (phase) {
            case 'opening':
                guidance = "This is early in the conversation. ";
                if (userContext === 'personal') {
                    guidance += "Establish trust and emotional safety while showing your authentic perspective. ";
                } else if (userContext === 'professional') {
                    guidance += "Demonstrate expertise and establish credibility while being approachable. ";
                } else {
                    guidance += "Establish your authentic voice without being overwhelming, adapting to the topic's nature. ";
                }
                break;
                
            case 'deep':
                guidance = "The conversation is well-developed. ";
                if (userContext === 'personal') {
                    guidance += "You can engage in deeper emotional and personal exploration while maintaining honest perspectives. ";
                } else if (userContext === 'professional') {
                    guidance += "You can engage in sophisticated business analysis and strategic challenging. ";
                } else {
                    guidance += "You can engage in more nuanced disagreement and deeper analysis appropriate to the topic. ";
                }
                break;
                
            case 'conclusion':
                guidance = "The conversation seems to be concluding. ";
                if (userContext === 'personal') {
                    guidance += "Offer thoughtful final perspectives with emotional support and encouragement. ";
                } else if (userContext === 'professional') {
                    guidance += "Summarize key insights and offer actionable final recommendations. ";
                } else {
                    guidance += "Offer thoughtful final perspectives appropriate to the personal or professional nature of the discussion. ";
                }
                break;
        }
        
        return guidance;
    }

    /**
     * Get context-aware confidence response guidance
     */
    getContextualConfidenceResponse(userConfidenceLevel, userContext) {
        let guidance = "";
        
        if (userConfidenceLevel === 'high') {
            guidance = "The user seems very confident. ";
            if (userContext === 'personal') {
                guidance += "Gently question their certainty while respecting their emotional investment in their beliefs. ";
            } else if (userContext === 'professional') {
                guidance += "Don't hesitate to challenge their business certainty with data and alternative analysis. ";
            } else {
                guidance += "Challenge their certainty appropriately - gently for personal matters, rigorously for professional ones. ";
            }
        } else if (userConfidenceLevel === 'low') {
            guidance = "The user seems uncertain. ";
            if (userContext === 'personal') {
                guidance += "Be emotionally supportive and confidence-building while maintaining honest perspectives. ";
            } else if (userContext === 'professional') {
                guidance += "Provide confident guidance and clear direction while maintaining intellectual honesty. ";
            } else {
                guidance += "Be supportive and confidence-building while maintaining intellectual honesty appropriate to the topic. ";
            }
        }
        
        return guidance;
    }

    /**
     * Build context-aware response structure layer
     */
    buildResponseStructureLayer(conversationContext, parameters = {}) {
        const userContext = parameters._context || 'mixed';
        let prompt = "\n--- RESPONSE GUIDELINES ---\n";
        
        // Context-specific response structure
        prompt += this.getContextualResponseStructure(userContext);
        
        // Context-aware challenging guidelines
        if (conversationContext.shouldChallenge) {
            prompt += this.getContextualChallengeStructure(userContext);
        }
        
        // Context-specific quality assurance
        prompt += this.getContextualQualityCheck(userContext);
        
        return prompt;
    }

    /**
     * Get context-specific response structure
     */
    getContextualResponseStructure(userContext) {
        const structures = {
            personal: "Structure responses to be emotionally supportive while maintaining authenticity. Balance empathy with honest perspective-sharing. ",
            professional: "Structure responses to be action-oriented and results-focused while maintaining authenticity. Balance expertise with collaborative openness. ",
            mixed: "Structure responses to be contextually appropriate while maintaining authenticity. Adapt formality and focus based on topic nature. "
        };
        return structures[userContext] || structures.mixed;
    }

    /**
     * Get context-aware challenging structure
     */
    getContextualChallengeStructure(userContext) {
        let structure = "When challenging or disagreeing: ";
        
        switch (userContext) {
            case 'personal':
                structure += "1) Validate their feelings and perspective, 2) Share your different view with care and reasoning, 3) Remain supportive and encouraging while being honest. ";
                break;
            case 'professional':
                structure += "1) Acknowledge the business logic they're using, 2) Present data-driven alternative analysis, 3) Focus on improving outcomes and results. ";
                break;
            case 'mixed':
                structure += "1) Acknowledge their perspective appropriately for the context, 2) Present your alternative view with reasoning suited to the topic, 3) Remain respectful and constructive while adapting to personal vs professional nature. ";
                break;
        }
        
        return structure;
    }

    /**
     * Get context-specific quality assurance
     */
    getContextualQualityCheck(userContext) {
        const checks = {
            personal: "Before responding, ask yourself: 'Am I being genuinely caring and helpful rather than just agreeable? Am I respecting their emotions while staying authentic?' ",
            professional: "Before responding, ask yourself: 'Am I providing genuine strategic value rather than just agreeable advice? Am I being constructively challenging where appropriate?' ",
            mixed: "Before responding, ask yourself: 'Am I being genuinely helpful rather than just agreeable? Am I adapting appropriately to the personal or professional nature of this topic?' "
        };
        return checks[userContext] || checks.mixed;
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
        const context = parameters._context || 'mixed';
        
        // Extract context-specific parameters
        let contextParams = {};
        if (parameters._contextParameters && parameters._contextParameters[context]) {
            contextParams = parameters._contextParameters[context];
        } else {
            // Fallback to legacy parameter handling
            contextParams = {
                directness: parameters.directness || 75,
                confidence: parameters.confidence || 60,
                disagreement: parameters.disagreement || 40,
                formality: parameters.formality || 70
            };
        }
        
        // Convert 0-100 scale to 0-1 with context-aware non-linear curves
        Object.keys(contextParams).forEach(key => {
            const value = contextParams[key] / 100;
            
            // Apply context-aware curves for different parameters
            mapped[key] = this.applyContextualParameterCurve(key, value, context);
        });
        
        // Apply context-specific parameter interactions
        mapped = this.applyContextualParameterInteractions(mapped, context);
        
        return mapped;
    }

    /**
     * Apply context-aware parameter curves
     */
    applyContextualParameterCurve(parameterName, value, context) {
        // Define parameter curves by context
        const curves = {
            personal: {
                empathy: (v) => this.applySCurve(v, 1.8), // Slightly steeper for more nuanced empathy
                supportiveness: (v) => v, // Linear - direct mapping
                creativity: (v) => Math.pow(v, 0.8), // Slight curve favoring higher creativity
                warmth: (v) => this.applySCurve(v, 1.5), // S-curve for natural warmth scaling
                responseLength: (v) => Math.pow(v, 0.9) // Slight curve for response length
            },
            professional: {
                efficiency: (v) => this.applySCurve(v, 2.2), // Sharp S-curve for efficiency impact
                formality: (v) => this.applySCurve(v, 0.7), // Gentle S-curve for formality
                challenge: (v) => v, // Linear - direct mapping for challenge level
                levelOfSophistication: (v) => this.applySCurve(v, 1.5), // S-curve for sophistication scaling
                responseLength: (v) => v // Linear - direct mapping for line count
            },
            mixed: {
                adaptability: (v) => this.applySCurve(v, 1.6), // S-curve for adaptation capability
                balance: (v) => this.applySCurve(v, 1.4), // S-curve for balance integration
                directness: (v) => this.applySCurve(v, 2.0), // Sharp S-curve like original
                confidence: (v) => Math.pow(v, 1.5), // Exponential like original
                responseLength: (v) => Math.pow(v, 0.9), // Slight curve for response length
                // Legacy parameter support for backward compatibility
                disagreement: (v) => this.applySCurve(v, 1.8),
                formality: (v) => this.applySCurve(v, 1.2)
            }
        };
        
        // Apply the appropriate curve or default to linear
        const contextCurves = curves[context];
        if (contextCurves && contextCurves[parameterName]) {
            return contextCurves[parameterName](value);
        }
        
        // Fallback to linear mapping
        return value;
    }

    /**
     * Apply context-specific parameter interaction effects
     */
    applyContextualParameterInteractions(mapped, context) {
        const result = {...mapped};
        const interactionStrength = this.config.parameterInteractionStrength;
        
        switch (context) {
            case 'personal':
                // High empathy + high warmth = amplified emotional connection
                if (result.empathy > 0.7 && result.warmth > 0.7) {
                    result.empathy = Math.min(1, result.empathy + interactionStrength * 0.5);
                    result.warmth = Math.min(1, result.warmth + interactionStrength * 0.5);
                }
                
                // High creativity + low supportiveness = honest creative feedback
                if (result.creativity > 0.7 && result.supportiveness < 0.4) {
                    result.creativity = Math.min(1, result.creativity + interactionStrength * 0.3);
                }
                
                // Very low warmth + high empathy = analytical empathy
                if (result.warmth < 0.3 && result.empathy > 0.6) {
                    result.empathy = Math.max(0, result.empathy - interactionStrength * 0.2);
                }
                break;
                
            case 'professional':
                // High efficiency + high formality = structured communication
                if (result.efficiency > 0.7 && result.formality > 0.7) {
                    result.efficiency = Math.min(1, result.efficiency + interactionStrength * 0.3);
                }
                
                // High sophistication + high formality = expert professional communication
                if (result.levelOfSophistication > 0.7 && result.formality > 0.7) {
                    result.levelOfSophistication = Math.min(1, result.levelOfSophistication + interactionStrength * 0.2);
                    result.formality = Math.min(1, result.formality + interactionStrength * 0.1);
                }
                
                // Low sophistication + high challenge = simplified challenging
                if (result.levelOfSophistication < 0.4 && result.challenge > 0.6) {
                    result.challenge = Math.max(0, result.challenge - interactionStrength * 0.1);
                }
                
                // High efficiency + high challenge = direct challenging
                if (result.efficiency > 0.7 && result.challenge > 0.7) {
                    result.efficiency = Math.min(1, result.efficiency + interactionStrength * 0.2);
                    result.challenge = Math.min(1, result.challenge + interactionStrength * 0.2);
                }
                break;
                
            case 'mixed':
                // High adaptability + high balance = fluid context-switching
                if (result.adaptability > 0.7 && result.balance > 0.7) {
                    result.adaptability = Math.min(1, result.adaptability + interactionStrength * 0.4);
                    result.balance = Math.min(1, result.balance + interactionStrength * 0.4);
                }
                
                // High directness + high confidence = assertive communication
                if (result.directness > 0.7 && result.confidence > 0.7) {
                    result.directness = Math.min(1, result.directness + interactionStrength * 0.3);
                    result.confidence = Math.min(1, result.confidence + interactionStrength * 0.3);
                }
                
                // Low adaptability + high balance = consistent integrated approach
                if (result.adaptability < 0.4 && result.balance > 0.6) {
                    result.balance = Math.min(1, result.balance + interactionStrength * 0.2);
                }
                break;
        }
        
        return result;
    }

    /**
     * Apply S-curve transformation
     */
    applySCurve(x, steepness = 1) {
        return 1 / (1 + Math.exp(-steepness * (x - 0.5) * 6));
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
        const targetRate = this.calculateContextualDisagreementRate({disagreement: 50}, context, 'mixed');
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