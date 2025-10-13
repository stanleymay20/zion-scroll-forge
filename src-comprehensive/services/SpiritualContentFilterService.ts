import { EventEmitter } from 'events';

export interface SpiritualContent {
    id: string;
    type: 'text' | 'audio' | 'video' | 'image' | 'interactive';
    content: string;
    source: 'user' | 'ai' | 'faculty' | 'external';
    metadata: {
        author?: string;
        timestamp: Date;
        context: string;
        audience: 'student' | 'faculty' | 'public';
    };
}

export interface AlignmentCheck {
    id: string;
    contentId: string;
    status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'under_review';
    score: number; // 0-100, higher is more aligned
    categories: AlignmentCategory[];
    flags: ContentFlag[];
    reviewedBy?: string;
    reviewDate?: Date;
    feedback?: string;
}

export interface AlignmentCategory {
    name: string;
    score: number;
    weight: number;
    criteria: string[];
    passed: boolean;
}

export interface ContentFlag {
    type: 'doctrinal' | 'ethical' | 'cultural' | 'language' | 'accuracy' | 'appropriateness';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion?: string;
    autoResolvable: boolean;
}

export interface SpiritualStandard {
    id: string;
    name: string;
    description: string;
    category: 'biblical' | 'theological' | 'ethical' | 'cultural' | 'prophetic';
    criteria: StandardCriteria[];
    weight: number;
    enabled: boolean;
}

export interface StandardCriteria {
    id: string;
    description: string;
    type: 'keyword' | 'sentiment' | 'context' | 'reference' | 'pattern';
    pattern?: string;
    keywords?: string[];
    required: boolean;
    weight: number;
}

export interface PropheticVerification {
    id: string;
    contentId: string;
    propheticClaim: string;
    verificationStatus: 'pending' | 'verified' | 'disputed' | 'false';
    verifiedBy: string[];
    scriptureReferences: string[];
    witnessCount: number;
    verificationDate?: Date;
    notes: string;
}

export class SpiritualContentFilterService extends EventEmitter {
    private alignmentChecks: Map<string, AlignmentCheck> = new Map();
    private spiritualStandards: Map<string, SpiritualStandard> = new Map();
    private propheticVerifications: Map<string, PropheticVerification> = new Map();
    private approvedContent: Set<string> = new Set();
    private blockedContent: Set<string> = new Set();

    constructor() {
        super();
        this.initializeSpiritualStandards();
        this.startContentMonitoring();
    }

    // Core Content Filtering
    async filterContent(content: SpiritualContent): Promise<AlignmentCheck> {
        const alignmentCheck: AlignmentCheck = {
            id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contentId: content.id,
            status: 'pending',
            score: 0,
            categories: [],
            flags: []
        };

        // Run through all spiritual standards
        for (const [standardId, standard] of this.spiritualStandards) {
            if (!standard.enabled) continue;

            const categoryResult = await this.evaluateStandard(content, standard);
            alignmentCheck.categories.push(categoryResult);

            // Add flags for failed criteria
            if (!categoryResult.passed) {
                alignmentCheck.flags.push({
                    type: this.mapCategoryToFlagType(standard.category),
                    severity: this.calculateFlagSeverity(categoryResult.score),
                    description: `Failed ${standard.name}: ${categoryResult.criteria.join(', ')}`,
                    suggestion: this.generateSuggestion(standard, categoryResult),
                    autoResolvable: categoryResult.score > 60
                });
            }
        }

        // Calculate overall alignment score
        alignmentCheck.score = this.calculateOverallScore(alignmentCheck.categories);

        // Determine status based on score and flags
        alignmentCheck.status = this.determineContentStatus(alignmentCheck);

        // Handle prophetic content verification
        if (this.containsPropheticClaim(content)) {
            await this.initiatePropheticVerification(content);
        }

        this.alignmentChecks.set(alignmentCheck.id, alignmentCheck);
        this.emit('contentFiltered', alignmentCheck);

        return alignmentCheck;
    }

