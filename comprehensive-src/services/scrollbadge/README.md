# ScrollBadge NFT Certification System

The ScrollBadge NFT Certification System is a comprehensive blockchain-based credentialing solution that issues verifiable course completion badges as NFTs. This system ensures authentic, tamper-proof certification of student achievements at ScrollUniversity.

## Overview

ScrollBadges are NFT certificates that represent:
- Course completion achievements
- Skill mastery levels
- Spiritual formation milestones
- Prophetic achievements
- Kingdom impact recognition

Each badge is minted on the blockchain with comprehensive metadata, verification proofs, and public display capabilities.

## Architecture

### Core Components

1. **ScrollBadgeNFTService** - Handles blockchain interactions and NFT operations
2. **BadgeMintingService** - Processes course achievements and mints badges
3. **BadgeVerificationService** - Verifies badge authenticity and credentials
4. **PublicBadgeDisplayService** - Manages public display and sharing functionality
5. **ScrollBadgeSystem** - Main orchestrator that coordinates all services

### Data Flow

```
Course Completion → Achievement Validation → Badge Minting → Blockchain Storage → Public Display
```

## Features

### Badge Minting
- **Course Completion Badges**: Automatically minted upon course completion
- **Special Achievement Badges**: Manually minted for exceptional achievements
- **Batch Minting**: Efficient processing of multiple badges
- **Verification Proofs**: Multi-layer verification including faculty signatures and AI dean verification

### Badge Verification
- **Blockchain Verification**: Confirms NFT exists on blockchain
- **Ownership Verification**: Validates current badge owner
- **Course Completion Verification**: Cross-references with academic records
- **Skills Validation**: Verifies acquired competencies
- **Cached Results**: Optimized verification with intelligent caching

### Public Display
- **Badge Collections**: Comprehensive student badge portfolios
- **Shareable Profiles**: Public profiles with social media integration
- **Embeddable Widgets**: HTML widgets for external websites
- **QR Code Generation**: Quick verification via QR codes
- **Social Sharing**: Direct sharing to Twitter, LinkedIn, Facebook

## API Endpoints

### Badge Minting
```
POST /api/scrollbadges/mint
POST /api/scrollbadges/mint/special
POST /api/scrollbadges/mint/batch
```

### Badge Verification
```
GET /api/scrollbadges/verify/:tokenId
GET /api/scrollbadges/verify/hash/:hash
GET /api/scrollbadges/student/:studentId/verify
```

### Public Display
```
GET /api/scrollbadges/student/:studentId/collection
GET /api/scrollbadges/student/:studentId/profile
GET /api/scrollbadges/:badgeId/widget
```

### System Management
```
GET /api/scrollbadges/system/status
DELETE /api/scrollbadges/:tokenId/revoke
```

## Usage Examples

### Minting a Course Completion Badge

```typescript
import { scrollBadgeSystem } from './ScrollBadgeSystem';

const mintRequest = {
  studentId: 'student-123',
  courseId: 'course-456',
  achievementData: {
    completionDate: new Date(),
    finalGrade: 85,
    skillsAcquired: [
      {
        skillId: 'skill-1',
        name: 'Prophetic Discernment',
        level: 'practitioner',
        verifiedAt: new Date(),
        verifiedBy: 'ai-dean-1'
      }
    ],
    spiritualGrowth: {
      spiritualGrowth: 75,
      kingdomAlignment: 80,
      propheticSensitivity: 70,
      characterDevelopment: 85,
      callingClarity: 78
    },
    projectsCompleted: ['project-1'],
    assessmentScores: [
      {
        assessmentId: 'assessment-1',
        score: 85,
        maxScore: 100,
        completedAt: new Date()
      }
    ]
  },
  verificationProof: {
    courseCompletionHash: 'hash-123',
    facultySignature: 'signature-456',
    aiDeanVerification: 'verification-789'
  }
};

const badge = await scrollBadgeSystem.mintCourseCompletionBadge(mintRequest);
console.log('Badge minted:', badge.tokenId);
```

### Verifying a Badge

