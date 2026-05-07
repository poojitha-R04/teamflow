# 🚀 TeamFlow — Team Task Manager

TeamFlow is a full-stack task management web application designed to help teams manage projects, assign tasks, and track progress efficiently with role-based access control.

---

🌐 Live Demo

Frontend:
https://heartfelt-endurance-production-3fbe.up.railway.app

Backend API:
https://teamflow-production-5fb0.up.railway.app/api/health

---

📂 GitHub Repository

https://github.com/poojitha-R04/teamflow

---

✨ Features

🔐 Authentication

- User Signup & Login
- JWT-based Authentication
- Secure password hashing

📁 Project Management

- Create and manage projects
- Add team members
- Role-based access (Admin/Member)

✅ Task Management

- Create tasks
- Assign tasks to users
- Update task status
- Set task priority
- Due date tracking

📊 Dashboard

- Total Tasks
- In Progress Tasks
- Completed Tasks
- Overdue Tasks

---

🛠️ Tech Stack

Frontend

- React.js
- Tailwind CSS
- Axios
- React Router

Backend

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt.js

Deployment

- Railway

---

🗄️ Database Schema

Tables:

- users
- projects
- project_members
- tasks

---

🔑 Role-Based Access Control

Admin

- Create projects
- Assign tasks
- Manage team members

Member

- View assigned tasks
- Update task status

---

📡 API Endpoints

Authentication

- POST /api/auth/signup
- POST /api/auth/login

Projects

- GET /api/projects
- POST /api/projects

Tasks

- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id

---

⚙️ Local Setup

1. Clone Repository

git clone https://github.com/poojitha-R04/teamflow.git

cd teamflow

---

2. Backend Setup

cd backend

npm install

Create .env

PORT=8080
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key

Run backend:

npm start

---

3. Frontend Setup

cd frontend

npm install

Create .env

REACT_APP_API_URL=http://localhost:8080/api

Run frontend:

npm start

---

🚀 Deployment

The application is fully deployed on Railway.

Frontend:
https://heartfelt-endurance-production-3fbe.up.railway.app

Backend:
https://teamflow-production-5fb0.up.railway.app

---

📸 Screenshots

- Login Page
- Signup Page
- Dashboard
- Project Management
- Task Management

---

🎥 Demo Video

https://drive.google.com/file/d/1O9PHpWqlfmPGJlEMdxNgnQF_PntuWzYW/view?usp=drivesdk

---

👨‍💻 Author

Poojitha R04

GitHub:
https://github.com/poojitha-R04
