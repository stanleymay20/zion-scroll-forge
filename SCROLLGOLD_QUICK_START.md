# ScrollGold Quick Start Guide
## Get Started in 5 Minutes

**Token:** ScrollGold (SGD)  
**Network:** Polygon  
**Status:** Production Ready

---

## 🚀 Quick Commands

### Validate System
```bash
cd zion-scroll-forge
npx ts-node scripts/validate-scrollgold-system.ts
```

### Run Database Migration
```bash
cd zion-scroll-forge
supabase migration up
```

### Start Backend with ScrollGold
```bash
cd backend
npm install
npm run dev
```

---

## 💰 Quick Reference

### Exchange Rates
```
1 SGD = $0.10 USD
$1 USD = 10 SGD
```

### Course Prices
```
Undergraduate: 1,500 SGD ($150)
Graduate:      2,250 SGD ($225)
Doctoral:      3,000 SGD ($300)
```

### Common Rewards
```
Course Completion (A):  200 SGD
Assignment (95%+):       50 SGD
Daily Devotion:           5 SGD
Peer Tutoring (1hr):     50 SGD
```

---

## 🔧 API Endpoints

### Base URL
```
http://localhost:3000/api/scrollgold
```

### Get Balance
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/scrollgold/balance
```

### Get Wallet
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:3000/api/scrollgold/wallet
```

### Transfer Tokens
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"toUserId":"user-id","amount":100,"description":"Gift"}' \
  http://localhost:3000/api/scrollgold/transfer
```

---

## 📊 Multiplier System

### Streak Bonuses
```
7 days:   1.15x
14 days:  1.30x
30 days:  1.50x
90 days:  2.00x
365 days: 3.00x
```

### Grade Bonuses
```
95%+: 1.30x
90%+: 1.20x
85%+: 1.10x
80%+: 1.05x
```

---

## 🔐 Environment Setup

### Required Variables
```bash
# .env file
BLOCKCHAIN_NETWORK=polygon
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
SCROLLGOLD_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_PRIVATE_KEY=0x...
SCROLLGOLD_ENABLED=true
```

---

## 📁 Key Files

### Types
```
backend/src/types/scrollgold.types.ts
```

### Service
```
backend/src/services/ScrollGoldService.ts
```

### Config
```
backend/src/config/scrollgold.config.ts
```

### Routes
```
backend/src/routes/scrollgold.ts
```

### Migration
```
supabase/migrations/20251201000001_scrollgold_economy_system.sql
```

### Smart Contract
```
backend/contracts/ScrollGold.sol
```

---

## 🎓 Usage Examples

### Award Course Completion
```typescript
import ScrollGoldService from './services/ScrollGoldService';

const service = new ScrollGoldService();

await service.awardCourseCompletion(
  userId,
  courseId,
  95 // grade
);
```

### Pay Tuition
```typescript
await service.payTuition(
  userId,
  courseId,
  1500 // amount in SGD
);
```

### Transfer Tokens
```typescript
await service.transferScrollGold(
  fromUserId,
  toUserId,
  100, // amount
  'Gift for helping with assignment'
);
```

---

## 📖 Documentation

### Full Docs
- `SCROLLGOLD_TOKENOMICS_COMPLETE.md` - Complete tokenomics
- `SCROLLGOLD_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `SCROLLGOLD_REFACTOR_AND_IMPLEMENTATION_FINAL.md` - Final summary

### Quick Links
- Types: See `scrollgold.types.ts`
- Config: See `scrollgold.config.ts`
- API: See `scrollgold.ts` routes

---

## ✅ Validation Checklist

- [ ] Run validation script
- [ ] All 8 checks pass
- [ ] Database migration successful
- [ ] API endpoints responding
- [ ] Smart contract deployed (testnet)
- [ ] Environment variables configured

---

## 🆘 Troubleshooting

### Validation Fails
```bash
# Check file existence
ls backend/src/types/scrollgold.types.ts
ls backend/src/services/ScrollGoldService.ts
ls backend/src/config/scrollgold.config.ts
```

### Database Issues
```bash
# Reset and re-run migration
supabase db reset
supabase migration up
```

### API Not Responding
```bash
# Check environment
cat backend/.env | grep SCROLLGOLD

# Restart server
cd backend
npm run dev
```

---

## 🎯 Next Steps

1. **Validate:** Run validation script
2. **Migrate:** Apply database schema
3. **Test:** Try API endpoints
4. **Deploy:** Smart contract to testnet
5. **Launch:** Beta program

---

## 📞 Support

- **Documentation:** See markdown files in root
- **Validation:** Run `validate-scrollgold-system.ts`
- **Issues:** Check implementation files

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** December 1, 2025

🎉 **ScrollGold is ready to transform Christian education!**
