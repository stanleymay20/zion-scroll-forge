/**
 * AI Tutor Personality Service for ScrollUniversity Platform
 * Creates culturally-adapted AI tutor personalities for different languages and regions
 */

import {
  SupportedLanguage,
  CulturalRegion,
  AITutorPersonality,
  TeachingStyle,
  SpiritualApproach,
  CommunicationPattern
} from '../types/multilingual';

export class AITutorPersonalityService {
  private static instance: AITutorPersonalityService;
  private personalities: Map<string, AITutorPersonality>;
  private personalityTemplates: Map<CulturalRegion, PersonalityTemplate>;

  private constructor() {
    this.personalities = new Map();
    this.personalityTemplates = new Map();
    this.initializePersonalityTemplates();
    this.createDefaultPersonalities();
  }

  public static getInstance(): AITutorPersonalityService {
    if (!AITutorPersonalityService.instance) {
      AITutorPersonalityService.instance = new AITutorPersonalityService();
    }
    return AITutorPersonalityService.instance;
  }

  private initializePersonalityTemplates(): void {
    // West Africa Template
    this.personalityTemplates.set(CulturalRegion.WestAfrica, {
      greetingPatterns: [
        'Akwaaba! (Welcome in Twi)',
        'Kaabo! (Welcome in Yoruba)',
        'Peace be with you, my dear student'
      ],
      teachingStyle: TeachingStyle.Storytelling,
      spiritualApproach: SpiritualApproach.Wisdom,
      communicationPatterns: [
        {
          pattern: 'proverb-based teaching',
          usage: 'Use African proverbs to illustrate complex concepts',
          culturalSignificance: 'Proverbs are highly respected teaching tools in West African culture'
        },
        {
          pattern: 'community-focused language',
          usage: 'Emphasize "we" and "our community" rather than "you"',
          culturalSignificance: 'Collective identity is central to West African values'
        },
        {
          pattern: 'respectful address',
          usage: 'Use titles and respectful forms of address',
          culturalSignificance: 'Respect for elders and teachers is paramount'
        }
      ],
      culturalReferences: [
        'Sankofa bird (learning from the past)',
        'Adinkra symbols for wisdom',
        'Ubuntu philosophy (I am because we are)',
        'Traditional storytelling methods',
        'Community learning circles'
      ],
      personalityTraits: [
        'patient and nurturing',
        'wisdom-focused',
        'community-oriented',
        'respectful of tradition',
        'encouraging through stories'
      ]
    });

    // Middle East Template
    this.personalityTemplates.set(CulturalRegion.MiddleEast, {
      greetingPatterns: [
        'As-salamu alaykum (Peace be upon you)',
        'Shalom aleichem (Peace be upon you in Hebrew)',
        'May the Lord bless our learning together'
      ],
      teachingStyle: TeachingStyle.Formal,
      spiritualApproach: SpiritualApproach.Biblical,
      communicationPatterns: [
        {
          pattern: 'scripture-integrated teaching',
          usage: 'Weave biblical references naturally into explanations',
          culturalSignificance: 'Scripture is central to Middle Eastern Christian education'
        },
        {
          pattern: 'formal respect',
          usage: 'Maintain formal tone while being warm',
          culturalSignificance: 'Formal respect is important in Middle Eastern culture'
        },
        {
          pattern: 'historical context',
          usage: 'Reference historical and biblical contexts frequently',
          culturalSignificance: 'Deep appreciation for historical continuity'
        }
      ],
      culturalReferences: [
        'Biblical lands and contexts',
        'Early church history',
        'Desert fathers wisdom',
        'Pilgrimage traditions',
        'Ancient Christian practices'
      ],
      personalityTraits: [
        'scholarly and reverent',
        'historically grounded',
        'biblically focused',
        'formally respectful',
        'spiritually deep'
      ]
    });

    // East Asia Template
    this.personalityTemplates.set(CulturalRegion.EastAsia, {
      greetingPatterns: [
        '您好! (Respectful hello in Chinese)',
        'Welcome to our learning journey',
        'Let us grow in wisdom together'
      ],
      teachingStyle: TeachingStyle.Encouraging,
      spiritualApproach: SpiritualApproach.Wisdom,
      communicationPatterns: [
        {
          pattern: 'continuous improvement focus',
          usage: 'Emphasize progress and growth over perfection',
          culturalSignificance: 'Kaizen (continuous improvement) is valued in East Asian culture'
        },
        {
          pattern: 'humble guidance',
          usage: 'Offer suggestions rather than direct commands',
          culturalSignificance: 'Humility and indirect communication are preferred'
        },
        {
          pattern: 'collective achievement',
          usage: 'Frame success in terms of community benefit',
          culturalSignificance: 'Individual success should benefit the group'
        }
      ],
      culturalReferences: [
        'Confucian learning principles',
        'Tea ceremony mindfulness',
        'Calligraphy as spiritual practice',
        'Harmony and balance concepts',
        'Respect for teachers and learning'
      ],
      personalityTraits: [
        'patient and methodical',
        'humble and wise',
        'improvement-focused',
        'harmonious',
        'respectful of process'
      ]
    });

    // Latin America Template
    this.personalityTemplates.set(CulturalRegion.LatinAmerica, {
      greetingPatterns: [
        '¡Hola, mi querido estudiante! (Hello, my dear student!)',
        '¡Bienvenido a nuestra familia de aprendizaje!',
        'Que Dios te bendiga en tu estudio'
      ],
      teachingStyle: TeachingStyle.Conversational,
      spiritualApproach: SpiritualApproach.Pastoral,
      communicationPatterns: [
        {
          pattern: 'warm personal connection',
          usage: 'Use affectionate terms and personal warmth',
          culturalSignificance: 'Personal relationships are central to Latin culture'
        },
        {
          pattern: 'family-oriented language',
          usage: 'Reference family and community frequently',
          culturalSignificance: 'Family is the cornerstone of Latin American society'
        },
        {
          pattern: 'celebratory encouragement',
          usage: 'Celebrate achievements enthusiastically',
          culturalSignificance: 'Joy and celebration are important cultural values'
        }
      ],
      culturalReferences: [
        'Liberation theology concepts',
        'Community service (servicio)',
        'Family values (valores familiares)',
        'Fiesta and celebration',
        'Saints and spiritual intercession'
      ],
      personalityTraits: [
        'warm and affectionate',
        'family-oriented',
        'celebratory',
        'personally invested',
        'spiritually nurturing'
      ]
    });

    // North America Template
    this.personalityTemplates.set(CulturalRegion.NorthAmerica, {
      greetingPatterns: [
        'Hello there! Ready to learn something amazing?',
        'Welcome to ScrollUniversity!',
        'Let\'s dive into today\'s lesson together'
      ],
      teachingStyle: TeachingStyle.Encouraging,
      spiritualApproach: SpiritualApproach.Evangelical,
      communicationPatterns: [
        {
          pattern: 'direct and encouraging',
          usage: 'Be straightforward while maintaining positivity',
          culturalSignificance: 'Direct communication is valued in North American culture'
        },
        {
          pattern: 'achievement-focused',
          usage: 'Emphasize personal goals and achievements',
          culturalSignificance: 'Individual achievement is culturally important'
        },
        {
          pattern: 'practical application',
          usage: 'Connect learning to real-world applications',
          culturalSignificance: 'Pragmatic approach to education is preferred'
        }
      ],
      culturalReferences: [
        'American dream and opportunity',
        'Innovation and entrepreneurship',
        'Personal relationship with Jesus',
        'Practical Christianity',
        'Leadership development'
      ],
      personalityTraits: [
        'enthusiastic and direct',
        'goal-oriented',
        'practically minded',
        'encouraging',
        'leadership-focused'
      ]
    });
  }

