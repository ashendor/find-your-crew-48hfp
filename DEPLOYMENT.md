# Deployment Guide

## Quick Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/your-username/find-your-crew.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `find-your-crew` repository
   - Vercel auto-detects Next.js settings
   - Click **Deploy**

3. **Optional: Add Environment Variables**
   - In Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL` (for Phase 2)
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (for Phase 2)

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   cd find-your-crew
   vercel
   ```

3. **Follow prompts**
   - Link to existing project or create new
   - Deploy!

---

## Manual Deployment (Alternative Platforms)

### Build for Production

```bash
npm run build
npm start
```

The app will run on `http://localhost:3000`

### Environment Variables (Phase 2)

When deploying to platforms other than Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

---

## Post-Deployment Checklist

- [ ] Site loads at production URL
- [ ] Mobile responsiveness verified
- [ ] All CTAs navigate to `/coming-soon`
- [ ] Fonts load correctly (Archivo Black, Archivo, Courier Prime)
- [ ] Animations work smoothly
- [ ] Demo badges visible on filmmaker cards
- [ ] Footer links functional

---

## Custom Domain (Optional)

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `crew.48hourfilm.ae`)
3. Configure DNS records as instructed
4. SSL certificate auto-generated

---

## Performance Optimization Tips

1. **Enable Image Optimization**
   - When adding images, use Next.js `<Image>` component
   - Vercel automatically optimizes images

2. **Analytics**
   - Add Vercel Analytics in Project Settings
   - Track page views and performance

3. **Caching**
   - Static pages are automatically cached
   - API routes (Phase 2) can use `revalidate`

---

## Troubleshooting

### Build Fails
- Check `npm run build` locally first
- Verify all dependencies in `package.json`
- Check Node.js version (18+)

### Fonts Not Loading
- Verify Google Fonts URL in `app/globals.css`
- Check network tab for font requests

### Environment Variables Not Working
- Prefix with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding variables
- Restart dev server locally

---

## Support

For deployment issues:
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
