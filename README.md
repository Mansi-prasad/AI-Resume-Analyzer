# AI Resume Analyzer

AI Resume Analyzer is a full-stack web application that helps users analyze, improve, manage, and export their resumes using AI-powered feedback.

The application provides ATS-focused resume analysis, keyword insights, improvement suggestions, resume version tracking, analytics, and PDF export functionality.

## Features

- User registration and authentication
- Resume upload and management
- AI-powered resume analysis
- ATS score and score breakdown
- Resume strengths and weaknesses
- Missing keyword detection
- Actionable improvement suggestions
- AI-generated bullet rewrites
- Resume version management
- Version comparison and diff view
- Resume analysis history
- Dashboard with score trends
- Insights and analytics
- PDF resume export
- Protected routes for authenticated users
- Responsive React user interface

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Recharts
- React Dropzone
- React PDF Renderer
- Axios
- TanStack React Query
- Lucide React

### Backend

- Node.js 20+
- Express 5
- MongoDB
- Mongoose
- JWT authentication
- Google Gemini API
- Multer
- PDF Parse
- Zod
- Bcrypt
- Express Rate Limit
- Morgan

## Project Structure

```text
AI-Resume-Analyzer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## Prerequisites

Before running the project, install:

- Node.js 20 or higher
- npm
- MongoDB or a MongoDB Atlas database
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mansi-prasad/Ai-Resume-Analyzer.git
cd Ai-Resume-Analyzer
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` directory:

```bash
cp .env.example .env
```

Update the values in `backend/.env`:

```env
NODE_ENV=development
PORT=5000

CLIENT_ORIGIN=http://localhost:5173

MONGO_URI=mongodb://localhost:27017/ai-resume-analyzer

JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
COOKIE_NAME=ai_resume_analyzer_token

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model
```

`MONGO_URI` and `JWT_SECRET` are required for the backend to start successfully.

### 4. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend

From the `backend` directory:

```bash
npm run dev
```

The backend runs by default at:

```text
http://localhost:5000
```

### Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend runs by default at:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## Application Routes

### Public routes

- `/` — Landing page
- `/login` — Login page
- `/register` — Registration page

### Protected routes

- `/dashboard` — User dashboard
- `/resumes` — Resume list
- `/resumes/:id` — Resume details and analysis
- `/resumes/:id/export` — Resume export
- `/insights` — Resume insights and analytics
- `/versions` — Resume versions
- `/history` — Analysis history
- `/settings` — User settings

## Backend API Modules

The backend provides API modules for:

- `/api/health` — Server health checks
- `/api/auth` — Registration, login, logout, and authentication
- `/api/resumes` — Resume management
- `/api/dashboard` — Dashboard statistics
- `/api/insights` — Resume insights and analytics
- `/api/versions` — Resume version management
- `/api/history` — Resume analysis history

## How It Works

1. Create an account or log in.
2. Upload a resume.
3. The backend parses and stores the resume data.
4. The AI service analyzes the resume.
5. Review the ATS score, strengths, issues, and missing keywords.
6. Apply suggested improvements and bullet rewrites.
7. Compare different resume versions.
8. Export an optimized resume as a PDF.
9. Track progress through the dashboard and insights pages.

## Development Notes

- The backend requires Node.js 20 or newer.
- The backend connects to MongoDB before starting the server.
- CORS is configured through `CLIENT_ORIGIN`.
- Authentication uses JWT-based cookies.
- The frontend uses Vite for development and production builds.
- AI analysis depends on a valid Gemini API configuration.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.
4. Run the frontend lint and build commands.
5. Commit your changes:

```bash
git commit -m "Add your feature"
```

6. Push your branch:

```bash
git push origin feature/your-feature-name
```
