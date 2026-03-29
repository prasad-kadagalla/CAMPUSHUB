# 🎓 CampusHub — Centralized College Event Management Portal

A full-stack web application where students can discover and register for college events, organizers can create and manage events, and admins can approve and monitor everything from a unified dashboard.

---

## 📁 Project Structure

```
campushub/
├── backend/                  # Node.js + Express API
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── attendanceController.js
│   │   ├── userController.js
│   │   ├── analyticsController.js
│   │   └── qrController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect + role authorize
│   │   └── upload.js         # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── attendance.js
│   │   ├── users.js
│   │   ├── analytics.js
│   │   └── qr.js
│   ├── utils/
│   │   ├── mailer.js         # Nodemailer email utility
│   │   └── seed.js           # Database seed script
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Entry point
│
├── frontend/                 # React 18 SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.jsx   # Topbar + outlet
│   │   │   │   └── Sidebar.jsx     # Role-aware nav
│   │   │   └── Shared/
│   │   │       ├── UI.jsx          # Button, Badge, Card, Modal, etc.
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js      # JWT auth state
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        # Login / Register
│   │   │   ├── DashboardPage.jsx   # Role-aware dashboard
│   │   │   ├── EventsPage.jsx      # Browse + register
│   │   │   ├── MyEventsPage.jsx    # Student registrations + QR + cert
│   │   │   ├── ManageEventsPage.jsx# Organizer CRUD + QR
│   │   │   ├── ParticipantsPage.jsx# Attendance check-in
│   │   │   ├── ApproveEventsPage.jsx# Admin approvals
│   │   │   ├── UsersPage.jsx       # Admin user management
│   │   │   ├── AnalyticsPage.jsx   # Charts & stats
│   │   │   └── NotificationsPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios + all API calls
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.js                  # Router + routes
│   │   └── index.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── package.json              # Root scripts (concurrently)
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

| Tool        | Version   | Download |
|-------------|-----------|----------|
| Node.js     | v18+      | https://nodejs.org |
| npm         | v9+       | Included with Node |
| MongoDB     | v6+       | https://www.mongodb.com/try/download/community |
| Git         | Latest    | https://git-scm.com |

> **MongoDB Atlas (cloud) alternative:** You can use a free Atlas cluster instead of installing MongoDB locally. See the [MongoDB Atlas](#mongodb-atlas-optional) section below.

---

## 🚀 Quick Start (Local Setup)

### Step 1 — Clone or extract the project

```bash
# If you have the zip:
unzip campushub.zip
cd campushub

# Or if using git:
git clone <your-repo-url>
cd campushub
```

### Step 2 — Install all dependencies

```bash
# Install root, backend, and frontend dependencies in one go:
npm run install:all
```

Or install them manually:

```bash
# Root
npm install

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### Step 3 — Configure environment variables

**Backend:**
```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campushub
JWT_SECRET=replace_this_with_a_strong_random_string_min_32_chars
JWT_EXPIRE=7d

# Optional — email notifications (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000

# File upload settings
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

> **JWT_SECRET tip:** Generate a strong secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

The default frontend `.env` works out of the box:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=CampusHub
```

### Step 4 — Start MongoDB

```bash
# macOS / Linux
mongod

# Windows (run as Administrator)
net start MongoDB

# Or if using MongoDB as a service (macOS with Homebrew):
brew services start mongodb-community
```

Verify MongoDB is running:
```bash
mongosh
# Should connect and show a prompt. Type 'exit' to quit.
```

### Step 5 — Seed the database

```bash
npm run seed
```

This creates demo users and sample events. You'll see:

```
✅ MongoDB connected: localhost
🗑️  Cleared existing data
👥 Users created
🎪 Events created
📝 Registrations created
✅ Attendance records created

🌱 Seed completed! Demo accounts:
  Admin:     admin@college.edu     / admin123
  Organizer: csclub@college.edu    / org123
  Student:   arjun@college.edu     / student123
```

### Step 6 — Run the application

**Option A — Run both servers together (recommended):**
```bash
# From the root campushub/ directory
npm run dev
```

**Option B — Run separately in two terminals:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
# API running at http://localhost:5000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
# App running at http://localhost:3000
```

### Step 7 — Open in browser

Navigate to: **http://localhost:3000**

Use the **Quick Demo** links on the login page, or log in manually:

| Role      | Email                   | Password    |
|-----------|-------------------------|-------------|
| Student   | arjun@college.edu       | student123  |
| Organizer | csclub@college.edu      | org123      |
| Admin     | admin@college.edu       | admin123    |

---

## 🌐 MongoDB Atlas (Optional)

If you prefer cloud MongoDB instead of a local install:

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **free cluster** (M0 tier)
3. Click **Connect → Connect your application**
4. Copy the connection string, e.g.:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campushub?retryWrites=true&w=majority
   ```
5. Replace `MONGO_URI` in `backend/.env` with this string

---

## 📧 Email Setup (Optional)

Email notifications are optional — the app works fine without them.

To enable them using **Gmail**:

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Add to `backend/.env`:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_char_app_password
   ```

Emails are sent for:
- Registration confirmation (with QR code)
- Event approval notification (to organizer)
- Event reminder (1 day before)

---

## 🔌 API Reference

Base URL: `http://localhost:5000/api`

### Auth Endpoints
| Method | Route              | Description              | Auth |
|--------|--------------------|--------------------------|------|
| POST   | /auth/register     | Register new user        | No   |
| POST   | /auth/login        | Login (email or roll no) | No   |
| GET    | /auth/me           | Get current user         | Yes  |
| PUT    | /auth/password     | Update password          | Yes  |

