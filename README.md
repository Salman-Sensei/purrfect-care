<div align="center">

<img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=90&auto=format&fit=crop" alt="Purrfect Care Banner" width="100%" style="border-radius: 16px" />

<br/>
<br/>

# 🐾 Purrfect Care

### Smart Cat Care Companion

**Track daily care · Manage vet visits · Monitor health**
 all in one beautiful, full-stack web app.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-purrfect--care.vercel.app-7c6af7?style=for-the-badge&logoColor=white)](https://purrfect-care-seven.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_Backend_API-Render-00B4D8?style=for-the-badge)](https://purrfect-care-api.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-Salman--Sensei-181717?style=for-the-badge&logo=github)](https://github.com/Salman-Sensei/purrfect-care)

<br/>

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 📖 Table of Contents

- [✨ Overview](#-overview)
- [🚀 Live Deployment](#-live-deployment)
- [🎨 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Quick Start](#-quick-start)
- [🌍 Deployment Guide](#-deployment-guide)
- [📡 API Reference](#-api-reference)
- [🌿 Git Workflow](#-git-workflow)
- [👥 Team](#-team)

---

## ✨ Overview

**Purrfect Care** is a production-ready MERN stack web application built as a Complex Engineering Problem (CEP) solving project.

Cat owners , especially new and busy pet parents , have no single digital tool to manage their cat's complete care. Notes get lost, vet records are scattered, and medication schedules are forgotten. Purrfect Care solves all of that.

> *"Every cat deserves great care."*

---

## 🚀 Live Deployment

| Service | URL | Platform |
|---------|-----|----------|
| 🌐 Frontend | [purrfect-care-seven.vercel.app](https://purrfect-care-seven.vercel.app) | Vercel |
| ⚡ Backend API | [purrfect-care-api.onrender.com](https://purrfect-care-api.onrender.com/api/health) | Render |
| 🗄️ Database | MongoDB Atlas | Azure (Pune) |

---

## 🎨 Features

### 🔐 Authentication
- Secure signup and login with email and password
- Passwords hashed with **bcryptjs** (10 salt rounds)
- **JWT tokens** : 30-day sessions stored in localStorage
- All routes protected : data completely isolated per user
- Auto-redirect to login on token expiry

### 🐱 Cat Profiles
- Create detailed profiles for **multiple cats**
- Fields: name, age, breed, weight, health conditions, allergies, notes, photo URL
- Per-cat **colour theme** for visual distinction
- Tabbed profile view: Basic Info · Health · Notes

### ✅ Daily Care Checklist
- Preset tasks (Morning feed, Medication, Play time, Litter box) + custom tasks
- One-tap toggle with **animated checkmark**
- **Purr Level™** progress meter — percentage of daily tasks done
- 🎉 **Confetti animation** when all tasks are completed
- Filter by date and by cat

### 🏥 Vet Records
- Log every vet visit: vaccination, checkup, dental, emergency, other
- Store vet name, clinic, notes, and next visit reminder
- **Health timeline** on dashboard showing recent visits
- Upcoming visit alerts for the next 7 days
- Colour-coded visit type badges

### 📊 Dashboard
- Personalised greeting with time-of-day message
- **Cat Spotlight card** — featured cat with full photo
- Animated stat counters: cats · tasks · upcoming visits
- Today's task list with direct toggle
- Upcoming vet visit reminders

### 🔍 Symptom Guide
- Dr Paw ( Ai assistant that suggest you vaccine) 
- Type symptoms or tap quick-select buttons
- Matches against **12 predefined health rules**
- Colour-coded urgency: 🔵 Non-urgent · ⚠️ Warning · 🚨 Emergency
- Always shows medical disclaimer

### 🎨 6 Colour Themes
| Theme | Type | Vibe |
|-------|------|------|
| 🤍 Pearl | Light | Clean, professional |
| 🌸 Blossom | Light | Warm, caring |
| 🌙 Midnight | Dark | Elegant, focused |
| 🌿 Forest | Dark | Natural, calm |
| 🌊 Ocean | Dark | Fresh, energetic |
| 🔥 Ember | Dark | Warm, cozy |

### 🌐 3D Landing Page
- **Three.js** animated background : floating orbs, star field, particle swarm, torus rings
- Custom cursor with smooth trailing ring
- Scroll-reveal animations on all sections
- Animated stat counters, feature cards, testimonials

### 📱 Responsive Design
- Desktop — persistent left sidebar
- Mobile — fixed bottom navigation bar
- Tested on Chrome, Firefox, Safari

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | SPA, component-based UI |
| Routing | React Router v6 | Client-side navigation |
| Styling | Tailwind CSS + CSS Variables | Utility-first + 6-theme system |
| 3D Graphics | Three.js | WebGL scene on landing page |
| Animation | Framer Motion | Page transitions |
| HTTP Client | Axios | API calls with JWT interceptors |
| Backend | Node.js + Express.js | RESTful API server |
| Database | MongoDB + Mongoose | NoSQL document store |
| Auth | JWT + bcryptjs | Stateless auth, password hashing |
| Frontend Deploy | Vercel | CDN, CI/CD from GitHub |
| Backend Deploy | Render | Node.js hosting, auto-deploy |
| DB Hosting | MongoDB Atlas | Cloud database, Azure-hosted |

---

## 📁 Project Structure

```
purrfect-care/
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── .env.example               # Environment template
│   ├── package.json
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Cat.js
│   │   ├── Task.js
│   │   └── VetRecord.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── catRoutes.js
│   │   ├── taskRoutes.js
│   │   └── vetRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── catController.js
│   │   ├── taskController.js
│   │   └── vetController.js
│   └── middleware/
│       └── authMiddleware.js      # JWT verification
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                # Router + context providers
        ├── main.jsx
        ├── context/
        │   ├── AuthContext.jsx    # JWT state management
        │   ├── ThemeContext.jsx   # 6-theme colour system
        │   └── ToastContext.jsx   # Toast notifications
        ├── hooks/
        │   ├── useCats.js
        │   ├── useTasks.js
        │   └── useVetRecords.js
        ├── services/
        │   ├── api.js             # Axios instance + interceptors
        │   └── auth.js
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   ├── BottomNav.jsx
        │   ├── ThemeSwitcher.jsx
        │   ├── Modal.jsx
        │   ├── CatCard.jsx
        │   ├── TaskCard.jsx
        │   ├── CatForm.jsx
        │   ├── TaskForm.jsx
        │   ├── VetForm.jsx
        │   ├── ConfirmDialog.jsx
        │   ├── EmptyState.jsx
        │   └── SkeletonCard.jsx
        └── pages/
            ├── LandingPage.jsx    # 3D Three.js landing
            ├── AuthPage.jsx
            ├── DashboardPage.jsx
            ├── CatsPage.jsx
            ├── CatProfilePage.jsx
            ├── ChecklistPage.jsx
            ├── VetRecordsPage.jsx
            └── SymptomHelperPage.jsx
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- npm

### 1. Clone the repository

```bash
git clone https://github.com/Salman-Sensei/purrfect-care.git
cd purrfect-care
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit your `.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/purrfectcare?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
OPENROUTER_API_KEY=your_openrouter_key_here
Resend_Email_API_KEY=your key
```

Start backend:

```bash
npm run dev     # development with hot reload
npm start       # production
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Optional `.env` for custom API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` 🎉

---

## 🌍 Deployment Guide

### Backend → Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

Add all environment variables from your `.env` in the Render dashboard.

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add environment variable:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

### Database → MongoDB Atlas

1. Create free M0 cluster
2. Create database user
3. Network Access → Add `0.0.0.0/0` (allow all IPs)
4. Copy SRV connection string to `MONGO_URI`

---

## 📡 API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | No | Register new user |
| POST | `/login` | No | Login, receive JWT |
| GET | `/me` | Yes | Get current user |

### 🐱 Cats — `/api/cats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get all cats |
| GET | `/:id` | Yes | Get single cat |
| POST | `/` | Yes | Create cat |
| PUT | `/:id` | Yes | Update cat |
| DELETE | `/:id` | Yes | Delete cat |

### ✅ Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get tasks (`?catId=` `?date=`) |
| POST | `/` | Yes | Create task |
| PATCH | `/:id` | Yes | Toggle completed |
| PUT | `/:id` | Yes | Update task |
| DELETE | `/:id` | Yes | Delete task |

### 🏥 Vet Records — `/api/vet`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get records (`?catId=`) |
| POST | `/` | Yes | Create record |
| PUT | `/:id` | Yes | Update record |
| DELETE | `/:id` | Yes | Delete record |

**Visit types:** `vaccination` · `checkup` · `dental` · `emergency` · `other`

---

## 🌿 Git Workflow

This project uses a **feature branch workflow** to keep the live site safe.

```
main        ← live production (auto-deploys to Vercel + Render)
develop     ← integration branch (test here first)
  ├── feature/nearest-vet
  ├── feature/food-recommendations
  └── feature/ai-symptom-detector
```

### For Team Members

```bash
# 1. Always start from latest develop
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Do your work, commit often
git add .
git commit -m "feat: describe what you did"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Open Pull Request on GitHub → base: develop
```

### Rules
- ❌ Never push directly to `main`
- ❌ Never push directly to `develop`
- ✅ Always work on a `feature/` branch
- ✅ Open a Pull Request for review
- ✅ Tag `Salman-Sensei` as reviewer

---

## 📊 Feature Status

| Feature | Status |
|---------|--------|
| JWT Authentication | ✅ Live |
| Cat profiles (CRUD) | ✅ Live |
| Daily task checklist | ✅ Live |
| Purr Level™ progress meter | ✅ Live |
| Vet records with visit types | ✅ Live |
| Dashboard with health timeline | ✅ Live |
| Upcoming vet visit alerts | ✅ Live |
| Symptom Helper (12 conditions) | ✅ Live |
| 6 colour themes | ✅ Live |
| Three.js 3D landing page | ✅ Live |
| Mobile responsive | ✅ Live |
| Toast notifications | ✅ Live |
| Nearest vet finder (Google Maps) | ✅ Live |
| AI-powered symptom detector |✅ Live |
| Food recommendations |✅ Live |
| Email reminders for vet visits |✅ Live |
| Cloud image upload | 📅 Planned , Inshallah soon |

---

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| **Salman Khan** | Team Lead · MERN-Stack Developer | [@Salman-Sensei](https://github.com/Salman-Sensei) |
| **Jawad Ul Hassan** | ML Developer |https://github.com/jawadUlHassan069  |
| **Omer Siddiqui** | UI/UX + Testing + Features adder Guy | https://github.com/omer9618 |

---

## 📄 License

MIT - free to use for personal and commercial projects. reach out on gmail , LinkedIn or what ever source i would love to help and  i would love any suggestions improving the Perrfect Care , Thank You 🤍

---

<div align="center">

Made with 💜 for cat parents everywhere

**[purrfect-care-seven.vercel.app](https://purrfect-care-seven.vercel.app) · [GitHub](https://github.com/Salman-Sensei/purrfect-care)**

🐾

</div>
