# Growfinix — Task 2: SaaS Multi-Tenant Architecture with RBAC

## 📌 Project Overview

This project was developed as part of the **Growfinix Web Development Internship**.

It demonstrates a **SaaS Multi-Tenant Architecture** with **Role-Based Access Control (RBAC)**. Multiple organizations (tenants) share a single platform while maintaining complete data isolation. Different user roles have different dashboards and permissions.

---

## 🚀 Tech Stack

- **Frontend:** Next.js
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Authentication:** JWT + Custom Middleware

---

## ✨ Features

- Multi-Tenant SaaS Architecture
- Secure JWT Authentication
- Role-Based Access Control (RBAC)
- Super Admin Dashboard
- Manager Dashboard
- User Dashboard
- Organization-based Data Isolation
- Project Management
- User Management

---

## 📂 Project Structure

```
task2-saas-rbac/
├── backend/
├── frontend/
├── screenshots/
└── README.md
```

---

## ⚙️ Setup

### Database

```bash
createdb growfinix_saas

cd backend
npm install
cp .env.example .env

# Fill in:
# DATABASE_URL
# JWT_SECRET

npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 👤 Create the First Organization & Super Admin

```bash
curl -X POST http://localhost:5001/api/auth/register-org \
-H "Content-Type: application/json" \
-d '{"orgName":"Acme Inc","name":"Ramya","email":"ramya@acme.com","password":"secret123"}'
```

This creates:
- Organization
- Super Admin Account

You can then log in using the registered credentials.

---

## 🔒 RBAC Design

- Organizations are isolated using `org_id`.
- JWT authentication secures all protected routes.
- `requireAuth` middleware validates users and attaches their role and organization.
- `requireRole()` middleware restricts access based on user roles.
- Super Admin, Manager, and User have different dashboards and permissions.

---

## 📸 Screenshots

Screenshots demonstrating:
- Super Admin Dashboard
- Manager Dashboard
- User Dashboard

are available in the **screenshots** folder.

---

## 🎥 Demo Video

A demonstration video showing:
- Organization Registration
- Super Admin Login
- Manager Login
- User Login
- Role-Based Access Control
- Dashboard Navigation

was created as part of the internship submission.

---

## 👩‍💻 Author

**P B Ramya**  
Growfinix Web Development Internship