    // Prophetic Content Verification
    async initiatePropheticVerification(content: SpiritualContent): Promise<PropheticVerification> {
        const verification: PropheticVerification = {
            id: `prophetic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            contentId: content.id,
            propheticClaim: this.extractPropheticClaim(content.content),
            verificationStatus: 'pending',
            verifiedBy: [],
            scriptureReferences: this.extractScriptureReferences(content.content),
            witnessCount: 0,
            notes: ''
        };

        this.propheticVerifications.set(verification.id, verification);
        this.emit('propheticVerificationInitiated', verification);

        return verification;
    }

    async submitPropheticWitness(
        verificationId: string,
        witnessId: string,
        testimony: string,
        scriptureSupport: string[]
    ): Promise<boolean> {
        const verification = this.propheticVerifications.get(verificationId);
        if (!verification) return false;

        if (!verification.verifiedBy.includes(witnessId)) {
            verification.verifiedBy.push(witnessId);
            verification.witnessCount++;
            verification.scriptureReferences.push(...scriptureSupport);
            verification.notes += `\nWitness ${witnessId}: ${testimony}`;

            // Require at least 2-3 witnesses for prophetic verification
            if (verification.witnessCount >= 2) {
                verification.verificationStatus = 'verified';
                verification.verificationDate = new Date();
                this.emit('propheticContentVerified', verification);
            }

            this.propheticVerifications.set(verificationId, verification);
            return true;
        }

        return false;
    }

    // Spiritual Alignment Management
    async createSpiritualStandard(standard: Omit<SpiritualStandard, 'id'>): Promise<SpiritualStandard> {
        const newStandard: SpiritualStandard = {
            ...standard,
            id: `standard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        this.spiritualStandards.set(newStandard.id, newStandard);
        this.emit('spiritualStandardCreated', newStandard);
        return newStandard;
    }

    async updateSpiritualStandard(
        standardId: string,
        updates: Partial<SpiritualStandard>
    ): Promise<SpiritualStandard | null> {
        const standard = this.spiritualStandards.get(standardId);
        if (!standard) return null;

        const updatedStandard = { ...standard, ...updates };
        this.spiritualStandards.set(standardId, updatedStandard);
        this.emit('spiritualStandardUpdated', updatedStandard);
        return updatedStandard;
    }

    // Content Review and Approval
    async reviewContent(
        checkId: string,
        reviewerId: string,
        decision: 'approve' | 'reject' | 'request_changes',
        feedback?: string
    ): Promise<AlignmentCheck | null> {
        const check = this.alignmentChecks.get(checkId);
        if (!check) return null;

        check.reviewedBy = reviewerId;
        check.reviewDate = new Date();
        check.feedback = feedback;

        switch (decision) {
            case 'approve':
                check.status = 'approved';
                this.approvedContent.add(check.contentId);
                break;
            case 'reject':
                check.status = 'rejected';
                this.blockedContent.add(check.contentId);
                break;
            case 'request_changes':
                check.status = 'flagged';
                break;
        }

        this.alignmentChecks.set(checkId, check);
        this.emit('contentReviewed', check);
        return check;
    }

    async bulkApproveContent(contentIds: string[], reviewerId: string): Promise<number> {
        let approvedCount = 0;

        for (const contentId of contentIds) {
            const checks = Array.from(this.alignmentChecks.values())
                .filter(check => check.contentId === contentId);

            for (const check of checks) {
                if (check.status === 'pending' || check.status === 'flagged') {
                    await this.reviewContent(check.id, reviewerId, 'approve');
                    approvedCount++;
                }
            }
        }

        return approvedCount;
    }

    // Content Monitoring and Analytics
    async getContentAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
        totalChecked: number;
        approved: number;
        rejected: number;
        flagged: number;
        averageScore: number;
        topFlags: { type: string; count: number }[];
        propheticVerifications: number;
    }> {
        const cutoffDate = new Date();
        switch (timeframe) {
            case 'day':
                cutoffDate.setDate(cutoffDate.getDate() - 1);
                break;
            case 'week':
                cutoffDate.setDate(cutoffDate.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setMonth(cutoffDate.getMonth() - 1);
                break;
        }

        const recentChecks = Array.from(this.alignmentChecks.values())
            .filter(check => check.reviewDate && check.reviewDate > cutoffDate);

        const totalChecked = recentChecks.length;
        const approved = recentChecks.filter(c => c.status === 'approved').length;
        const rejected = recentChecks.filter(c => c.status === 'rejected').length;
        const flagged = recentChecks.filter(c => c.status === 'flagged').length;

        const averageScore = totalChecked > 0
            ? recentChecks.reduce((sum, check) => sum + check.score, 0) / totalChecked
            : 0;

        // Count flag types
        const flagCounts = new Map<string, number>();
        recentChecks.forEach(check => {
            check.flags.forEach(flag => {
                flagCounts.set(flag.type, (flagCounts.get(flag.type) || 0) + 1);
            });
        });

        const topFlags = Array.from(flagCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const propheticVerifications = Array.from(this.propheticVerifications.values())
            .filter(v => v.verificationDate && v.verificationDate > cutoffDate).length;

        return {
            totalChecked,
            approved,
            rejected,
            flagged,
            averageScore,
            topFlags,
            propheticVerifications
        };
    }

    // Helper Methods
    private async evaluateStandard(content: SpiritualContent, standard: SpiritualStandard): Promise<AlignmentCategory> {
        const category: AlignmentCategory = {
            name: standard.name,
            score: 0,
            weight: standard.weight,
            criteria: [],
            passed: false
        };

        let totalScore = 0;
        let maxScore = 0;

        for (const criteria of standard.criteria) {
            maxScore += criteria.weight;
            const criteriaScore = await this.evaluateCriteria(content, criteria);
            totalScore += criteriaScore * criteria.weight;

            if (criteriaScore < 0.7 && criteria.required) {
                category.criteria.push(criteria.description);
            }
        }

        category.score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        category.passed = category.score >= 70 && category.criteria.length === 0;

        return category;
    }

    private async evaluateCriteria(content: SpiritualContent, criteria: StandardCriteria): Promise<number> {
        switch (criteria.type) {
            case 'keyword':
                return this.evaluateKeywords(content.content, criteria.keywords || []);
            case 'sentiment':
                return await this.evaluateSentiment(content.content);
            case 'context':
                return this.evaluateContext(content);
            case 'reference':
                return this.evaluateScriptureReferences(content.content);
            case 'pattern':
                return this.evaluatePattern(content.content, criteria.pattern || '');
            default:
                return 0.5;
        }
    }

    private evaluateKeywords(content: string, keywords: string[]): number {
        if (keywords.length === 0) return 1;

        const contentLower = content.toLowerCase();
        const foundKeywords = keywords.filter(keyword =>
            contentLower.includes(keyword.toLowerCase())
        );

        return foundKeywords.length / keywords.length;
    }

    private async evaluateSentiment(content: string): Promise<number> {
        // Simplified sentiment analysis - in production, use proper NLP
        const positiveWords = ['love', 'peace', 'joy', 'hope', 'faith', 'grace', 'blessing'];
        const negativeWords = ['hate', 'fear', 'anger', 'despair', 'curse', 'evil'];

        const contentLower = content.toLowerCase();
        const positiveCount = positiveWords.filter(word => contentLower.includes(word)).length;
        const negativeCount = negativeWords.filter(word => contentLower.includes(word)).length;

        if (positiveCount + negativeCount === 0) return 0.7; // Neutral
        return positiveCount / (positiveCount + negativeCount);
    }

    private evaluateContext(content: SpiritualContent): number {
        // Evaluate if content is appropriate for its context and audience
        const contextScore = content.metadata.context === 'educational' ? 0.8 : 0.6;
        const audienceScore = content.metadata.audience === 'student' ? 0.9 : 0.7;
        return (contextScore + audienceScore) / 2;
    }

    private evaluateScriptureReferences(content: string): number {
        // Check for proper scripture references
        const scripturePattern = /\b\d?\s*[A-Z][a-z]+\s+\d+:\d+(-\d+)?\b/g;
        const references = content.match(scripturePattern) || [];

        // Higher score for content with scripture backing
        return Math.min(references.length * 0.2 + 0.5, 1);
    }

    private evaluatePattern(content: string, pattern: string): number {
        try {
            const regex = new RegExp(pattern, 'gi');
            const matches = content.match(regex) || [];
            return matches.length > 0 ? 1 : 0;
        } catch {
            return 0.5;
        }
    }

    private calculateOverallScore(categories: AlignmentCategory[]): number {
        if (categories.length === 0) return 0;

        const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
        const weightedScore = categories.reduce((sum, cat) => sum + (cat.score * cat.weight), 0);

        return totalWeight > 0 ? weightedScore / totalWeight : 0;
    }

    private determineContentStatus(check: AlignmentCheck): AlignmentCheck['status'] {
        const criticalFlags = check.flags.filter(f => f.severity === 'critical');
        const highFlags = check.flags.filter(f => f.severity === 'high');

        if (criticalFlags.length > 0) return 'rejected';
        if (highFlags.length > 2) return 'flagged';
        if (check.score < 50) return 'rejected';
        if (check.score < 70) return 'flagged';
        if (check.score >= 85) return 'approved';

        return 'under_review';
    }

    private containsPropheticClaim(content: SpiritualContent): boolean {
        const propheticKeywords = [
            'thus says the lord', 'god told me', 'vision', 'dream from god',
            'prophecy', 'prophetic word', 'revelation', 'god showed me'
        ];

        const contentLower = content.content.toLowerCase();
        return propheticKeywords.some(keyword => contentLower.includes(keyword));
    }

    private extractPropheticClaim(content: string): string {
        // Extract the main prophetic claim from content
        const sentences = content.split(/[.!?]+/);
        const propheticSentence = sentences.find(sentence =>
            this.containsPropheticClaim({ content: sentence } as SpiritualContent)
        );
        return propheticSentence?.trim() || content.substring(0, 200);
    }

    private extractScriptureReferences(content: string): string[] {
        const scripturePattern = /\b\d?\s*[A-Z][a-z]+\s+\d+:\d+(-\d+)?\b/g;
        return content.match(scripturePattern) || [];
    }

    private mapCategoryToFlagType(category: SpiritualStandard['category']): ContentFlag['type'] {
        const mapping: Record<SpiritualStandard['category'], ContentFlag['type']> = {
            'biblical': 'doctrinal',
            'theological': 'doctrinal',
            'ethical': 'ethical',
            'cultural': 'cultural',
            'prophetic': 'accuracy'
        };
        return mapping[category] || 'appropriateness';
    }

    private calculateFlagSeverity(score: number): ContentFlag['severity'] {
        if (score < 30) return 'critical';
        if (score < 50) return 'high';
        if (score < 70) return 'medium';
        return 'low';
    }

    private generateSuggestion(standard: SpiritualStandard, result: AlignmentCategory): string {
        return `To improve ${standard.name} alignment, consider: ${result.criteria.join(', ')}`;
    }

    private initializeSpiritualStandards(): void {
        // Biblical Alignment Standard
        this.spiritualStandards.set('biblical_alignment', {
            id: 'biblical_alignment',
            name: 'Biblical Alignment',
            description: 'Content must align with biblical principles and teachings',
            category: 'biblical',
            criteria: [
                {
                    id: 'scripture_support',
                    description: 'Contains or references relevant scripture',
                    type: 'reference',
                    required: false,
                    weight: 0.3
                },
                {
                    id: 'biblical_keywords',
                    description: 'Uses biblical language and concepts',
                    type: 'keyword',
                    keywords: ['god', 'jesus', 'christ', 'holy spirit', 'scripture', 'bible', 'faith', 'love'],
                    required: true,
                    weight: 0.4
                },
                {
                    id: 'positive_sentiment',
                    description: 'Maintains positive, edifying tone',
                    type: 'sentiment',
                    required: true,
                    weight: 0.3
                }
            ],
            weight: 1.0,
            enabled: true
        });

        // Prophetic Accuracy Standard
        this.spiritualStandards.set('prophetic_accuracy', {
            id: 'prophetic_accuracy',
            name: 'Prophetic Accuracy',
            description: 'Prophetic content must be verified and aligned with scripture',
            category: 'prophetic',
            criteria: [
                {
                    id: 'witness_verification',
                    description: 'Prophetic claims verified by multiple witnesses',
                    type: 'context',
                    required: true,
                    weight: 0.5
                },
                {
                    id: 'scripture_alignment',
                    description: 'Aligns with established scripture',
                    type: 'reference',
                    required: true,
                    weight: 0.5
                }
            ],
            weight: 1.2,
            enabled: true
        });

        // Cultural Sensitivity Standard
        this.spiritualStandards.set('cultural_sensitivity', {
            id: 'cultural_sensitivity',
            name: 'Cultural Sensitivity',
            description: 'Content respects diverse cultural contexts while maintaining truth',
            category: 'cultural',
            criteria: [
                {
                    id: 'inclusive_language',
                    description: 'Uses inclusive, respectful language',
                    type: 'pattern',
                    pattern: '^(?!.*(exclusive|discriminatory|offensive))',
                    required: true,
                    weight: 0.6
                },
                {
                    id: 'cultural_awareness',
                    description: 'Shows awareness of cultural differences',
                    type: 'context',
                    required: false,
                    weight: 0.4
                }
            ],
            weight: 0.8,
            enabled: true
        });
    }

    private startContentMonitoring(): void {
        // Monitor content alignment trends
        setInterval(() => {
            this.analyzeContentTrends();
        }, 3600000); // Every hour

        // Clean up old alignment checks
        setInterval(() => {
            this.cleanupOldChecks();
        }, 86400000); // Daily
    }

    private async analyzeContentTrends(): Promise<void> {
        const analytics = await this.getContentAnalytics('day');

        if (analytics.averageScore < 60) {
            this.emit('contentQualityAlert', {
                type: 'low_alignment_score',
                averageScore: analytics.averageScore,
                timeframe: 'day'
            });
        }

        if (analytics.rejected > analytics.approved) {
            this.emit('contentQualityAlert', {
                type: 'high_rejection_rate',
                rejectionRate: (analytics.rejected / analytics.totalChecked) * 100,
                timeframe: 'day'
            });
        }
    }

    private cleanupOldChecks(): void {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 3); // Keep 3 months

        for (const [id, check] of this.alignmentChecks) {
            if (check.reviewDate && check.reviewDate < cutoffDate) {
                this.alignmentChecks.delete(id);
            }
        }
    }

    // Public API Methods
    async getAlignmentCheck(checkId: string): Promise<AlignmentCheck | null> {
        return this.alignmentChecks.get(checkId) || null;
    }

    async getContentStatus(contentId: string): Promise<'approved' | 'rejected' | 'pending' | 'unknown'> {
        if (this.approvedContent.has(contentId)) return 'approved';
        if (this.blockedContent.has(contentId)) return 'rejected';

        const checks = Array.from(this.alignmentChecks.values())
            .filter(check => check.contentId === contentId);

        if (checks.length === 0) return 'unknown';

        const latestCheck = checks.sort((a, b) =>
            (b.reviewDate?.getTime() || 0) - (a.reviewDate?.getTime() || 0)
        )[0];

        return latestCheck.status === 'approved' ? 'approved' :
            latestCheck.status === 'rejected' ? 'rejected' : 'pending';
    }

    async getSpiritualStandards(): Promise<SpiritualStandard[]> {
        return Array.from(this.spiritualStandards.values());
    }

    async getPropheticVerifications(status?: PropheticVerification['verificationStatus']): Promise<PropheticVerification[]> {
        const verifications = Array.from(this.propheticVerifications.values());
        return status ? verifications.filter(v => v.verificationStatus === status) : verifications;
    }
}