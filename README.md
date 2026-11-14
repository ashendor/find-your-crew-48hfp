# FIND YOUR CREW

A mobile-first microsite for the **48 Hour Film Project Dubai** (27–29 November 2026). Connect filmmakers, build crews, and create films in 48 hours.

---

## 🎬 Brand Identity

This project strictly follows the 48 Hour Film Project Dubai brand guidelines:

### Colors
- **Paper**: `#EFE6D2` - Primary background
- **Ink**: `#1A1817` - Primary text and borders
- **Rust**: `#B4442E` - Primary CTA color
- **Mustard**: `#D9A53F` - Secondary accent
- **Dubai Blue**: `#2E86C1` - Event accent

### Typography
- **Archivo Black** - Headlines
- **Archivo SemiBold** - Labels and buttons
- **Courier Prime** - Body text

### Design Principles
- Flat colors, no gradients
- Square edges, bold borders
- Subtle film grain texture
- Circle and filmstrip motifs
- Cinematic, poster-like aesthetic

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd find-your-crew
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Supabase for future features:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** - Styling with custom design tokens
- **Framer Motion** - Scroll animations
- **Supabase** - Placeholder for future auth/database features
- **Vercel** - Deployment platform

---

## 📁 Project Structure

```
find-your-crew/
├── app/
│   ├── coming-soon/      # Coming soon page for features in development
│   ├── globals.css       # Global styles with brand tokens
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Landing page
├── components/
│   ├── sections/         # Page sections (Header, Hero, Footer, etc.)
│   └── ui/              # Reusable UI components
├── lib/
│   └── supabase.ts      # Supabase client configuration
├── public/              # Static assets
└── README.md
```

---

## 🎨 Components

### UI Components
- **Button** - Primary and secondary CTAs
- **CircleBadge** - Circle motif badges with color variants
- **FilmstripDivider** - Filmstrip decorative element
- **FilmmakerCard** - Profile card with demo data badge

### Sections
- **Header** - Dubai label and 48HFP logo placeholder
- **Hero** - Large headline with primary CTAs
- **HowItWorks** - Three-step process explanation
- **FilmmakerPreviews** - Demo filmmaker cards
- **Footer** - Event details and links

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com/new):
   - Connect your GitHub account
   - Select the repository
   - Vercel will auto-detect Next.js

3. (Optional) Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Click **Deploy**

Your site will be live at `https://your-project.vercel.app`

### Manual Deployment

```bash
npm run build
npm start
```

---

## 🔮 Future Features

Phase 2+ features ready for Supabase integration:
- User authentication
- Profile creation and editing
- Filmmaker discovery and search
- Direct messaging
- Team formation tools
- Availability calendar

---

## 📝 Notes

### Demo Data
All filmmaker cards on the landing page are clearly marked as **DEMO** data.

### Coming Soon Pages
All CTAs navigate to `/coming-soon` with clear labeling. No dead links.

### Mobile-First
The design prioritizes mobile experience with responsive scaling for desktop.

### Performance
- Google Fonts are preloaded
- Images optimized with Next.js Image component (when added)
- Framer Motion animations use GPU-accelerated transforms

---

## 🎯 Phase 1 Requirements ✅

- [x] Mobile-first responsive design
- [x] Brand identity implementation (colors, fonts, visual style)
- [x] Header with Dubai label and logo placeholder
- [x] Hero section with headline and CTAs
- [x] How It Works section (3 steps)
- [x] Filmmaker preview cards with demo badges
- [x] Footer with event details and links
- [x] Scroll animations (Framer Motion)
- [x] Coming soon pages for future features
- [x] Reusable components and design tokens
- [x] Supabase placeholders
- [x] Vercel-ready deployment
- [x] README with setup instructions

---

## 📄 License

© 2026 48 Hour Film Project. All rights reserved.

---

## 🤝 Credits

**Powered by LikeMinds**

Built for the 48 Hour Film Project Dubai 2026.
