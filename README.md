# SoulSeed

**Where your baby name blooms** 🌱

A comprehensive baby naming application with AI-powered suggestions, detailed name information, and cloud sync capabilities.

## Features

- 🍼 **10,000+ Baby Names** - Extensive database with detailed information
- 🤖 **AI Chat Agent** - Personalized name suggestions using Google Gemini
- 📊 **Advanced Search** - Filter by origin, meaning, popularity, and more
- 📝 **Blog Integration** - Automated content publishing to Shopify
- 🔍 **Data Scraping** - Real-time data collection from multiple sources
- ❤️ **Favorites System** - Save and manage favorite names
- 📱 **Responsive Design** - Works on all devices

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open http://localhost:3000 in your browser

## Environment Setup

Create a `.env` file in the project root with the following variables:

```env
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_SHOPIFY_STORE_URL=your_shopify_store.myshopify.com
REACT_APP_SHOPIFY_ACCESS_TOKEN=your_shopify_token
```

See `.env.example` for all configuration options.

## Project Structure

```
babyname2/
├── src/
│   ├── agents/        # AI agents
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── utils/         # Utility functions
├── public/            # Static assets
├── data/              # Name database
└── docs/              # Documentation
```

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Shopify API
- React Router v6

## Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Deploy to GitHub Pages

## License

MIT