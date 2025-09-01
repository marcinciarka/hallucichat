# HalluciChat Deployment Quick Guide

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/marcinciarka/hallucichat)

## Features

- **AI-powered chat transformations** in 3 unique styles:
  - Ultra-Freaky 👅 (chaotic and wild)
  - Victorian Elegance 🎩 (formal and ornate)
  - Caveman Simple 🔥 (basic and primal)
- **Real-time messaging** with WebSockets
- **Style selection** during login
- **Transparent transformations** (original content shown)

## Prerequisites

- Node.js 18+
- Heroku CLI installed
- Google Gemini API key (optional)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment (optional - for AI features)
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 3. Run development server
npm run dev

# 4. Open browser
# Visit http://localhost:3000
```

## Heroku Deployment

### Option 1: One-Click Deploy (Recommended)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Option 2: Manual Deploy

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables (optional - for AI features)
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production

# 3. Deploy
git add .
git commit -m "Deploy HalluciChat"
git push heroku main

# 4. Open your app
heroku open
```

## Important Notes

- App works without Gemini API key (no AI transformations)
- Users can select from 3 transformation styles: Ultra-Freaky, Victorian, or Caveman
- WebSockets must be supported by your Heroku plan
- The server runs on the port specified by Heroku's PORT env var
- Both frontend and WebSocket server run on the same port in production
- Each user's selected style persists throughout their chat session

## File Structure Summary

- `src/app/page.tsx` - Homepage (nickname entry + style selection)
- `src/app/chat/page.tsx` - Chat interface with style indicators
- `server/index.ts` - WebSocket server with per-user style handling
- `server/lib/gemini.ts` - AI integration with style-based transformations
- `server/lib/prompts.ts` - Transformation prompts for each style
- `Procfile` - Heroku config