```typescript
const verificationResult = await scrollBadgeSystem.verifyBadge('token-123');

if (verificationResult.isValid) {
  console.log('Badge is valid and verified');
  console.log('Verification details:', verificationResult.verificationDetails);
} else {
  console.log('Badge verification failed:', verificationResult.errors);
}
```

### Creating a Public Badge Collection

```typescript
const collection = await scrollBadgeSystem.getStudentBadgeCollection('student-123');

console.log(`Student has ${collection.totalBadges} badges`);
console.log(`Skills acquired: ${collection.skillsAcquired.map(s => s.name).join(', ')}`);
console.log(`Kingdom alignment: ${collection.spiritualProgress.kingdomAlignment}%`);
```

## React Components

### ScrollBadgeDisplay
Displays individual badges with verification status and details.

```tsx
import ScrollBadgeDisplay from './components/ScrollBadge/ScrollBadgeDisplay';

<ScrollBadgeDisplay
  badge={badge}
  showVerification={true}
  showSkills={true}
  showSpiritualMetrics={true}
  size="medium"
  interactive={true}
/>
```

### BadgeCollection
Displays a complete collection of student badges with sharing options.

```tsx
import BadgeCollection from './components/ScrollBadge/BadgeCollection';

<BadgeCollection
  studentId="student-123"
  showPublicProfile={true}
  showShareOptions={true}
  isPublicView={false}
/>
```

## Configuration

### System Configuration

```typescript
const config = {
  enableBlockchain: true,
  enableIPFS: true,
  enablePublicDisplay: true,
  verificationCacheTTL: 300000 // 5 minutes
};

const badgeSystem = createScrollBadgeSystem(config);
```

### Blockchain Configuration

```typescript
const blockchainConfig = {
  networkName: 'ethereum-sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/your-key',
  contractAddress: '0x...',
  privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
  gasLimit: 500000,
  gasPrice: '20000000000'
};
```

## Database Schema

The system uses the following Prisma models:

- **ScrollBadge**: Main badge records with metadata and verification data
- **BadgeVerification**: Verification history and results
- **PublicBadgeProfile**: Public profile settings and shareable data

## Security Features

### Verification Layers
1. **Blockchain Verification**: NFT existence and ownership
2. **Academic Verification**: Course completion records
3. **Faculty Verification**: Human instructor signatures
4. **AI Verification**: AI dean validation
5. **Spiritual Verification**: Alignment with kingdom principles

### Anti-Fraud Measures
- **Immutable Records**: Blockchain storage prevents tampering
- **Multi-Signature Verification**: Multiple verification sources required
- **Revocation System**: Ability to revoke badges for misconduct
- **Audit Trail**: Complete verification history tracking

## Spiritual Integration

ScrollBadges incorporate spiritual formation metrics:

- **Kingdom Alignment**: Alignment with biblical principles
- **Prophetic Sensitivity**: Spiritual discernment development
- **Character Development**: Personal growth indicators
- **Calling Clarity**: Understanding of divine purpose
- **Spiritual Growth**: Overall spiritual maturity

## Future Enhancements

### Planned Features
- **Cross-Institution Recognition**: Integration with partner universities
- **Skill Pathways**: Progressive skill development tracking
- **Mentorship Integration**: Mentor verification and endorsements
- **Global Leaderboards**: Community recognition systems
- **Advanced Analytics**: Detailed achievement analytics

### Technical Improvements
- **Layer 2 Integration**: Reduced transaction costs
- **IPFS Optimization**: Improved metadata storage
- **Mobile Optimization**: Enhanced mobile experience
- **Offline Verification**: Offline badge verification capabilities

## Support and Documentation

For technical support or questions about the ScrollBadge system:

- **Documentation**: `/docs/scrollbadge/`
- **API Reference**: `/api/docs/scrollbadges`
- **Support**: support@scrolluniversity.org
- **GitHub Issues**: [ScrollUniversity Repository](https://github.com/scrolluniversity/platform)

## License

The ScrollBadge NFT Certification System is part of ScrollUniversity and is licensed under the SCROLL-1.0 license.

---

*"Let every badge be a testament not to human achievement, but to divine transformation through covenant education."* - ScrollUniversity Founding Scroll