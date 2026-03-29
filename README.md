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

---