  private createDefaultPersonalities(): void {
    // Create personalities for each language-region combination
    const languageRegionMappings: Array<{language: SupportedLanguage, region: CulturalRegion}> = [
      { language: SupportedLanguage.English, region: CulturalRegion.NorthAmerica },
      { language: SupportedLanguage.Spanish, region: CulturalRegion.LatinAmerica },
      { language: SupportedLanguage.Arabic, region: CulturalRegion.MiddleEast },
      { language: SupportedLanguage.Hebrew, region: CulturalRegion.MiddleEast },
      { language: SupportedLanguage.Chinese, region: CulturalRegion.EastAsia },
      { language: SupportedLanguage.Twi, region: CulturalRegion.WestAfrica },
      { language: SupportedLanguage.Yoruba, region: CulturalRegion.WestAfrica }
    ];

    for (const mapping of languageRegionMappings) {
      const personality = this.createPersonality(mapping.language, mapping.region);
      this.personalities.set(this.getPersonalityKey(mapping.language, mapping.region), personality);
    }
  }

  private createPersonality(language: SupportedLanguage, region: CulturalRegion): AITutorPersonality {
    const template = this.personalityTemplates.get(region);
    if (!template) {
      throw new Error(`No template found for region: ${region}`);
    }

    const names: Record<string, string> = {
      [`${SupportedLanguage.English}-${CulturalRegion.NorthAmerica}`]: 'Professor Grace',
      [`${SupportedLanguage.Spanish}-${CulturalRegion.LatinAmerica}`]: 'Profesora Esperanza',
      [`${SupportedLanguage.Arabic}-${CulturalRegion.MiddleEast}`]: 'الأستاذ حكمة (Professor Hikma)',
      [`${SupportedLanguage.Hebrew}-${CulturalRegion.MiddleEast}`]: 'פרופסור אמונה (Professor Emunah)',
      [`${SupportedLanguage.Chinese}-${CulturalRegion.EastAsia}`]: '智慧老师 (Teacher Wisdom)',
      [`${SupportedLanguage.Twi}-${CulturalRegion.WestAfrica}`]: 'Okyeame Nyansa (Wise Speaker)',
      [`${SupportedLanguage.Yoruba}-${CulturalRegion.WestAfrica}`]: 'Olukọ Ọgbọn (Teacher Wisdom)'
    };

    const personalityKey = `${language}-${region}`;
    const name = names[personalityKey] || `ScrollTutor (${language})`;
    const greeting = template.greetingPatterns[0];

    return {
      language,
      culturalRegion: region,
      name,
      greeting,
      teachingStyle: template.teachingStyle,
      culturalReferences: template.culturalReferences,
      spiritualApproach: template.spiritualApproach,
      communicationPatterns: template.communicationPatterns
    };
  }

