# GitHub Setup Instructions

Since automated GitHub repository creation requires authentication, please follow these manual steps:

## Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**

2. Fill in the details:
   - **Repository name**: `find-your-crew-48hfp`
   - **Description**: `Find Your Crew - 48 Hour Film Project Dubai 2026`
   - **Visibility**: Public
   - **DO NOT** check "Initialize this repository with a README" (we already have one)

3. Click **Create repository**

## Step 2: Push Code to GitHub

After creating the repository, run these commands:

```bash
cd /agent/find-your-crew

# Add the GitHub remote
git remote add origin https://github.com/ashendor/find-your-crew-48hfp.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. Go to: **https://vercel.com/new**
2. Click "Import Git Repository"
3. Select `ashendor/find-your-crew-48hfp`
4. Vercel will auto-detect Next.js settings
5. Click **Deploy**
6. Your site will be live at: `https://find-your-crew-48hfp.vercel.app`

### Option B: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /agent/find-your-crew
vercel --prod
```

## Alternative: Deploy via Cursor Hosting

If you prefer to deploy via Cursor's hosting instead of Vercel:

```bash
cd /agent/find-your-crew

# After pushing to GitHub, start the dev server
npm run dev

# In another terminal or use the Cursor UI to publish
# The app will be available at: cursor.com/apps/find-your-crew-dubai
```

---

## Troubleshooting

### If git push fails with authentication

Use one of these methods:

**Personal Access Token (Recommended):**
1. Go to: https://github.com/settings/tokens
2. Generate a new token (classic)
3. Select scopes: `repo` (full control)
4. Use token as password when pushing:
   ```bash
   git push -u origin main
   # Username: ashendor
   # Password: [paste your token]
   ```

**SSH (Alternative):**
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: https://github.com/settings/keys
3. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:ashendor/find-your-crew-48hfp.git
   git push -u origin main
   ```

---

## Verification

After deployment, verify:
- [ ] Site loads at the production URL
- [ ] Mobile responsiveness works
- [ ] All animations function properly
- [ ] Fonts load correctly
- [ ] All CTAs work (navigate to /coming-soon)

---

## Project Info

- **GitHub Repo**: https://github.com/ashendor/find-your-crew-48hfp
- **Vercel URL** (after deployment): https://find-your-crew-48hfp.vercel.app
- **Local Dev**: http://localhost:3000 (npm run dev)
