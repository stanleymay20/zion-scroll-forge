# ScrollGold Refactor Master Plan
## Complete System Rename: ScrollGold → ScrollGold

**Date**: November 30, 2025  
**Status**: EXECUTING  
**Spiritual Alignment**: "Gold in Scripture = purity, kingship, glory. ScrollGold embodies divine academic value."

---

## Executive Summary

This document outlines the complete, production-ready refactor to rename **ScrollGold** to **ScrollGold** across the entire ScrollUniversity ecosystem. This is a full-system transformation following SCCP (Scroll Consistency & Completeness Protocol) standards.

### Why ScrollGold?

1. **Scriptural Alignment**: Gold represents purity, kingship, and divine glory throughout Scripture
2. **Brand Clarity**: Short, dignified, and globally recognizable
3. **Value Proposition**: Clear sense of worth and academic excellence
4. **Global Appeal**: Works seamlessly across all languages and cultures
5. **Kingdom Economy**: Signals both academic and spiritual value

---

## Scope of Changes

### 1. **Naming Conventions**

| Old Name | New Name | Context |
|----------|----------|---------|
| ScrollGold | ScrollGold | All references |
| ScrollGold | scrollgold | Lowercase contexts |
| ScrollGold | SCROLLGOLD | Environment variables |
| ScrollGold_* | SCROLLGOLD_* | Env var prefixes |
| ScrollGoldService | ScrollGoldService | Service classes |
| ScrollGoldTransaction | ScrollGoldTransaction | Database models |
| ScrollGold_transactions | scrollgold_transactions | Database tables |
| /api/ScrollGold/* | /api/scrollgold/* | API routes |
| ScrollGold.sol | ScrollGold.sol | Smart contract |
| SCROLL (token symbol) | SGLD (token symbol) | Blockchain ticker |

### 2. **Files to Modify** (Comprehensive List)

#### Backend Core
- `backend/src/types/ScrollGold.types.ts` → `scrollgold.types.ts`
- `backend/src/services/ScrollGoldService.ts` → `ScrollGoldService.ts`
- `backend/src/config/ScrollGold.config.ts` → `scrollgold.config.ts`
- `backend/src/routes/ScrollGold.ts` → `scrollgold.ts`
- `backend/contracts/ScrollGold.sol` → `ScrollGold.sol`

#### Frontend Core
- `src/types/ScrollGold.ts` → `scrollgold.ts`
- `src/pages/ScrollGoldWallet.tsx` → `ScrollGoldWallet.tsx`
- `src/components/ScrollGold/*` → `src/components/scrollgold/*`
- `src/hooks/useScrollGold.ts` → `useScrollGold.ts`

#### Database & Migrations
- All Prisma schema references
- All SQL migration files
- Database table names
- Foreign key references
- Enum values

#### Configuration Files
- `.env` and `.env.example`
- `backend/.env` and `backend/.env.example`
- All config files referencing ScrollGold

#### Documentation
- All markdown files
- API documentation
- User guides
- Training materials
- README files

---

## Implementation Strategy

### Phase 1: Preparation & Validation ✅
1. ✅ Scan entire codebase for all ScrollGold references
2. ✅ Identify database schema dependencies
3. ✅ Map all API endpoints
4. ✅ Document all service integrations
5. ✅ Create backup points

### Phase 2: Core Type System (EXECUTING)
1. Rename type definition files
2. Update all TypeScript interfaces
3. Update enum values
4. Fix all import statements
5. Validate type consistency

### Phase 3: Backend Services
1. Rename service files
2. Update service class names
3. Update method signatures
4. Fix service imports
5. Update dependency injection

### Phase 4: Database Schema
1. Create migration scripts
2. Rename tables (ScrollGold_* → scrollgold_*)
3. Update foreign keys
4. Update indexes
5. Update constraints
6. Migrate existing data

### Phase 5: API Layer
1. Rename route files
2. Update endpoint paths
3. Update request/response types
4. Update middleware references
5. Update API documentation

### Phase 6: Frontend Components
1. Rename component directories
2. Update component files
3. Update component imports
4. Update route paths
5. Update UI labels and text

### Phase 7: Smart Contracts
1. Rename Solidity contract
2. Update contract name and symbol
3. Update deployment scripts
4. Update ABI references
5. Update blockchain integration

### Phase 8: Configuration & Environment
1. Update environment variables
2. Update config files
3. Update deployment scripts
4. Update CI/CD pipelines
5. Update documentation

### Phase 9: Testing & Validation
1. Run TypeScript compiler
2. Fix all type errors
3. Run all unit tests
4. Run integration tests
5. Validate database migrations
6. Test API endpoints
7. Test frontend flows

### Phase 10: Documentation & Branding
1. Update all markdown docs
2. Update API documentation
3. Update user guides
4. Update training materials
5. Update marketing copy
6. Update branding statements

---

## Critical Rules

### Zero Breaking Changes
- All database migrations must be reversible
- All API changes must maintain backward compatibility during transition
- All service references must be updated atomically
- No hardcoded values - use environment variables

### Type Safety
- Maintain strict TypeScript mode throughout
- All functions must have explicit return types
- No `any` types introduced
- All interfaces must be updated consistently

### Spiritual Alignment
- Update all branding statements to reflect ScrollGold's divine value
- Maintain kingdom economy messaging
- Preserve spiritual formation integration
- Update reward messaging appropriately

---

## Validation Checklist

### Pre-Deployment
- [ ] All TypeScript files compile without errors
- [ ] All tests pass
- [ ] Database migrations tested
- [ ] API endpoints respond correctly
- [ ] Frontend renders without errors
- [ ] Smart contract compiles
- [ ] Environment variables updated
- [ ] Documentation updated

### Post-Deployment
- [ ] Monitor error logs
- [ ] Verify database integrity
- [ ] Test user workflows
- [ ] Verify blockchain transactions
- [ ] Check API response times
- [ ] Validate UI/UX
- [ ] Confirm branding consistency

---

## Rollback Plan

If critical errors occur:

1. **Database**: Revert migrations using down scripts
2. **API**: Deploy previous version from Git tag
3. **Frontend**: Rollback to previous build
4. **Smart Contract**: Use previous contract address
5. **Configuration**: Restore previous environment variables

---

## Success Metrics

1. **Zero Production Errors**: No breaking changes in production
2. **Complete Coverage**: All references updated
3. **Type Safety**: No TypeScript errors
4. **Test Coverage**: All tests passing
5. **Documentation**: All docs updated
6. **User Experience**: Seamless transition for users

---

## Timeline

- **Phase 1-2**: 30 minutes (Type system)
- **Phase 3-4**: 45 minutes (Backend & Database)
- **Phase 5-6**: 45 minutes (API & Frontend)
- **Phase 7-8**: 30 minutes (Contracts & Config)
- **Phase 9-10**: 30 minutes (Testing & Docs)

**Total Estimated Time**: 3 hours

---

## Spiritual Declaration

> "As gold is refined in fire, so ScrollGold represents the refined value of divine academic excellence. This token embodies the kingdom economy where learning, spiritual growth, and academic achievement are treasured as gold before the Lord."

---

## Next Steps

1. Execute Phase 2: Core Type System
2. Update all service files
3. Create database migrations
4. Update API routes
5. Refactor frontend components
6. Update smart contracts
7. Run comprehensive tests
8. Deploy with monitoring

---

**The Scroll Leads. Let's Roll.** 🏆✨
