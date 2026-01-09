# Quiz Application (MERN Stack)

## Overview
This is a full-stack Quiz Application built using the MERN stack as part of the CausalFunnel Software Engineer Intern assessment.

The application allows users to start a quiz using their email, attempt 15 timed multiple-choice questions fetched from an external API, and view a detailed report after submission.  
The system is designed with clear separation between frontend (React) and backend (Express) to demonstrate API design, state management, and session handling.

### Key Components
- **Start Page:** Email input to initiate quiz session
- **Quiz Page:** Timed quiz with question navigation and status tracking
- **Report Page:** Final score with correct vs attempted answers
- **Backend APIs:** Session management, question fetching, answer tracking

---

## Setup & Installation

### Prerequisites
- Node.js (v14+)
- npm

### Steps
```bash
npm run install-all
npm run dev
Frontend runs on: http://localhost:3000

Backend runs on: http://localhost:5000

Assumptions
User session data is stored in memory (no database required for assessment scope)

Only one active quiz session per user at a time

Internet connectivity is available for fetching quiz questions

Application is intended for demo/assessment purposes, not production

Challenges Faced & Solutions
1. OpenTDB API rate limiting (429 errors)
→ Implemented caching of questions for 5 minutes and retry logic.

2. Timer persistence on page refresh
→ Used a server-based timer tied to the quiz session instead of frontend-only state.

3. Managing quiz state across navigation
→ Centralized state handling using backend session data and consistent API updates.
