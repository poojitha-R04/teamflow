# 🚀 TeamFlow — Team Task Manager

A full-stack web application for managing projects and tasks with role-based access control (Admin/Member).

**Live Demo:** [your-railway-url.railway.app](https://your-url.railway.app)
**Demo Video:** [Link to 2-5 min demo]

---

## Features

- Authentication — Secure signup/login with JWT tokens
- Project Management — Create projects, invite team members
- Role-Based Access — Admin (full control) and Member (view + update status)
- Task Management — Create, assign, prioritize, and track tasks
- Dashboard — Personal overview of assigned tasks, overdue alerts, progress stats
- Overdue Detection — Highlights tasks past their due date

---

## Tech Stack

- Frontend: React 18, React Router v6, Axios
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Deployment: Railway

---

## API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/auth/me

### Projects
- GET    /api/projects
- POST   /api/projects
- GET    /api/projects/:id
- DELETE /api/projects/:id
- POST   /api/projects/:id/members
- DELETE /api/projects/:id/members/:uid

### Tasks
- GET    /api/tasks/project/:id
- GET    /api/tasks/dashboard/stats
- POST   /api/tasks
- PATCH  /api/tasks/:id
- DELETE /api/tasks/:id

---

## Role Permissions

| Action              | Admin | Member |
|---------------------|-------|--------|
| Create/delete tasks | YES   | NO     |
| Update task status  | YES   | YES    |
| Add/remove members  | YES   | NO     |
| View project        | YES   | YES    |
| Delete project      | YES (owner only) | NO |

---

## Running Locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your DB credentials in .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

---

## Deployment on Railway

1. Push to GitHub
2. Go to railway.app and create New Project
3. Add PostgreSQL plugin, copy DATABASE_URL
4. Deploy backend with env vars: DATABASE_URL, JWT_SECRET, NODE_ENV=production
5. Deploy frontend with REACT_APP_API_URL pointing to backend URL
