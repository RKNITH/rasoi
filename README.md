# 🍽 RestaurantPro — Full-Stack Restaurant Management System

A production-ready, full-stack Restaurant Management System built with the MERN stack (MongoDB, Express.js, React + Vite, Node.js), styled with Tailwind CSS v3, and state managed with Redux Toolkit.

---

## 🚀 Features

- **Role-Based Access Control (RBAC)** — Admin, Manager, Cashier, Waiter, Delivery Boy, Customer
- **JWT Auth** — HTTP-only cookies, Email OTP verification, Password reset
- **Online Ordering** — Customers browse menu, place orders, track status
- **Table Management** — Real-time status, reservations, floor view
- **Order Management** — Full lifecycle with status transitions
- **PDF Invoice Generation** — Auto-generate & email invoices (PDFKit)
- **Sales Analytics Dashboard** — Revenue charts, top items, daily/monthly trends
- **Expense Tracking** — Log and categorize restaurant expenses
- **Customer Reviews** — Ratings, comments, staff replies
- **Delivery Tracking** — Assign delivery boys, track status
- **Activity Logs** — Audit trail of all system actions
- **File Uploads** — Cloudinary (via plain multer memoryStorage)
- **Email** — Brevo SMTP for OTP, welcome, invoice emails
- **Security** — Helmet, Rate Limiting, CORS, Mongo Sanitize, Joi validation

---

## 📁 Project Structure

```
restaurant-management-system/
├── backend/                  ← Deploy separately to Vercel
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js     ← multer memoryStorage + uploadToCloudinary()
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── vercel.json           ← Vercel Node.js config
│
└── frontend/                 ← Deploy separately to Vercel
    ├── src/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json           ← Vercel static SPA config
```

---

## ⚙️ Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in your credentials
npm run dev               # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL=http://localhost:5000/api
npm run dev               # runs on http://localhost:5173
```

---

## 🌐 Deployment

Both **backend** and **frontend** are deployed **separately** to Vercel.  
Each folder has its own `vercel.json` and `package.json`.

### Deploy Backend to Vercel

```bash
cd backend
vercel --prod
```

Set these environment variables in the Vercel dashboard (or via `vercel env add`):

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | long random string |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_COOKIE_EXPIRES_IN` | `7` |
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your api key |
| `CLOUDINARY_API_SECRET` | your api secret |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | your brevo login email |
| `SMTP_PASS` | your brevo SMTP key |
| `FROM_EMAIL` | `noreply@yourrestaurant.com` |
| `FROM_NAME` | `RestaurantPro` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `NODE_ENV` | `production` |

### Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

Set this environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

> **CORS**: The backend reads `FRONTEND_URL` to whitelist the frontend origin.  
> Make sure `FRONTEND_URL` in the backend matches the frontend's Vercel URL exactly.

---

## 👥 Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full system — users, menu, orders, tables, invoices, expenses, analytics |
| **Manager** | Same as Admin (no user delete) |
| **Cashier** | Orders + billing + invoice generation |
| **Waiter** | Table orders + order status updates |
| **Delivery** | Delivery order list + pickup/delivery tracking |
| **Customer** | Online ordering + order history + reviews |

---

## 🔐 Security

- JWT in HTTP-only cookies (`SameSite=none; Secure` in production)
- Rate limiting: 100 req/15 min global, 20 req/15 min on auth routes
- Helmet security headers
- MongoDB query sanitization
- Joi input validation on all endpoints
- Account lockout after 5 failed logins (2 hours)
- bcryptjs password hashing (12 salt rounds)

---

## 📄 License

MIT © 2025 RestaurantPro
