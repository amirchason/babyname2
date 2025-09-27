# Environment Data Summary - BabyNames App v2

## 🔑 API Keys & Services

### Google Services
- **Google API Key**: `AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE`
  - Used for: Google services integration
- **Gemini API Key**: `AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE`
  - Used for: AI chat agent and content generation
- **YouTube API Key**: `AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE`
  - Used for: Finding songs with baby names

### Shopify Integration
- **Store URL**: `future-fashion-oracle.myshopify.com`
- **Access Token**: `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`
- **Blog ID**: (To be configured)

## ⚙️ Application Configuration

### Core Settings
- **App Name**: BabyNames
- **Version**: 2.0.0
- **Base URL**: http://localhost:3000
- **API URL**: http://localhost:5000

### Feature Flags
- **Scraping**: Enabled ✅
- **AI Chat**: Enabled ✅
- **Blog**: Enabled ✅
- **Favorites**: Enabled ✅

### Database Configuration
- **Local DB**: Enabled
- **DB Path**: `/data/names.json`

## 🎨 UI Configuration

### Theme Colors
- **Primary**: `#D8B2F2` (Light Purple)
- **Secondary**: `#FFB3D9` (Light Pink)
- **Accent**: `#B3D9FF` (Light Blue)

### Layout Settings
- **Trending Names**: 6 max
- **Popular Names**: 8 max
- **Names Per Page**: 20

## 🔧 Performance Settings

### Caching
- **Cache Duration**: 3600000ms (1 hour)
- **Service Worker**: Enabled

### Scraping Configuration
- **Wikipedia**: Enabled
- **YouTube**: Enabled
- **IMDB**: Enabled
- **Bible API**: Enabled
- **Request Delay**: 1000ms
- **Max Retries**: 3

## 📝 Blog Automation
- **Post Interval**: 14 hours
- **Auto Publish**: Enabled
- **Queue Size**: 100 posts

## 🚀 Deployment
- **GitHub Pages**: https://amirchason.github.io/babyname2
- **Public URL**: /babyname2

## 📊 Development Settings
- **Debug Mode**: Disabled
- **Log Level**: info
- **Environment**: Development

---

## All Environment Variables

The complete `.env` file has been created with all the above configurations.

To use in another environment:
1. Copy the `.env` file
2. Update any sensitive keys as needed
3. Adjust URLs for production deployment

## Security Notes
⚠️ **Important**: These are development keys. For production:
- Generate new API keys
- Use environment-specific tokens
- Never commit `.env` to version control
- Use secure key management services