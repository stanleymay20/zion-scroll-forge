/**
 * ScrollGold Configuration
 * Token economy parameters and reward structures
 */

import { TransactionCategory } from '../types/scrollgold.types';

export const SCROLLGOLD_CONFIG = {
  // Token Economics
  tokenomics: {
    initialSupply: 1000000000, // 1 billion ScrollGold
    maxSupply: 10000000000, // 10 billion cap
    burnRate: 0.01, // 1% burn on certain transactions
    reservePoolPercentage: 0.20, // 20% in reserve
    scholarshipPoolPercentage: 0.30, // 30% for scholarships
    rewardPoolPercentage: 0.40, // 40% for rewards
    operationsPercentage: 0.10 // 10% for operations
  },

  // Student Reward Economy
  studentRewards: {
    courseCompletion: {
      base: 100,
      gradeA: 200,
      gradeB: 150,
      gradeC: 125,
      gradeD: 100
    },
    assignmentSubmission: {
      onTime: 10,
      early: 15,
      excellent: 50 // 95%+ score
    },
    quizExcellence: {
      perfect: 25,
      excellent: 15,
      good: 10
    },
    discussionParticipation: {
      post: 5,
      qualityPost: 10,
      helpfulReply: 3
    },
    peerTutoring: {
      perSession: 50,
      studentSuccess: 100
    },
    researchPublication: {
      conference: 500,
      journal: 1000,
      bookChapter: 2000
    },
    spiritualFormation: {
      dailyDevotion: 5,
      prayerJournal: 5,
      scriptureMemory: 10,
      propheticCheckIn: 20,
      communityService: 50
    },
    communityService: {
      perHour: 25,
      projectCompletion: 200
    },
    referralBonus: {
      studentReferred: 100,
      studentEnrolled: 500
    }
  },

  // Faculty Reward System
  facultyRewards: {
    teachingLoad: {
      perCourse: 1000,
      perStudent: 50,
      highRating: 500 // 4.5+ rating
    },
    contentCreation: {
      lecture: 100,
      assignment: 50,
      quiz: 25,
      fullCourse: 5000
    },
    studentMentoring: {
      perSession: 75,
      studentSuccess: 200
    },
    curriculumDevelopment: {
      newProgram: 10000,
      courseRevision: 2000
    }
  },

  // Exchange Model
  exchangeRates: {
    scrollGoldToUSD: 0.10, // 1 ScrollGold = $0.10 USD
    usdToScrollGold: 10, // $1 USD = 10 ScrollGold
    minimumExchange: 100,
    maximumExchange: 100000,
    exchangeFee: 0.02 // 2% fee
  },

  // Transaction Fees
  transactionFees: {
    transfer: {
      percentage: 0.01, // 1%
      minimum: 1,
      maximum: 100
    },
    marketplace: {
      percentage: 0.05, // 5%
      minimum: 5,
      maximum: 500
    },
    tuitionPayment: {
      percentage: 0, // No fee for tuition
      minimum: 0,
      maximum: 0
    },
    withdrawal: {
      percentage: 0.03, // 3%
      minimum: 10,
      maximum: 1000
    }
  },

  // Wallet Design
  wallet: {
    features: [
      'Real-time balance tracking',
      'Transaction history',
      'Earning analytics',
      'Spending insights',
      'Goal setting',
      'Reward multiplier display',
      'Blockchain integration',
      'Multi-currency support',
      'Offline mode',
      'Export statements'
    ],
    security: [
      {
        name: 'Two-Factor Authentication',
        enabled: true,
        description: 'Required for withdrawals over 1000 ScrollGold'
      },
      {
        name: 'Transaction Limits',
        enabled: true,
        description: 'Daily spending limits for fraud prevention'
      },
      {
        name: 'Biometric Authentication',
        enabled: true,
        description: 'Fingerprint/Face ID for mobile access'
      },
      {
        name: 'Blockchain Verification',
        enabled: true,
        description: 'All transactions verified on-chain'
      }
    ],
    integrations: [
      'Stripe',
      'PayPal',
      'Ethereum',
      'Polygon',
      'University payment systems',
      'Ministry partner platforms'
    ]
  },

  // Blockchain Layer Design
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || 'polygon',
    contractAddress: process.env.SCROLLGOLD_CONTRACT_ADDRESS || '',
    tokenSymbol: 'SGD',
    decimals: 18,
    gasOptimization: true,
    batchTransactions: true,
    offChainComputation: true
  },

  // Partnership Economy
  partnerships: {
    universityPartners: {
      exchangeRate: 1.0,
      benefits: [
        'Course credit transfer',
        'Joint degree programs',
        'Faculty exchange',
        'Research collaboration'
      ]
    },
    ministryPartners: {
      exchangeRate: 1.2, // 20% bonus
      benefits: [
        'Mission trip funding',
        'Ministry placement',
        'Spiritual mentorship',
        'Kingdom project support'
      ]
    },
    corporatePartners: {
      exchangeRate: 0.9,
      benefits: [
        'Internship opportunities',
        'Job placement',
        'Professional development',
        'Industry certifications'
      ]
    },
    ngoPartners: {
      exchangeRate: 1.1,
      benefits: [
        'Service learning',
        'Global impact projects',
        'Humanitarian work',
        'Community development'
      ]
    }
  },

  // Multiplier System
  multipliers: {
    streak: {
      7: 1.15,
      14: 1.30,
      30: 1.50,
      90: 2.00,
      365: 3.00
    },
    grade: {
      95: 1.30,
      90: 1.20,
      85: 1.10,
      80: 1.05
    },
    spiritualGrowth: {
      90: 1.20,
      75: 1.10,
      60: 1.05
    },
    communityContribution: {
      100: 1.20,
      50: 1.10,
      25: 1.05
    }
  },

  // Pricing Tiers
  coursePricing: {
    undergraduate: {
      perCredit: 500, // 500 ScrollGold per credit
      fullCourse: 1500 // 3-credit course
    },
    graduate: {
      perCredit: 750,
      fullCourse: 2250
    },
    doctoral: {
      perCredit: 1000,
      fullCourse: 3000
    },
    certificate: {
      short: 500,
      professional: 2000,
      advanced: 5000
    }
  },

  // Scholarship Tiers
  scholarships: {
    merit: {
      full: 100, // 100% coverage
      partial75: 75,
      partial50: 50,
      partial25: 25
    },
    need: {
      full: 100,
      substantial: 75,
      moderate: 50,
      minimal: 25
    },
    ministry: {
      missionaryFull: 100,
      pastorPartial: 75,
      ministryLeader: 50
    }
  }
};

export default SCROLLGOLD_CONFIG;
