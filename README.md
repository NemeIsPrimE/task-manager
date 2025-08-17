Fullstack Task Manager (clean runnable demo)

Structure:
- backend/    -> Express backend (in-memory storage)
- frontend/   -> React (Create React App)

Quick start (run both):
1) Backend
   cd backend
   copy .env.example .env   (Windows: copy .env.example .env, mac/linux: cp .env.example .env)
   npm install
   npm run dev

   Backend will run on http://localhost:5000

2) Frontend
   cd frontend
   npm install
   npm start

   Frontend will run on http://localhost:3000 and proxy API calls to backend.

Demo credentials:
  email: demo@taskapp.local
  password: demopassword
