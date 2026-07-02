#  Healthcare Dashboard

A production-oriented full-stack healthcare dashboard built as part of a Senior Full Stack Developer technical assessment. The application demonstrates end-to-end ownership across frontend, backend, database design, authentication, authorization, file uploads, and deployment.

##  Live Demo

**Frontend:** https://healthcare-frontend-rxmq.vercel.app/login

**Backend API:** https://healthcare-dtn0.onrender.com

**GitHub Repository:** https://github.com/rootabhi001/healthcare

---

## ✨ Features

### 👨‍⚕️ Admin Portal

* Secure JWT authentication
* Role-Based Access Control (RBAC)
* Import initial healthcare dataset
* Upload health reports
* Search and filter users
* View user details
* View user health reports
* Pagination support

### 👤 User Portal

* Secure login
* Dashboard
* View latest health report
* View complete report history

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* Prisma ORM
* PostgreSQL (Neon)
* JWT Authentication
* bcryptjs
* Multer
* XLSX

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon PostgreSQL

---

## Project Structure

```text
healthcare/
│
├── client/
│
├── server/
│   ├── prisma/
│   └── src/
│
└── README.md
```

---

## Authentication & Authorization

The application uses JWT authentication with Role-Based Access Control.

Supported roles:

* ADMIN
* USER

Protected routes ensure users can only access resources permitted for their role.

---

## 📊 Admin Features

* Login
* Import initial healthcare dataset
* Upload health reports
* Search & filter users
* View user details
* View user reports

---

## 📈 User Features

* Login
* Dashboard
* Latest health report
* Report history

---

## ⚙️ Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm start
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
PATIENT_DEFAULT_PASSWORD=
FRONTEND_URL=
```

---

## 💻 Frontend Setup

```bash
cd client
npm install
npm run dev
```

Create a `.env` file:

```env
VITE_API_URL=
```

---

## Initial Dataset Import

The provided healthcare dataset contains:

* `clients`
* `health_reports`

The initial import:

* Imports client records
* Creates patient user accounts
* Imports health reports
* Prevents duplicate records using database constraints

After initialization, administrators can upload new health reports through the Admin Portal.

---

## 📬 API Endpoints

### Authentication

* POST `/api/auth/login`

### Admin

* POST `/api/admin/import-database`
* POST `/api/admin/upload-health-reports`
* GET `/api/admin/users`
* GET `/api/admin/users/:clientId`
* GET `/api/admin/users/:clientId/reports`

### User

* GET `/api/user/dashboard`
* GET `/api/user/latest-report`
* GET `/api/user/reports`

---

## 🔑 Demo Credentials

### Admin

Email:

```
admin@example.com
```

Password:

```
Admin@123
```

### Patient

Use any imported client email.

Password:

```
Patient@123
```

---

## 📌 Technical Highlights

* JWT Authentication
* Role-Based Access Control (RBAC)
* Prisma ORM
* PostgreSQL (Neon)
* Responsive UI
* Search & Pagination
* XLSX File Upload
* Environment Variable Management
* Protected Routes
* Centralized Error Handling

---

## 📦 Submission

* GitHub Repository
* Frontend Deployment
* Backend Deployment
* README
* Architecture Diagram
* Postman Collection
* Technical Decisions Document
