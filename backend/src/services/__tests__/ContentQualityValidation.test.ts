/**
 * Content Quality Validation Tests
 * Comprehensive tests for content quality, accuracy, and validation
 */

import { FactualAccuracyChecker } from '../FactualAccuracyChecker';
import { ContentConsistencyChecker } from '../ContentConsistencyChecker';
import { SourceAttributionManager } from '../SourceAttributionManager';
import { ScrollPedagogyValidator } from '../ScrollPedagogyValidator';
import { TheologicalAlignmentService } from '../TheologicalAlignmentService';
import { PlagiarismDetectionService } from '../PlagiarismDetectionService';

describe('Content Quality Validation Tests', () => {
  let factualChecker: FactualAccuracyChecker;
  let consistencyChecker: ContentConsistencyChecker;
  let attributionManager: SourceAttributionManager;
  let pedagogyValidator: ScrollPedagogyValidator;
  let theologicalService: TheologicalAlignmentService;
  let plagiarismService: PlagiarismDetectionService;

  beforeEach(() => {
    factualChecker = new FactualAccuracyChecker();
    consistencyChecker = new ContentConsistencyChecker();
    attributionManager = new SourceAttributionManager();
    pedagogyValidator = new ScrollPedagogyValidator();
    theologicalService = new TheologicalAlignmentService();
    plagiarismService = new PlagiarismDetectionService();
  });

  describe('Factual Accuracy Checking', () => {
    it('should verify factual claims in content', async () => {
      const content = `
The Bible contains 66 books in the Protestant canon. The Old Testament has 39 books, 
and the New Testament has 27 books. The book of Psalms is the longest book in the Bible 
with 150 chapters.
`;

      const result = await factualChecker.checkAccuracy({
        content,
        contentType: 'lecture',
        requiresVerification: true
      });

      expect(result.accuracyScore).toBeGreaterThan(0.9);
      expect(result.verifiedClaims.length).toBeGreaterThan(0);
      expect(result.unverifiedClaims.length).toBe(0);
    }, 30000);

    it('should flag potentially inaccurate claims', async () => {
      const content = `
The Bible was written in only two languages: Hebrew and Greek. 
All biblical manuscripts are identical with no variations.
`;

      const result = await factualChecker.checkAccuracy({
        content,
        contentType: 'lecture',
        requiresVerification: true
      });

      expect(result.accuracyScore).toBeLessThan(0.7);
      expect(result.flaggedClaims.length).toBeGreaterThan(0);
    }, 30000);

    it('should provide source verification for claims', async () => {
      const content = `
According to the Westminster Confession of Faith, Scripture is the supreme authority 
for faith and practice. The Nicene Creed affirms the deity of Christ and the Trinity.
`;

      const result = await factualChecker.checkAccuracy({
        content,
        contentType: 'lecture',
        requiresVerification: true,
        provideSources: true
      });

      expect(result.verifiedClaims.length).toBeGreaterThan(0);
      expect(result.sources).toBeDefined();
      expect(result.sources.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Content Consistency Checking', () => {
    it('should detect contradictions across content', async () => {
      const content1 = `
Servant leadership emphasizes putting others first and leading through service.
`;
      const content2 = `
Effective leadership requires asserting authority and maintaining hierarchical control.
`;

      const result = await consistencyChecker.checkConsistency({
        contents: [
          { id: 'content1', text: content1, type: 'lecture' },
          { id: 'content2', text: content2, type: 'lecture' }
        ],
        checkForContradictions: true
      });

      expect(result.hasContradictions).toBe(true);
      expect(result.contradictions.length).toBeGreaterThan(0);
    }, 30000);

    it('should verify consistent terminology usage', async () => {
      const content1 = `
The kingdom of God represents God's sovereign rule and reign.
`;
      const content2 = `
God's kingdom is His divine authority and governance over all creation.
`;

      const result = await consistencyChecker.checkConsistency({
        contents: [
          { id: 'content1', text: content1, type: 'lecture' },
          { id: 'content2', text: content2, type: 'lecture' }
        ],
        checkTerminology: true
      });

      expect(result.terminologyConsistent).toBe(true);
      expect(result.consistencyScore).toBeGreaterThan(0.8);
    }, 30000);

    it('should identify concept drift across modules', async () => {
      const modules = [
        {
          id: 'module1',
          text: 'Biblical stewardship means managing God\'s resources faithfully.',
          type: 'lecture' as const
        },
        {
          id: 'module2',
          text: 'Stewardship involves careful management of personal assets.',
          type: 'lecture' as const
        },
        {
          id: 'module3',
          text: 'Financial management focuses on maximizing personal wealth.',
          type: 'lecture' as const
        }
      ];

      const result = await consistencyChecker.checkConsistency({
        contents: modules,
        checkConceptDrift: true
      });

      expect(result.conceptDrift).toBeDefined();
      expect(result.conceptDrift?.detected).toBe(true);
    }, 30000);
  });

  describe('Source Attribution Management', () => {
    it('should track and manage source citations', async () => {
      const content = `
According to John Calvin's Institutes, God's sovereignty extends over all creation.
As stated in the Westminster Confession, Scripture is the supreme authority.
`;

      const result = await attributionManager.manageSources({
        content,
        contentType: 'lecture',
        requiresCitations: true
      });

      expect(result.sources.length).toBeGreaterThan(0);
      expect(result.properlyAttributed).toBe(true);
      expect(result.missingCitations.length).toBe(0);
    }, 30000);

    it('should flag missing citations', async () => {
      const content = `
Research shows that servant leadership improves organizational outcomes.
Studies indicate that biblical principles enhance business performance.
`;

      const result = await attributionManager.manageSources({
        content,
        contentType: 'lecture',
        requiresCitations: true
      });

      expect(result.missingCitations.length).toBeGreaterThan(0);
      expect(result.properlyAttributed).toBe(false);
    }, 30000);

    it('should verify citation accuracy', async () => {
      const content = `
Calvin's Institutes (Book 1, Chapter 1) discusses the knowledge of God.
The Westminster Confession (Chapter 1) addresses Holy Scripture.
`;

      const result = await attributionManager.manageSources({
        content,
        contentType: 'lecture',
        requiresCitations: true,
        verifyCitations: true
      });

      expect(result.verifiedCitations.length).toBeGreaterThan(0);
      expect(result.citationAccuracy).toBeGreaterThan(0.8);
    }, 30000);
  });

  describe('Pedagogy Validation', () => {
    it('should validate 6-step pedagogical flow', async () => {
      const content = `
# Lesson: Kingdom Economics

## 1. Ignition (Hook)
Imagine discovering that everything you own actually belongs to someone else...

## 2. Download (Concept Teaching)
Biblical stewardship recognizes God's ownership of all resources...

## 3. Demonstration (Worked Example)
Consider Joseph's management of Egypt's resources during famine...

## 4. Activation (Student Practice)
Exercise: Analyze your current financial decisions through a stewardship lens...

## 5. Reflection (Identity & Integration)
How does viewing yourself as a steward rather than owner change your perspective?

## 6. Commission (Next Step)
This week, identify one area where you can practice better stewardship...
`;

      const result = await pedagogyValidator.validateContent({
        content,
        contentType: 'lecture',
        targetAudience: 'Graduate students',
        learningObjectives: []
      });

      expect(result.isValid).toBe(true);
      expect(result.pedagogyScore).toBeGreaterThan(0.9);
      expect(result.hasAllSteps).toBe(true);
      expect(result.flowScore).toBeGreaterThan(0.8);
    }, 30000);

    it('should flag missing pedagogical steps', async () => {
      const content = `
# Lesson: Leadership Principles

Leadership involves guiding others toward goals. Good leaders communicate effectively.

## Practice Exercise
Think about a time you led a team...
`;

      const result = await pedagogyValidator.validateContent({
        content,
        contentType: 'lecture',
        targetAudience: 'Undergraduate students',
        learningObjectives: []
      });

      expect(result.isValid).toBe(false);
      expect(result.missingSteps.length).toBeGreaterThan(0);
      expect(result.pedagogyScore).toBeLessThan(0.7);
    }, 30000);

    it('should validate learning progression', async () => {
      const content = `
# Module 1: Introduction to Concepts
Basic understanding of principles...

# Module 2: Application of Concepts
Applying principles to scenarios...

# Module 3: Advanced Analysis
Evaluating and creating new solutions...
`;

      const result = await pedagogyValidator.validateContent({
        content,
        contentType: 'course',
        targetAudience: 'Graduate students',
        learningObjectives: [],
        checkProgression: true
      });

      expect(result.progressionValid).toBe(true);
      expect(result.progressionScore).toBeGreaterThan(0.8);
    }, 30000);
  });

  describe('Theological Alignment Validation', () => {
    it('should verify scroll tone and kingdom focus', async () => {
      const content = `
# Kingdom Leadership in Business

As believers called to transform systems, we must understand that true leadership 
flows from our identity in Christ. The Lord calls us to be salt and light in the 
marketplace, demonstrating kingdom principles through our professional lives.

## Biblical Foundation
Scripture reveals that leadership is fundamentally about stewardship and service. 
Jesus modeled this perfectly, showing us that greatness in God's kingdom comes 
through serving others.

## Kingdom Application
In your calling as a business leader, you are positioned to influence systems and 
cultures. This is not merely about personal success, but about advancing God's 
kingdom through your sphere of influence.
`;

      const result = await theologicalService.checkAlignment({
        content,
        contentType: 'lecture',
        requiresBiblicalIntegration: true
      });

      expect(result.hasScrollTone).toBe(true);
      expect(result.alignmentScore).toBeGreaterThan(0.9);
      expect(result.kingdomFocus).toBe(true);
      expect(result.biblicalReferences.length).toBeGreaterThan(0);
    }, 30000);

    it('should flag content lacking scroll alignment', async () => {
      const content = `
# Business Leadership Strategies

Effective leadership requires strategic thinking and operational excellence. 
Leaders must focus on maximizing shareholder value and achieving competitive advantage.

## Key Principles
1. Set clear objectives
2. Measure performance metrics
3. Optimize resource allocation
4. Drive profitability
`;

      const result = await theologicalService.checkAlignment({
        content,
        contentType: 'lecture',
        requiresBiblicalIntegration: true
      });

      expect(result.hasScrollTone).toBe(false);
      expect(result.alignmentScore).toBeLessThan(0.5);
      expect(result.missingElements.length).toBeGreaterThan(0);
    }, 30000);

    it('should verify biblical integration quality', async () => {
      const content = `
# Servant Leadership

## Biblical Foundation
Jesus said, "Whoever wants to become great among you must be your servant" (Mark 10:43). 
This principle fundamentally transforms our understanding of leadership and authority.

The Apostle Paul demonstrated servant leadership by considering others' interests above 
his own (Philippians 2:3-4). He led not through coercion but through love and example.

## Theological Implications
Servant leadership reflects the character of God, who "did not come to be served, but 
to serve" (Matthew 20:28). This theological foundation shapes how we approach all 
leadership responsibilities.
`;

      const result = await theologicalService.checkAlignment({
        content,
        contentType: 'lecture',
        requiresBiblicalIntegration: true,
        checkIntegrationQuality: true
      });

      expect(result.biblicalIntegrationQuality).toBeGreaterThan(0.8);
      expect(result.biblicalReferences.length).toBeGreaterThan(2);
      expect(result.theologicalDepth).toBeGreaterThan(0.7);
    }, 30000);
  });

  describe('Plagiarism Detection', () => {
    it('should detect copied content', async () => {
      const content = `
The Westminster Confession of Faith states that the authority of the Holy Scripture, 
for which it ought to be believed, and obeyed, dependeth not upon the testimony of 
any man, or Church; but wholly upon God (who is truth itself) the author thereof: 
and therefore it is to be received, because it is the Word of God.
`;

      const result = await plagiarismService.checkPlagiarism({
        content,
        contentType: 'lecture',
        checkAgainstSources: true
      });

      expect(result.plagiarismDetected).toBe(true);
      expect(result.similarityScore).toBeGreaterThan(0.9);
      expect(result.matchedSources.length).toBeGreaterThan(0);
    }, 30000);

    it('should allow proper citations', async () => {
      const content = `
According to the Westminster Confession of Faith (Chapter 1, Section 4), 
"The authority of the Holy Scripture... dependeth not upon the testimony of any man, 
or Church; but wholly upon God."

This theological principle establishes that Scripture's authority is self-authenticating, 
deriving from God Himself rather than human validation.
`;

      const result = await plagiarismService.checkPlagiarism({
        content,
        contentType: 'lecture',
        checkAgainstSources: true,
        allowCitations: true
      });

      expect(result.plagiarismDetected).toBe(false);
      expect(result.properCitations).toBe(true);
    }, 30000);

    it('should detect paraphrasing without attribution', async () => {
      const content = `
Scripture's authority doesn't depend on human or church testimony, but comes entirely 
from God who is truth itself. Therefore, we should receive it as God's Word.
`;

      const result = await plagiarismService.checkPlagiarism({
        content,
        contentType: 'lecture',
        checkAgainstSources: true,
        detectParaphrasing: true
      });

      expect(result.paraphrasingDetected).toBe(true);
      expect(result.requiresAttribution).toBe(true);
    }, 30000);
  });

  describe('Comprehensive Quality Pipeline', () => {
    it('should run all quality checks and provide comprehensive report', async () => {
      const content = `
# Kingdom Economics: Biblical Stewardship in Business

## Introduction (Ignition)
What if everything you "own" in your business actually belongs to someone else? 
This isn't a hypothetical—it's the reality of biblical stewardship.

## Biblical Foundation (Download)
Scripture clearly teaches that "The earth is the Lord's, and everything in it" 
(Psalm 24:1). This foundational truth transforms how we approach business ownership, 
profit, and success. We are not owners but stewards, managing God's resources for 
His purposes.

## Worked Example (Demonstration)
Consider Joseph's stewardship of Egypt's resources during the seven years of plenty 
and famine (Genesis 41). He didn't treat the resources as his own but managed them 
wisely for the benefit of the nation, demonstrating faithful stewardship under God's 
guidance.

## Practice Exercise (Activation)
Analyze your current business decisions through a stewardship lens:
1. What resources has God entrusted to you?
2. How are you managing them for kingdom purposes?
3. Where might you need to shift from an ownership to a stewardship mindset?

## Reflection (Identity & Integration)
As a believer called to the marketplace, how does viewing yourself as a steward 
rather than an owner change your approach to business decisions? What systems might 
God be calling you to transform through faithful stewardship?

## Next Steps (Commission)
This week, identify one specific area of your business where you can practice better 
stewardship. Commit to managing that area with explicit recognition of God's ownership.
`;

      // Run all quality checks
      const [
        factualCheck,
        pedagogyCheck,
        theologicalCheck,
        plagiarismCheck
      ] = await Promise.all([
        factualChecker.checkAccuracy({
          content,
          contentType: 'lecture',
          requiresVerification: true
        }),
        pedagogyValidator.validateContent({
          content,
          contentType: 'lecture',
          targetAudience: 'Graduate students',
          learningObjectives: []
        }),
        theologicalService.checkAlignment({
          content,
          contentType: 'lecture',
          requiresBiblicalIntegration: true
        }),
        plagiarismService.checkPlagiarism({
          content,
          contentType: 'lecture',
          checkAgainstSources: true
        })
      ]);

      // Verify all checks pass
      expect(factualCheck.accuracyScore).toBeGreaterThan(0.8);
      expect(pedagogyCheck.isValid).toBe(true);
      expect(pedagogyCheck.pedagogyScore).toBeGreaterThan(0.8);
      expect(theologicalCheck.hasScrollTone).toBe(true);
      expect(theologicalCheck.alignmentScore).toBeGreaterThan(0.8);
      expect(plagiarismCheck.plagiarismDetected).toBe(false);

      // Calculate overall quality score
      const overallScore = (
        factualCheck.accuracyScore +
        pedagogyCheck.pedagogyScore +
        theologicalCheck.alignmentScore +
        (plagiarismCheck.plagiarismDetected ? 0 : 1)
      ) / 4;

      expect(overallScore).toBeGreaterThan(0.8);
    }, 60000);
  });
});
