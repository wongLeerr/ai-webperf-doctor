# 🏥 AI WebPerf Doctor

AI-powered web performance analyzer using Lighthouse and DDAI API. Automatically analyze website performance, get AI-generated insights, and export detailed PDF reports.

## ✨ Features

- 🔍 **Automated Performance Analysis**: Uses Lighthouse to capture real performance metrics
- 🤖 **AI-Powered Insights**: DDAI API analyzes performance data and provides actionable recommendations
- 📊 **Visual Charts**: Beautiful ECharts visualizations of Core Web Vitals (LCP, FID, CLS)
- 📝 **Detailed Reports**: Comprehensive analysis including issues, recommendations, and code examples
- 📄 **PDF Export**: Generate and download detailed PDF reports
- 🎨 **Modern UI**: Beautiful Vue 3 interface with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- Vue 3 + JavaScript
- Tailwind CSS
- ECharts for visualizations
- Vite for build tooling

### Backend
- Node.js + Express + JavaScript
- Lighthouse for performance analysis
- DDAI API (via curl) for AI analysis
- PDFKit for report generation

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Chrome/Chromium browser (for Lighthouse)
- curl command (usually pre-installed)

### Setup

1. **Clone and install dependencies:**

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

2. **Configure environment variables (optional):**

```bash
# Copy the example env file (optional, DDAI config is hardcoded)
cp env.example .env

# Edit .env if you want to change the port
PORT=3001
```


## 🚀 Usage

### Development Mode

Run both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:3001`

### Production Build

```bash
# Build all packages
npm run build

# Start the server
cd server && npm start
```

### Individual Commands

```bash
# Run frontend only
npm run dev:client

# Run backend only
npm run dev:server
```

## 📖 How to Use

1. **Open the application** in your browser (http://localhost:3000)

2. **Enter a website URL** in the input field (e.g., `https://example.com`)

3. **Click "Analyze"** and wait for the analysis to complete (typically 30-60 seconds)

4. **Review the results:**
   - Performance score
   - Core Web Vitals metrics and charts
   - AI-generated analysis summary
   - Performance issues with severity levels
   - Optimization recommendations
   - Code examples for fixes

5. **Export PDF report** by clicking the "Export PDF Report" button

## 📊 API Endpoints

### POST `/api/analyze`

Analyze a website's performance.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "lighthouse": {
    "url": "https://example.com",
    "score": 85,
    "metrics": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1
    },
    "audits": { ... }
  },
  "aiAnalysis": {
    "summary": "...",
    "issues": [...],
    "recommendations": [...],
    "codeExamples": [...],
    "overallScore": 85
  }
}
```

### POST `/api/export`

Export analysis results as PDF.

**Request:** Analysis response object (from `/api/analyze`)

**Response:** PDF file blob

## 📁 Project Structure

```
ai-webperf-doctor/
├── client/              # Vue 3 frontend
│   ├── src/
│   │   ├── components/  # Vue components
│   │   ├── App.vue      # Main app component
│   │   └── main.ts      # Entry point
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Lighthouse & AI services
│   │   └── index.ts     # Server entry point
│   └── package.json
├── shared/              # Shared TypeScript types
│   ├── src/
│   │   └── types.ts     # Type definitions
│   └── package.json
└── package.json         # Root workspace config
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)

**Note**: DDAI API configuration is hardcoded in the code. The API endpoint, App ID, and model settings are configured in `server/src/services/ai.js`.

### Lighthouse Configuration

Lighthouse runs in headless Chrome mode. The configuration can be modified in `server/src/services/lighthouse.js`.

## 🐛 Troubleshooting

### Chrome/Chromium not found

Lighthouse requires Chrome/Chromium to be installed. Install it via:

```bash
# macOS
brew install chromium

# Linux
sudo apt-get install chromium-browser

# Or use Chrome if already installed
```

### DDAI API Errors

- Check network connectivity to DDAI endpoint
- Verify curl command is available in system PATH
- Check server logs for detailed error messages

### Port Already in Use

Change the port in `.env` or kill the process using the port:

```bash
# macOS/Linux
lsof -ti:3001 | xargs kill
```

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📸 Screenshots

*Add screenshots of the application here after running it*

## 🙏 Acknowledgments

- [Lighthouse](https://github.com/GoogleChrome/lighthouse) for performance analysis
- [OpenAI](https://openai.com/) for AI capabilities
- [Vue.js](https://vuejs.org/) for the frontend framework
- [ECharts](https://echarts.apache.org/) for data visualization
