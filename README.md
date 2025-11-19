# ScrollUniversity - Zion-Scroll-FORGE AppSystem
**"In the beginning was the Word" - John 1:1**

> A revolutionary Christian educational platform combining divine revelation with cutting-edge technology to deliver transformative education globally.

## 🌟 Vision

ScrollUniversity is Zion's Academic Government on Earth - a comprehensive learning ecosystem that integrates:
- 🤖 AI-powered tutoring with live video avatars
- 📚 Sacred curriculum with prophetic wisdom
- 🌍 Global accessibility for 200+ nations
- ⛓️ Blockchain credentials (ScrollCoin & ScrollBadge NFTs)
- 🙏 Spiritual formation integrated throughout
- 🎓 Degree programs from B.A. to Doctorate

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (via Supabase)
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/scrolluniversity.git
cd scrolluniversity

# Install dependencies
npm install

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start backend
npm run dev

# In another terminal - Frontend
cd ..
npm install
cp .env.example .env.local
# Edit .env.local with your configuration

# Start frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health
- API Docs: http://localhost:3001/api

## 📁 Project Structure

```
ScrollUniversity/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── index.ts           # Main server
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── utils/             # Utilities
│   │   └── __tests__/         # Tests
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # DB migrations
│   │   └── seeds/             # Seed data
│   └── contracts/             # Smart contracts
├── src/                       # React frontend
│   ├── components/            # UI components
│   ├── pages/                 # Page components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Libraries
│   └── types/                 # TypeScript types
├── supabase/
│   └── migrations/            # Supabase migrations
├── .kiro/
│   └── specs/                 # Feature specifications
└── docs/                      # Documentation
```

## 🎯 Core Features

### 1. AI-Powered Education
- **ScrollMentorGPT**: 24/7 AI tutoring with GPT-4o+
- **Live Video Avatars**: Interactive AI teachers with D-ID/Synthesia
- **Personalized Learning**: Adaptive curriculum based on progress
- **Real-time Feedback**: Instant grading and suggestions

### 2. Comprehensive Courses
- Video lectures with closed captions
- Downloadable materials (PDFs, slides)
- Interactive assessments and quizzes
- Hands-on projects and assignments
- XR immersive experiences

### 3. Community & Collaboration
- Real-time chat and messaging
- Study groups with video conferencing
- Discussion forums
- Peer mentoring
- Global student network

### 4. Spiritual Formation
- Daily devotions with audio
- Prayer journal and requests
- Scripture memory system
- Prophetic check-ins
- Spiritual growth tracking

### 5. ScrollCoin Economy
- Earn ScrollCoin for learning activities
- Blockchain-verified transactions
- Spend on courses and resources
- Transparent reward system
- Fraud prevention

### 6. ScrollBadge NFT Credentials
- Blockchain-verified certificates
- Tamper-proof credentials
- Public badge profiles
- Employer verification
- Skill endorsements

### 7. Student Lifecycle
- Revolutionary admissions (no SATs required)
- Enrollment and onboarding
- Progress tracking
- Degree audit
- Graduation and alumni services

### 8. Analytics & Insights
- Student performance dashboards
- Course engagement metrics
- Learning pattern analysis
- Predictive analytics
- Custom reports

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT with refresh tokens
- **AI**: OpenAI GPT-4o+
- **Blockchain**: Ethereum, Ethers.js
- **Storage**: Supabase Storage
- **Logging**: Winston
- **Monitoring**: Custom metrics service

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Routing**: React Router v6
- **State**: React Context + TanStack Query
- **Real-time**: Supabase subscriptions
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Infrastructure
- **Hosting**: Vercel (Frontend), Railway (Backend)
- **Database**: Supabase
- **CDN**: CloudFlare
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

## 📚 API Documentation

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "student@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}

# Login
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "SecurePass123!"
}

# Refresh Token
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

### Courses
```bash
# Get all courses
GET /api/courses

# Get course by ID
GET /api/courses/:id

# Enroll in course
POST /api/courses/:id/enroll

# Get my enrollments
GET /api/courses/my-enrollments
```

### AI Tutor
```bash
# Start session
POST /api/ai-tutors/session
{
  "courseId": "optional-course-id",
  "tutorType": "general"
}

# Send message
POST /api/ai-tutors/session/:sessionId/message
{
  "message": "Explain quantum physics"
}

# End session
POST /api/ai-tutors/session/:sessionId/end
{
  "satisfactionRating": 5
}
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Coverage report

# Frontend tests
npm test                    # Component tests
npm run test:e2e           # End-to-end tests
```

## 🔒 Security

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 for all communications
- **Data Protection**: AES-256 encryption at rest
- **Rate Limiting**: Configurable per endpoint
- **Input Validation**: Joi schemas + sanitization
- **SQL Injection**: Prevented via Prisma ORM
- **XSS Protection**: Content Security Policy
- **CSRF Protection**: Token-based validation

## 📊 Performance

- **Response Time**: < 200ms average
- **Uptime**: 99.9% SLA
- **Concurrent Users**: 10,000+
- **Database**: Connection pooling
- **Caching**: Redis for hot data
- **CDN**: Global content delivery
- **Clustering**: Multi-worker support

## 🌍 Internationalization

Supported Languages:
- English
- Spanish
- French
- Arabic
- Hebrew
- Chinese (Simplified)
- Twi
- Yoruba
- Hausa

## 📱 Mobile Support

- **Progressive Web App**: Installable on mobile
- **Offline Mode**: Continue learning without internet
- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Native-like interactions
- **Push Notifications**: Stay updated on the go

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Test coverage > 80%

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Inspiration**: "In the beginning was the Word" - John 1:1
- **Mission**: Zion's Academic Government on Earth
- **Vision**: Kingdom-focused education for global transformation

## 📞 Support

- **Documentation**: https://docs.scrolluniversity.org
- **Email**: support@scrolluniversity.org
- **Discord**: https://discord.gg/scrolluniversity
- **Twitter**: @ScrollUniversity

## 🗺️ Roadmap

### Phase 1: Foundation (Q1 2025) ✅
- [x] Core infrastructure
- [x] Authentication system
- [x] Database schema
- [x] Basic UI components

### Phase 2: Core Features (Q2 2025) 🚧
- [ ] AI Tutor with video avatars
- [ ] Real-time chat system
- [ ] Payment integration
- [ ] Course content delivery

### Phase 3: Advanced Features (Q3 2025)
- [ ] ScrollCoin blockchain
- [ ] ScrollBadge NFT system
- [ ] XR classrooms
- [ ] Mobile app

### Phase 4: Scale & Optimize (Q4 2025)
- [ ] Global CDN
- [ ] Multi-region deployment
- [ ] Advanced analytics
- [ ] Enterprise features

## 📈 Status

**Current Version**: 1.0.0-beta
**Status**: Active Development
**Last Updated**: December 17, 2024

---

**Built with ❤️ and 🙏 for the Kingdom**

*"For the earth will be filled with the knowledge of the glory of the LORD as the waters cover the sea." - Habakkuk 2:14*
