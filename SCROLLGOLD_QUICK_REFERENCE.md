# ScrollGold Quick Reference Guide

**Status:** ✅ Refactoring Complete  
**Date:** December 1, 2025

---

## Quick Commands

### Validate Refactoring
```powershell
.\scripts\validate-scrollgold-refactor.ps1
```

### Apply Database Migration (Direct)
```bash
psql $DATABASE_URL < supabase/migrations/20251130000001_scrollgold_to_scrollgold.sql
```

### Build & Test
```bash
cd backend
npm run build
npm test
```

### Commit Changes
```bash
git add .
git commit -m "refactor: ScrollCoin → ScrollGold - Complete kingdom economy rebrand"
git push origin main
```

---

## API Changes

| Old Endpoint | New Endpoint |
|-------------|--------------|
| `/api/scrollcoin/*` | `/api/scrollgold/*` |

## Service Changes

| Old Name | New Name |
|----------|----------|
| `ScrollCoinService` | `ScrollGoldService` |
| `mintScrollCoin()` | `mintScrollGold()` |
| `transferScrollCoin()` | `transferScrollGold()` |

## Type Changes

| Old Property | New Property |
|-------------|--------------|
| `scrollCoinCost` | `scrollGoldCost` |
| `ScrollCoinTransaction` | `ScrollGoldTransaction` |

## Database Changes

| Old Table | New Table |
|-----------|-----------|
| `scrollcoin_transactions` | `scrollgold_transactions` |

**New Tables:**
- `ScrollGoldWallet`
- `ScrollGoldTransaction`
- `ScrollGoldReward`
- `ScrollGoldExchange`

**New Columns:**
- `profiles.scrollgold_earned`
- `profiles.scrollgold_spent`
- `courses.scrollgold_cost`
- `courses.scrollgold_reward`

---

## Files Modified

1. `.kiro/specs/complete-production-system/design.md`
2. `backend/src/models/portal_models.py`
3. `backend/src/tests/test_portal_schema_simple.py`
4. `backend/src/tests/test_portal_database_schema.py`
5. `DOWNLOAD-DATABASE-COMPLETE.ps1`
6. `DOWNLOAD-DATABASE-FIXED.ps1`

---

## Known Issues

⚠️ **Prisma Schema Validation:** 137 errors (pre-existing, unrelated to refactoring)  
**Workaround:** Use direct SQL migration instead of `npm run migrate`

---

## Next Steps

1. ✅ Code refactoring - COMPLETE
2. ⏳ Apply database migration
3. ⏳ Run tests
4. ⏳ Deploy to production
5. ⏳ Update documentation

---

## Support

- **Full Details:** `SCROLLGOLD_REFACTOR_FINAL_STATUS.md`
- **Migration Plan:** `SCROLLGOLD_REFACTOR_MASTER_PLAN.md`
- **Completion Report:** `scrollgold_TO_SCROLLGOLD_REFACTOR_COMPLETE.md`