### Events Endpoints
| Method | Route                  | Description                     | Role        |
|--------|------------------------|---------------------------------|-------------|
| GET    | /events                | Get all events (filtered)       | All         |
| GET    | /events/:id            | Get single event                | All         |
| GET    | /events/my             | Get organizer's own events      | Organizer   |
| POST   | /events                | Create event (with poster)      | Organizer   |
| PUT    | /events/:id            | Update event                    | Org / Admin |
| PUT    | /events/:id/review     | Approve or reject event         | Admin       |
| DELETE | /events/:id            | Cancel event                    | Org / Admin |

### Registrations Endpoints
| Method | Route                        | Description              | Role      |
|--------|------------------------------|--------------------------|-----------|
| GET    | /registrations/me            | My registrations         | Student   |
| POST   | /registrations/:eventId      | Register for event       | Student   |
| DELETE | /registrations/:eventId      | Cancel registration      | Student   |
| GET    | /registrations/event/:id     | Get event participants   | Org/Admin |

### Attendance Endpoints
| Method | Route                          | Description          | Role      |
|--------|--------------------------------|----------------------|-----------|
| POST   | /attendance/checkin            | Check in a student   | Org/Admin |
| GET    | /attendance/event/:eventId     | Event attendance     | Org/Admin |
| POST   | /attendance/certificate/:id    | Issue certificate    | Student   |

### Users Endpoints (Admin only)
| Method | Route              | Description              |
|--------|--------------------|--------------------------|
| GET    | /users             | Get all users (filtered) |
| GET    | /users/:id         | Get single user          |
| PUT    | /users/:id         | Update user              |
| PUT    | /users/:id/toggle  | Suspend/activate user    |
| DELETE | /users/:id         | Delete user              |

### Analytics Endpoints
| Method | Route               | Description           | Role      |
|--------|---------------------|-----------------------|-----------|
| GET    | /analytics          | Platform-wide stats   | Admin     |
| GET    | /analytics/organizer| Organizer stats       | Organizer |

### QR Endpoints
| Method | Route                  | Description              | Role      |
|--------|------------------------|--------------------------|-----------|
| GET    | /qr/event/:eventId     | Student's check-in QR   | Student   |
| GET    | /qr/checkin/:eventId   | Organizer entry QR      | Org/Admin |

---

## 🎨 Features by Role

### 👨‍🎓 Student
- Browse and search all approved events
- Filter by category: Technical, Cultural, Sports, Workshop
- One-click registration with seat tracking
- View all registered events
- Download QR code for event check-in
- Download participation certificates
- Receive notifications for upcoming events

### 🎪 Event Organizer
- Create events (title, description, category, date, time, venue, poster, limit, deadline)
- Submit events for admin review
- View/edit/cancel own events
- See all registered participants
- Mark attendance via manual check-in or QR scan
- View organizer-level analytics

### 🛡️ Admin
- Approve or reject pending events with optional feedback notes
- Filter events by status (pending / approved / rejected / cancelled)
- View and manage all registered users
- Suspend or reactivate user accounts
- Delete users
- View platform analytics:
  - Registrations by category (bar chart)
  - Category distribution (pie chart)
  - Monthly registration trends (line chart)
  - Top 5 popular events

---

## 🛠️ Tech Stack

### Backend
| Package      | Purpose                     |
|--------------|-----------------------------|
| express      | Web framework               |
| mongoose     | MongoDB ODM                 |
| bcryptjs     | Password hashing            |
| jsonwebtoken | JWT authentication          |
| multer       | File uploads (poster images)|
| qrcode       | QR code generation          |
| nodemailer   | Email notifications         |
| express-validator | Request validation     |
| dotenv       | Environment variables       |
| nodemon      | Development hot-reload      |

### Frontend
| Package        | Purpose                      |
|----------------|------------------------------|
| react 18       | UI library                   |
| react-router-dom v6 | Client-side routing   |
| axios          | HTTP client                  |
| recharts       | Analytics charts             |
| qrcode.react   | QR code display              |
| react-toastify | Toast notifications          |
| date-fns       | Date formatting              |

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Make sure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check your `MONGO_URI` in `backend/.env`
- For Atlas: ensure your IP is whitelisted in Atlas → Network Access

### "Port 5000 already in use"
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9   # macOS/Linux
netstat -ano | findstr :5000     # Windows — then: taskkill /PID <pid> /F
```

### "Cannot GET /api/..." in Postman
- Ensure the backend server is running at port 5000
- Check you're sending `Authorization: Bearer <token>` for protected routes

### Frontend shows blank page or cannot connect
- Confirm frontend `.env` has `REACT_APP_API_URL=http://localhost:5000/api`
- Check that backend is running at port 5000
- The `"proxy": "http://localhost:5000"` in `frontend/package.json` enables proxying in development

### Emails not sending
- Emails are optional; all features work without them
- Double-check Gmail App Password (not your regular password)
- Make sure `EMAIL_USER` and `EMAIL_PASS` are set in `backend/.env`

### "JWT_SECRET is not defined"
- Ensure `backend/.env` exists and contains `JWT_SECRET=...`
- Never commit `.env` to version control

---

## 📦 Production Build

```bash
# Build the React frontend
npm run build

# The build output is in frontend/build/
# Serve it with your web server or configure Express to serve it:
# app.use(express.static(path.join(__dirname, '../frontend/build')));
```

For deployment, consider:
- **Backend:** Railway, Render, Heroku, DigitalOcean, AWS EC2
- **Frontend:** Vercel, Netlify, or serve via the backend
- **Database:** MongoDB Atlas (free M0 tier)

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Credits

Built with ❤️ using the MERN stack.  
Fonts: [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans)