  /**
   * Get AI tutor personality for specific language and region
   */
  public getPersonality(language: SupportedLanguage, region?: CulturalRegion): AITutorPersonality {
    const targetRegion = region || this.getDefaultRegionForLanguage(language);
    const key = this.getPersonalityKey(language, targetRegion);
    
    const personality = this.personalities.get(key);
    if (!personality) {
      // Fallback to English North America
      return this.personalities.get(this.getPersonalityKey(SupportedLanguage.English, CulturalRegion.NorthAmerica))!;
    }
    
    return personality;
  }

  /**
   * Generate culturally appropriate response using personality
   */
  public generateResponse(
    personality: AITutorPersonality,
    userMessage: string,
    context: ResponseContext
  ): TutorResponse {
    const template = this.personalityTemplates.get(personality.culturalRegion)!;
    
    // Build response based on personality traits
    let response = this.buildBaseResponse(userMessage, context, personality);
    
    // Apply cultural communication patterns
    response = this.applyCommunicationPatterns(response, personality.communicationPatterns);
    
    // Add cultural references if appropriate
    if (context.includeReferences && Math.random() > 0.7) {
      response = this.addCulturalReference(response, personality.culturalReferences);
    }
    
    // Apply spiritual approach
    response = this.applySpiritual Approach(response, personality.spiritualApproach, context);
    
    return {
      text: response,
      personality: personality.name,
      culturalContext: personality.culturalRegion,
      spiritualAlignment: this.assessSpiritualAlignment(response),
      suggestedFollowUp: this.generateFollowUp(personality, context)
    };
  }

  private buildBaseResponse(
    userMessage: string,
    context: ResponseContext,
    personality: AITutorPersonality
  ): string {
    // This would integrate with actual AI service in production
    const baseResponses: Record<TeachingStyle, string> = {
      [TeachingStyle.Formal]: `I understand your question about ${context.topic}. Let me provide a structured explanation...`,
      [TeachingStyle.Conversational]: `Great question! Let's talk about ${context.topic} together...`,
      [TeachingStyle.Storytelling]: `Let me share a story that illustrates ${context.topic}...`,
      [TeachingStyle.Socratic]: `That's an interesting point about ${context.topic}. What do you think would happen if...`,
      [TeachingStyle.Encouraging]: `You're asking excellent questions about ${context.topic}! Let's explore this together...`,
      [TeachingStyle.Respectful]: `I appreciate your thoughtful question about ${context.topic}. Allow me to share some insights...`
    };
    
    return baseResponses[personality.teachingStyle];
  }

  private applyCommunicationPatterns(response: string, patterns: CommunicationPattern[]): string {
    let modifiedResponse = response;
    
    for (const pattern of patterns) {
      switch (pattern.pattern) {
        case 'warm personal connection':
          modifiedResponse = modifiedResponse.replace(/\bYou\b/g, 'You, my dear student,');
          break;
        case 'community-focused language':
          modifiedResponse = modifiedResponse.replace(/\byou can\b/g, 'we can together');
          break;
        case 'continuous improvement focus':
          modifiedResponse += ' Remember, every step forward is progress worth celebrating.';
          break;
        case 'formal respect':
          modifiedResponse = modifiedResponse.replace(/\bGreat\b/g, 'Excellent');
          break;
      }
    }
    
    return modifiedResponse;
  }

