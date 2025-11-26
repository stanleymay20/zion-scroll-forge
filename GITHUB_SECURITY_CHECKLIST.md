# GitHub Security Checklist for ScrollUniversity

## 🔒 Before Every Push

### 1. Environment Files
- [ ] `.env` files are in `.gitignore`
- [ ] No `.env` files are staged for commit
- [ ] `.env.example` files are up to date (without real values)
- [ ] All team members have their own local `.env` files

### 2. API Keys & Secrets
- [ ] No API keys in source code
- [ ] No database credentials in source code
- [ ] No JWT secrets in source code
- [ ] No blockchain private keys in source code
- [ ] No Stripe keys in source code
- [ ] No OAuth secrets in source code

### 3. Configuration Files
- [ ] All config files use environment variables
- [ ] No hardcoded URLs with credentials
- [ ] No embedded tokens or passwords

## 🚨 If Secrets Were Exposed

### Immediate Actions (Within 1 Hour)
1. **Rotate ALL exposed credentials immediately**
   - OpenAI API keys: https://platform.openai.com/api-keys
   - OpenRouter keys: https://openrouter.ai/keys
   - DeepSeek keys: https://platform.deepseek.com/api_keys
   - Anthropic keys: https://console.anthropic.com/settings/keys
   - Supabase keys: Project Settings > API
   - Stripe keys: https://dashboard.stripe.com/apikeys
   - Database passwords: Update in database and all services

2. **Remove from Git history**
   ```powershell
   .\REMOVE-SECRETS-FROM-HISTORY.ps1
   ```

3. **Force push to overwrite history**
   ```bash
   git push origin --force --all
   ```

4. **Notify team to re-clone**
   - All team members must delete and re-clone the repository
   - Update their local `.env` files with new credentials

### Within 24 Hours
- [ ] Review GitHub commit history for any other exposures
- [ ] Check GitHub security alerts
- [ ] Review access logs for unauthorized API usage
- [ ] Document the incident
- [ ] Update security procedures

## 📋 Secure Push Procedure

### Option 1: Use the Secure Push Script (Recommended)
```powershell
.\SECURE-PUSH-TO-GITHUB.ps1
```

This script will:
- Verify `.gitignore` configuration
- Remove `.env` files from tracking
- Scan for exposed secrets
- Stage changes safely
- Guide you through commit and push

### Option 2: Manual Secure Push
```bash
# 1. Ensure .env files are not tracked
git rm --cached .env backend/.env

# 2. Add changes (excluding .env)
git add .
git reset HEAD .env backend/.env

# 3. Verify no secrets in staged files
git diff --cached | grep -i "api_key\|secret\|password"

# 4. Commit and push
git commit -m "Your commit message"
git push origin main
```

## 🔐 Environment Variable Management

### Local Development
1. Copy `.env.example` to `.env`
2. Fill in your personal API keys
3. Never commit `.env` files
4. Keep `.env` files in `.gitignore`

### Production Deployment
1. Use environment variables in hosting platform
2. Never store secrets in code or config files
3. Use secret management services:
   - GitHub Secrets (for CI/CD)
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

### Team Collaboration
1. Share `.env.example` with placeholder values
2. Document required environment variables
3. Use a secure password manager for sharing secrets
4. Rotate keys regularly (every 90 days minimum)

## 🛡️ GitHub Security Features

### Enable These Settings
- [ ] Enable branch protection on `main`
- [ ] Require pull request reviews
- [ ] Enable secret scanning
- [ ] Enable Dependabot alerts
- [ ] Enable code scanning (CodeQL)
- [ ] Restrict who can push to main

### GitHub Secret Scanning
GitHub automatically scans for known secret patterns. If detected:
1. You'll receive an email alert
2. The secret will be flagged in Security tab
3. Follow the remediation steps immediately

## 📝 .gitignore Best Practices

Your `.gitignore` should include:
```gitignore
# Environment variables
.env
.env.*
!.env.example
*.env.local
*.env.production

# API Keys
**/api-keys.json
**/credentials.json
**/.secrets

# Database
database.json
connection-strings.txt

# Blockchain
**/*.pem
**/*.key
**/private-keys/
**/wallets/

# Certificates
*.crt
*.cer
*.p12
*.pfx
```

## 🔍 Regular Security Audits

### Weekly
- [ ] Review recent commits for accidental secret exposure
- [ ] Check GitHub security alerts
- [ ] Verify `.gitignore` is working correctly

### Monthly
- [ ] Rotate API keys
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Review team access permissions

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Update security documentation
- [ ] Team security training

## 📞 Emergency Contacts

If you discover a security breach:
1. **Immediately** rotate all credentials
2. Contact the security team
3. Document the incident
4. Follow incident response procedures

## 🎓 Security Training Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)

## ✅ Pre-Push Checklist

Before every push, verify:
- [ ] No `.env` files in commit
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No database credentials in code
- [ ] `.env.example` is updated
- [ ] All secrets use environment variables
- [ ] Ran security scan script
- [ ] Reviewed `git diff` output

## 🚀 Safe to Push!

Once all checks pass, you can safely push to GitHub:
```bash
git push origin main
```

---

**Remember**: It's easier to prevent secrets from being committed than to remove them from history!
