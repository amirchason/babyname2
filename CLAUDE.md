# BabyNames App v2

## 🎯 Project Overview
Enhanced baby names app with AI chat, blog system, and 10,000+ names database.

## 🚀 Quick Start
```bash
cd /data/data/com.termux/files/home/proj/babyname2
npm install
npm start  # http://localhost:3000
```

## 📊 Commands
- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm run lint` - Linting
- `npm run deploy` - Deploy to GitHub Pages

## 🛠️ Tech Stack
- React 18 + TypeScript
- Tailwind CSS
- Google Gemini AI
- Shopify Blog API
- React Router v6

## 📁 Structure
```
src/
├── agents/      # AI agents (Chat, Scraper)
├── components/  # React components
├── pages/       # App pages
├── services/    # API services
└── utils/       # Utilities

scrapers/        # Python data collection
data/            # Names database
```

## 🎨 Theme
- Primary: #D8B2F2 (Light Purple)
- Secondary: #FFB3D9 (Light Pink)
- Accent: #B3D9FF (Light Blue)

## 📝 Key Features
- AI-powered name suggestions
- Advanced search & filtering
- Automated blog publishing (every 14 hours)
- Name origin & meaning analysis
- Popularity tracking

## 🔧 Environment
Configure `.env` with Google APIs, Shopify keys, and feature flags.

## 🤖 Agency Mode
For complex features requiring multi-agent collaboration:
```bash
Load: /data/data/com.termux/files/home/proj/dev-agency/CLAUDE.md
```

---
*v2.0.0 | Updated: 2025-09-27*