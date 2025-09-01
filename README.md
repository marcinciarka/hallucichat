# 🌟 HalluciTalk

**An AI-powered real-time chat application where your messages and nicknames are magically transformed by Google's Gemini AI before being shared with others.**

## ✨ Features

- **Real-time messaging** with Socket.IO WebSockets
- **AI-powered transformations** using Google's Gemini API
- **Nickname transformation** - Your nickname gets a creative AI makeover
- **Message transformation** - Your messages become more interesting and creative
- **Clean, modern UI** built with TailwindCSS
- **TypeScript** for type safety
- **Heroku-ready** deployment configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: TailwindCSS 4
- **Real-time**: Socket.IO
- **AI**: Google Gemini API
- **Deployment**: Heroku

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key (optional - will work without AI features)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd hallucichat
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

   **Getting a Gemini API Key:**

   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env.local` file

   > **Note**: The app will work without the API key, but messages and nicknames won't be transformed.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use

1. **Enter your nickname** on the homepage
2. **Join the chat** and see your nickname transformed by AI
3. **Send messages** and watch them get creatively modified
4. **See other users** in the sidebar with their transformed nicknames
5. **View original content** (shown in smaller text for transparency)

## 🚀 Deployment to Heroku

### One-time Setup

1. **Create a Heroku app**

   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**

   ```bash
   heroku config:set GEMINI_API_KEY=your_gemini_api_key_here
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push heroku main
   ```

### Subsequent Deployments

```bash
git add .
git commit -m "Your commit message"
git push heroku main
```

### Important Heroku Notes

- The app uses WebSockets, so make sure your Heroku plan supports them
- The `Procfile` is configured to run the Node.js server
- Environment variables must be set in Heroku for the AI features to work

## 🏗️ Project Structure

```
hallucichat/
├── src/
│   └── app/
│       ├── page.tsx          # Homepage (nickname entry)
│       ├── chat/
│       │   └── page.tsx      # Chat interface
│       ├── layout.tsx        # Root layout
│       └── globals.css       # Global styles
├── server/
│   └── index.ts              # WebSocket server
├── lib/
│   └── gemini.ts             # Gemini API integration
├── Procfile                  # Heroku deployment config
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔧 Available Scripts

- `npm run dev` - Run development server (Next.js + WebSocket server)
- `npm run dev:next` - Run only Next.js development server
- `npm run dev:server` - Run only WebSocket server
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Environment Variables

| Variable         | Description                                  | Required |
| ---------------- | -------------------------------------------- | -------- |
| `GEMINI_API_KEY` | Google Gemini API key for AI transformations | No\*     |
| `NODE_ENV`       | Environment (development/production)         | Yes      |
| `PORT`           | Server port (set automatically by Heroku)    | No       |

\*Without `GEMINI_API_KEY`, the app works but doesn't transform messages/nicknames.

## 🎨 AI Transformations

The app uses Google's Gemini Pro model to:

- **Transform nicknames**: Make them more creative, whimsical, or mysterious
- **Transform messages**: Enhance them while preserving the original meaning
- **Maintain appropriateness**: All transformations are filtered for chat room use

## 🐛 Troubleshooting

### Common Issues

1. **Connection errors**: Ensure the server is running and WebSocket connections are allowed
2. **AI not working**: Check that `GEMINI_API_KEY` is set correctly
3. **Build failures**: Ensure all dependencies are installed with `npm install`

### Development Tips

- Use browser dev tools to monitor WebSocket connections
- Check server logs for AI API errors
- Original messages are always preserved and shown for transparency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Built with Next.js and Socket.IO
- AI powered by Google Gemini
- UI styled with TailwindCSS
- Deployed on Heroku

---

**Enjoy chatting in the AI-enhanced realm! 🚀✨**