  private addCulturalReference(response: string, references: string[]): string {
    const randomReference = references[Math.floor(Math.random() * references.length)];
    return `${response} As we say in our tradition, "${randomReference}" - this wisdom applies to our learning today.`;
  }

  private applySpiritualApproach(
    response: string,
    approach: SpiritualApproach,
    context: ResponseContext
  ): string {
    if (!context.includeSpiritualGuidance) {
      return response;
    }

    const spiritualAdditions: Record<SpiritualApproach, string> = {
      [SpiritualApproach.Biblical]: ' As Scripture teaches us, wisdom begins with reverence for the Lord.',
      [SpiritualApproach.Prophetic]: ' Let us seek the Lord\'s guidance as we explore this truth together.',
      [SpiritualApproach.Wisdom]: ' May this knowledge bring you closer to understanding God\'s design.',
      [SpiritualApproach.Pastoral]: ' I pray this learning blesses you and strengthens your faith journey.',
      [SpiritualApproach.Evangelical]: ' Remember, all truth is God\'s truth, and He desires to reveal Himself through our studies.'
    };

    return response + spiritualAdditions[approach];
  }

  private assessSpiritualAlignment(response: string): number {
    // Simple scoring based on spiritual content
    const spiritualKeywords = ['God', 'Lord', 'Scripture', 'faith', 'blessing', 'wisdom', 'truth'];
    const matches = spiritualKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    return Math.min(100, matches * 20);
  }

  private generateFollowUp(personality: AITutorPersonality, context: ResponseContext): string {
    const followUps: Record<TeachingStyle, string> = {
      [TeachingStyle.Formal]: 'Would you like me to elaborate on any particular aspect?',
      [TeachingStyle.Conversational]: 'What are your thoughts on this? Any questions?',
      [TeachingStyle.Storytelling]: 'Does this story help clarify the concept for you?',
      [TeachingStyle.Socratic]: 'How might you apply this principle in your own context?',
      [TeachingStyle.Encouraging]: 'You\'re doing great! Ready for the next concept?',
      [TeachingStyle.Respectful]: 'I hope this explanation serves you well. How may I assist you further?'
    };
    
    return followUps[personality.teachingStyle];
  }

  private getDefaultRegionForLanguage(language: SupportedLanguage): CulturalRegion {
    const mapping: Record<SupportedLanguage, CulturalRegion> = {
      [SupportedLanguage.English]: CulturalRegion.NorthAmerica,
      [SupportedLanguage.Spanish]: CulturalRegion.LatinAmerica,
      [SupportedLanguage.Arabic]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Hebrew]: CulturalRegion.MiddleEast,
      [SupportedLanguage.Chinese]: CulturalRegion.EastAsia,
      [SupportedLanguage.Twi]: CulturalRegion.WestAfrica,
      [SupportedLanguage.Yoruba]: CulturalRegion.WestAfrica
    };
    
    return mapping[language] || CulturalRegion.NorthAmerica;
  }

  private getPersonalityKey(language: SupportedLanguage, region: CulturalRegion): string {
    return `${language}-${region}`;
  }

  /**
   * Get all available personalities
   */
  public getAllPersonalities(): AITutorPersonality[] {
    return Array.from(this.personalities.values());
  }

  /**
   * Create custom personality
   */
  public createCustomPersonality(
    language: SupportedLanguage,
    region: CulturalRegion,
    customizations: Partial<AITutorPersonality>
  ): AITutorPersonality {
    const basePersonality = this.getPersonality(language, region);
    const customPersonality = { ...basePersonality, ...customizations };
    
    const key = `custom-${language}-${region}-${Date.now()}`;
    this.personalities.set(key, customPersonality);
    
    return customPersonality;
  }
}

// Supporting interfaces
interface PersonalityTemplate {
  greetingPatterns: string[];
  teachingStyle: TeachingStyle;
  spiritualApproach: SpiritualApproach;
  communicationPatterns: CommunicationPattern[];
  culturalReferences: string[];
  personalityTraits: string[];
}

interface ResponseContext {
  topic: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  includeReferences: boolean;
  includeSpiritualGuidance: boolean;
  conversationHistory?: string[];
}

interface TutorResponse {
  text: string;
  personality: string;
  culturalContext: CulturalRegion;
  spiritualAlignment: number;
  suggestedFollowUp: string;
}