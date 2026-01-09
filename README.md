# Quiz Application

A full-stack quiz application built with the MERN stack (MongoDB, Express, React, Node.js) for CausalFunnel's Software Engineer Intern position assessment.

## Features

- **Start Page**: Email submission to begin quiz
- **Quiz Page**: 
  - 15 questions from OpenTDB API
  - 30-minute countdown timer with auto-submit
  - Navigation between questions
  - Overview panel showing visited/attempted questions
- **Report Page**: Results with user answers vs correct answers, score summary

## Tech Stack

- **Frontend**: React 19 with JavaScript
- **Backend**: Node.js with Express
- **Routing**: React Router DOM
- **HTTP Client**: Axios

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start the application**:
   ```bash
   npm run dev
   ```

   This starts:
   - Backend server on `http://localhost:5000`
   - Frontend server on `http://localhost:3000`

3. **Open browser** and navigate to `http://localhost:3000`

### Running Servers Separately

**Option 1: From root directory**

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

**Option 2: From individual directories**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Troubleshooting

**Port already in use?**
```bash
# Windows PowerShell
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

**Rate limiting errors (429)?**
- Questions are cached for 5 minutes
- Wait a few seconds and try again
- The app automatically retries with exponential backoff

## Project Structure

```
sdec_v1/
├── backend/
│   ├── server.js          # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/     # API service
│   │   └── App.jsx
│   └── package.json
└── package.json          # Root package.json
```

## API Endpoints

- `GET /api/quiz/questions` - Fetch 15 questions
- `POST /api/quiz/start` - Start quiz session
- `POST /api/quiz/answer` - Save answer
- `POST /api/quiz/visit` - Mark question as visited
- `GET /api/quiz/session/:sessionId` - Get session data
- `POST /api/quiz/complete` - Complete quiz

## Notes

- Questions are cached for 5 minutes to reduce API calls
- Session data is stored in-memory (use database in production)
- Timer is server-based and persists across page refreshes
"# casualfunnel_sde_assignment" 
