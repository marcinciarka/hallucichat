# HalluciTalk Deployment Quick Guide

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

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables (optional - for AI features)
heroku config:set GEMINI_API_KEY=your_api_key_here
heroku config:set NODE_ENV=production

# 3. Deploy
git add .
git commit -m "Deploy HalluciTalk"
git push heroku main

# 4. Open your app
heroku open
```

## Important Notes

- App works without Gemini API key (no AI transformations)
- WebSockets must be supported by your Heroku plan
- The server runs on the port specified by Heroku's PORT env var
- Both frontend and WebSocket server run on the same port in production

## File Structure Summary

- `src/app/page.tsx` - Homepage (nickname entry)
- `src/app/chat/page.tsx` - Chat interface
- `server/index.ts` - WebSocket server
- `lib/gemini.ts` - AI integration
- `Procfile` - Heroku config
