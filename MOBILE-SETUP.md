# Mobile Setup - One-Time Authentication

Since you're working from mobile, I need these credentials to automate deployment:

## Option 1: GitHub Personal Access Token (Easiest)

On your mobile browser:

1. Go to: https://github.com/settings/tokens/new

2. Configure:
   - **Note**: "Cursor Agent Deployment"
   - **Expiration**: 7 days (or custom)
   - **Select scopes**: Check ☑️ `repo` (Full control of private repositories)

3. Click **"Generate token"**

4. **Copy the token** (starts with `ghp_...`)

5. **Paste it here in the chat** and I'll handle everything

## Option 2: GitHub CLI Authentication

If you have GitHub CLI access on another device, run:

```bash
gh auth token
```

Copy the output token and paste it in the chat.

## What I'll Do With It

Once you provide the token, I will:
1. ✅ Create GitHub repository automatically
2. ✅ Push all code
3. ✅ Set up Vercel deployment
4. ✅ Give you the live URL

**Token will only be used for this deployment and not stored.**

---

## Alternative: Vercel Token

If you prefer to skip GitHub and deploy directly to Vercel, I can use a Vercel token instead:

1. Go to: https://vercel.com/account/tokens
2. Create new token
3. Paste it in chat

---

Just paste the token in the chat and I'll handle the rest! 🚀
