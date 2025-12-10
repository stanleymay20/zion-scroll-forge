# DeepSeek Direct API Setup Guide

## 🚀 Quick Start

### 1. Get DeepSeek API Key

Visit: https://platform.deepseek.com/api_keys

- Sign up or log in
- Create a new API key
- Add credits to your account ($5-10 recommended)

### 2. Add API Key to Environment

Edit your `.env` file in the `backend` directory:

```bash
# Add this line
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. Run Course Generation

```powershell
cd backend
npx tsx scripts/generate-with-deepseek-direct.ts
```

## 💰 Cost Estimate

DeepSeek pricing (as of 2024):
- **Input**: ~$0.14 per 1M tokens
- **Output**: ~$0.28 per 1M tokens

**For 15 comprehensive courses:**
- Estimated cost: **$5-8 total**
- Per course: ~$0.30-0.50

## 📋 What Gets Generated

Each course includes:

### Per Module:
- ✅ Module overview
- ✅ 4 comprehensive lectures (2000-2500 words each)
- ✅ Video scripts (JSON format)
- ✅ Detailed lecture notes
- ✅ Knowledge check assessments
- ✅ Practical assignments
- ✅ Spiritual formation reflections

### Per Course:
- ✅ Course overview
- ✅ Deployment pathways
- ✅ Final comprehensive assessment

## 🎯 Features

- **Direct API**: No middleman, faster and more reliable
- **Comprehensive Content**: Full Scroll Pedagogy compliance
- **Error Handling**: Halts on error (no simplified fallbacks)
- **Retry Logic**: Automatic retry with exponential backoff
- **Progress Tracking**: Real-time generation status

## 🔧 Troubleshooting

### API Key Not Found
```
❌ ERROR: DEEPSEEK_API_KEY not found
```
**Solution**: Add `DEEPSEEK_API_KEY` to your `.env` file

### Insufficient Credits
```
Error: Insufficient credits
```
**Solution**: Add credits at https://platform.deepseek.com/settings/credits

### Rate Limiting
The script includes automatic retry with exponential backoff.

## 📊 Monitoring Progress

The script provides real-time updates:
- Course being generated
- Module progress
- Lecture completion
- Final report with statistics

## ✅ Verification

After generation completes, verify content:

```powershell
npx tsx scripts/comprehensive-course-verification.ts
```

## 🎓 Course List

1. Sacred AI & Machine Learning Engineering (10 modules)
2. Kingdom Economics Foundations (8 modules)
3. ScrollGold & Digital Currency Systems (8 modules)
4. Global Trade & Kingdom Commerce (10 modules)
5. AI Trading & Financial Technology (10 modules)
6. Introduction to Prophetic AI (8 modules)
7. ScrollAgent Development (10 modules)
8. Neural Networks & Deep Learning (10 modules)
9. ScrollOS & AI Infrastructure (10 modules)
10. Advanced AI Governance (12 modules)
11. Scroll Hermeneutics (8 modules)
12. Prophetic Timeline Construction (10 modules)
13. Christology & Messianic Studies (10 modules)
14. Biblical Translation (10 modules)
15. Spiritual Warfare Protocols (12 modules)

**Total**: 146 modules, 584 lectures

## 🚦 Status

- ✅ Script ready
- ✅ DeepSeek API integration complete
- ✅ Scroll Pedagogy compliance
- ✅ Comprehensive content generation
- ⏳ Awaiting API key and execution
