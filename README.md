# 🐾 Purrfect Care — Smart Cat Care Companion

A full-stack MERN web app that helps cat owners manage daily care, track health, and organize vet visits — all in one beautiful, easy-to-use interface.

---

## 📁 Project Structure

```
purrfect-care/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── config/
│   │   └── db.js
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
│       └── authMiddleware.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── styles/index.css
        ├── context/
        │   ├── AuthContext.jsx
        │   └── ToastContext.jsx
        ├── hooks/
        │   ├── useCats.js
        │   ├── useTasks.js
        │   └── useVetRecords.js
        ├── services/
        │   ├── api.js
        │   └── auth.js
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── Navbar.jsx
        │   ├── BottomNav.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── Modal.jsx
        │   ├── ConfirmDialog.jsx
        │   ├── EmptyState.jsx
        │   ├── CatCard.jsx
        │   ├── TaskCard.jsx
        │   ├── CatForm.jsx
        │   ├── TaskForm.jsx
        │   └── VetForm.jsx
        └── pages/
            ├── AuthPage.jsx
            ├── DashboardPage.jsx
            ├── CatsPage.jsx
            ├── CatProfilePage.jsx
            ├── ChecklistPage.jsx
            ├── VetRecordsPage.jsx
            └── SymptomHelperPage.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone https://github.com/yourname/purrfect-care.git
cd purrfect-care
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/purrfectcare?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkeychangeinproduction
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Backend will run on `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file (optional — only if your API is on a different origin):

```env
VITE_API_URL=http://localhost:5000/api
```

> If you're using Vite's proxy (default), this is not needed.

Start the frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

### 4. Open the app

Visit `http://localhost:5173` — you'll see the login page. Create an account and start adding cats! 🐱

---

## 🌍 Deployment

### Backend (Render / Railway)

1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app)
2. Connect your GitHub repo
3. Set the **root directory** to `backend/`
4. Set **build command**: `npm install`
5. Set **start command**: `npm start`
6. Add environment variables from `.env`

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repo
3. Set the **root directory** to `frontend/`
4. Set **build command**: `npm run build`
5. Set **output directory**: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.render.com/api
   ```

---

## 📡 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### 🔐 Auth

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/auth/signup` | `{ name, email, password }` | `{ _id, name, email, token }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ _id, name, email, token }` |
| GET | `/api/auth/me` | — | `{ _id, name, email }` |

**Example signup:**
```json
POST /api/auth/signup
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "secret123"
}
```

---

### 🐱 Cats

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/cats` | — | Get all cats for user |
| GET | `/api/cats/:id` | — | Get single cat |
| POST | `/api/cats` | Cat data | Create cat |
| PUT | `/api/cats/:id` | Cat data | Update cat |
| DELETE | `/api/cats/:id` | — | Delete cat |

**Cat body fields:**
```json
{
  "name": "Luna",
  "age": "2 years",
  "breed": "Persian",
  "weight": 4.2,
  "healthConditions": "mild asthma",
  "allergies": "chicken",
  "notes": "Loves laser toys",
  "image": "https://...",
  "color": "#8B5CF6"
}
```

---

### ✅ Tasks

| Method | Path | Body / Query | Description |
|--------|------|------|-------------|
| GET | `/api/tasks` | `?catId=&date=` | Get tasks (filtered) |
| POST | `/api/tasks` | Task data | Create task |
| PATCH | `/api/tasks/:id` | — | Toggle completion |
| PUT | `/api/tasks/:id` | Task data | Update task |
| DELETE | `/api/tasks/:id` | — | Delete task |

**Task body fields:**
```json
{
  "catId": "64abc...",
  "title": "Morning feed",
  "emoji": "🐟",
  "date": "2024-01-15",
  "recurring": false
}
```

---

### 🏥 Vet Records

| Method | Path | Body / Query | Description |
|--------|------|------|-------------|
| GET | `/api/vet` | `?catId=` | Get all records |
| POST | `/api/vet` | Record data | Create record |
| PUT | `/api/vet/:id` | Record data | Update record |
| DELETE | `/api/vet/:id` | — | Delete record |

**VetRecord body fields:**
```json
{
  "catId": "64abc...",
  "date": "2024-01-10",
  "type": "vaccination",
  "vetName": "Dr. Smith",
  "clinic": "Happy Paws Clinic",
  "notes": "FVRCP booster given. No reactions.",
  "nextVisitDate": "2025-01-10"
}
```

**Visit types:** `vaccination` | `checkup` | `dental` | `emergency` | `other`

---

## ✨ Features

| Feature | Status |
|---------|--------|
| JWT Authentication (signup/login/logout) | ✅ |
| Cat profiles (CRUD) | ✅ |
| Daily task checklist with toggle | ✅ |
| Vet records with visit types | ✅ |
| Dashboard with Purr Level meter | ✅ |
| Upcoming vet visit alerts | ✅ |
| Symptom Helper (static rules, 10 conditions) | ✅ |
| Dark mode toggle | ✅ |
| Mobile responsive with bottom nav | ✅ |
| Toast notifications | ✅ |
| Empty state illustrations | ✅ |
| Cat filter on tasks & vet records | ✅ |

---

## 🎨 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Fonts | DM Sans + DM Serif Display |

---

## 🐱 Sample Data (Optional Seed)

You can quickly test by using the signup endpoint and then creating a cat via the UI, or POST directly:

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","email":"alex@test.com","password":"test123"}'

# 2. Use the returned token for subsequent requests
TOKEN="your_token_here"

# 3. Add a cat
curl -X POST http://localhost:5000/api/cats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Luna","age":"2 years","breed":"Persian","color":"#8B5CF6"}'
```

---

## 📄 License

MIT — free to use for personal and commercial projects.

---

Made with 💜 for cat parents everywhere. 🐾
