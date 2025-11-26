# Security Setup Guide - ScrollUniversity

## Critical: Remove Secrets from Git History

Your `.env` files are currently tracked by Git. Follow these steps immediately:

### Step 1: Remove .env files from Git tracking

```powershell
# Navigate to project root
cd zion-scroll-forge

# Remove .env files from Git (keeps local files)
git rm --cached .env
git rm --cached backend/.env

# Commit the removal
git commit -m "security: Remove .env files from version control"
```

### Step 2: Verify .gitignore is working

```powershell
# Check that .env files are now ignored
git status

# You should NOT see .env files listed
```

### Step 3: Rotate ALL Secrets

Since your secrets may have been exposed in Git history, you MUST rotate:

- ✅ OpenAI API keys
- ✅ OpenRouter API keys
- ✅ DeepSeek API keys
- ✅ Supabase service role keys
- ✅ Supabase anon keys
- ✅ Database connection strings
- ✅ JWT secrets
- ✅ Stripe API keys
- ✅ Any blockchain private keys
- ✅ Redis passwords
- ✅ Session secrets

### Step 4: Clean Git History (Optional but Recommended)

If secrets were committed, consider using BFG Repo-Cleaner or git-filter-repo:

```powershell
# Install BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from entire history
java -jar bfg.jar --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

⚠️ **WARNING**: This rewrites Git history. Coordinate with your team first!

## Environment Variable Setup

### Required Environment Variables

Create these files (they are now gitignored):

#### Root `.env`
```env
# Vite Frontend Environment Variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

#### `backend/.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/scrolluniversity
DIRECT_URL=postgresql://user:password@localhost:5432/scrolluniversity

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Authentication
JWT_SECRET=generate_a_strong_random_secret_here
SESSION_SECRET=generate_another_strong_random_secret

# AI Services
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
DEEPSEEK_API_KEY=your_deepseek_key
ANTHROPIC_API_KEY=sk-ant-...

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Blockchain
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
BLOCKCHAIN_PRIVATE_KEY=0x...
ETHEREUM_NETWORK=mainnet

# Email (if using)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Environment
NODE_ENV=development
PORT=3000
```

### Generate Strong Secrets

Use these commands to generate secure secrets:

```powershell
# Generate JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

## Security Checklist

- [ ] Removed .env files from Git tracking
- [ ] Updated .gitignore (already done)
- [ ] Rotated all API keys and secrets
- [ ] Generated new JWT secrets
- [ ] Updated Supabase keys
- [ ] Updated database passwords
- [ ] Verified .env files are not in git status
- [ ] Shared new secrets securely with team (use 1Password, LastPass, etc.)
- [ ] Updated production environment variables
- [ ] Documented secret rotation in team wiki

## Secure Secret Sharing

**NEVER** share secrets via:
- ❌ Email
- ❌ Slack/Discord
- ❌ Text messages
- ❌ Git commits
- ❌ Screenshots

**DO** share secrets via:
- ✅ 1Password shared vaults
- ✅ LastPass shared folders
- ✅ AWS Secrets Manager
- ✅ Azure Key Vault
- ✅ HashiCorp Vault
- ✅ Encrypted password managers

## Production Deployment

For production, use environment variables from your hosting platform:

### Vercel
```bash
vercel env add SUPABASE_URL
vercel env add OPENAI_API_KEY
# etc...
```

### Heroku
```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set OPENAI_API_KEY=your_key
# etc...
```

### Docker
Use Docker secrets or environment files:
```bash
docker run -e SUPABASE_URL=your_url -e OPENAI_API_KEY=your_key ...
```

### Kubernetes
Use Kubernetes secrets:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: scrolluniversity-secrets
type: Opaque
data:
  supabase-url: <base64-encoded-value>
  openai-api-key: <base64-encoded-value>
```

## Monitoring

Set up alerts for:
- Unusual API usage patterns
- Failed authentication attempts
- Database connection failures
- Unauthorized access attempts

## Regular Security Audits

Schedule quarterly reviews:
- Rotate secrets every 90 days
- Review access logs
- Update dependencies
- Run security scans
- Review .gitignore effectiveness

## Emergency Response

If secrets are exposed:
1. **Immediately** rotate all affected secrets
2. Review access logs for unauthorized usage
3. Notify your team
4. Document the incident
5. Update security procedures

## Support

For security concerns, contact:
- Security Team: security@scrolluniversity.org
- Emergency: Use your incident response plan

---

**Last Updated**: December 2024
**Next Review**: March 2025
