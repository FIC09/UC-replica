# Urban Company Replica - Full-Stack MERN Application

A production-grade Urban Company web application built with the complete **MERN Stack** (**M**ongoDB, **E**xpress.js, **R**eact 19, and **N**ode.js). The project is cleanly partitioned into independent `frontend` and `backend` directories.

---

## 📁 Project Architecture & Directory Structure

```
Urban Re/
├── package.json              # Root orchestrator with scripts to run frontend & backend concurrently
├── README.md                 # Project documentation
├── backend/                  # Node.js + Express.js + MongoDB API
│   ├── config/
│   │   └── db.js             # Mongoose MongoDB connection handler
│   ├── models/               # Mongoose Data Schemas
│   │   ├── User.js           # Users & authentication
│   │   ├── Service.js        # Services catalogue schema
│   │   ├── Booking.js        # Order & booking records
│   │   ├── Address.js        # Customer delivery addresses
│   │   ├── WorkerApplication.js   # Onboarding technician applications
│   │   ├── PartnerApplication.js  # Fleet & agency partner applications
│   │   ├── Coupon.js         # Promo discounts & coupon codes
│   │   └── AdminSetting.js   # Monsoon surge, broadcast alert, audit logs
│   ├── routes/               # Express REST API Endpoints
│   │   ├── authRoutes.js     # /api/auth (Login, Register, Profile)
│   │   ├── serviceRoutes.js  # /api/services (CRUD for services)
│   │   ├── bookingRoutes.js  # /api/bookings (Order placement, scheduling, cancel)
│   │   ├── addressRoutes.js  # /api/addresses (Saved address manager)
│   │   ├── workerRoutes.js   # /api/worker-applications (Technician onboarding)
│   │   ├── partnerRoutes.js  # /api/partner-applications (Partner onboarding)
│   │   ├── couponRoutes.js   # /api/coupons (Discount validation)
│   │   └── adminRoutes.js    # /api/admin (Surge pricing, broadcasts, analytics stats)
│   ├── scripts/
│   │   └── seed.js           # Database seeder (populates MongoDB with all services & defaults)
│   ├── .env                  # Backend environment configuration
│   ├── server.js             # Main Express server entry point
│   └── package.json          # Backend dependencies
│
└── frontend/                 # Vite + React 19 Frontend Client
    ├── public/               # Images, icons, and static assets
    ├── src/
    │   ├── api/
    │   │   └── apiClient.js  # Centralized client communicating with Express REST API
    │   ├── components/       # Reusable UI modals, sections, and views
    │   ├── data/
    │   │   └── servicesData.js # Reference static datasets & cities
    │   ├── App.jsx           # Main React root with MERN API integration
    │   ├── index.css         # Styling system & design tokens
    │   └── main.jsx          # React DOM entry
    ├── vite.config.js        # Vite dev server with proxy to backend (/api -> port 5000)
    └── package.json          # Frontend dependencies
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (Tested on v24)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string in `backend/.env`)

### 2. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```
*(Or individually: `cd backend && npm install`, then `cd ../frontend && npm install`)*

### 3. Seed MongoDB Database
To seed the database with the complete catalogue (51 services, coupons, sample bookings, saved addresses, worker applications, and admin settings):
```bash
npm run seed
```

### 4. Run the Full Stack Application
Start both the backend API and frontend dev server concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🛠️ Individual Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs backend (port 5000) and frontend (port 5173) concurrently |
| `npm run dev:frontend` | Starts only the frontend Vite development server |
| `npm run dev:backend` | Starts only the backend Express development server |
| `npm run seed` | Seeds MongoDB with initial 51+ services, coupons, users, and settings |
| `npm run build` | Builds the optimized frontend production bundle |

---

## 📡 REST API Reference

### Services (`/api/services`)
- `GET /api/services` — List all services (supports `?category=`, `?categoryTab=`, `?search=`)
- `GET /api/services/:id` — Get single service by ID
- `POST /api/services` — Create a new service (Admin)
- `PUT /api/services/:id` — Update existing service details
- `DELETE /api/services/:id` — Remove service from catalogue

### Bookings (`/api/bookings`)
- `GET /api/bookings` — Fetch customer bookings (optional `?phone=`)
- `GET /api/bookings/:id` — Get single booking details
- `POST /api/bookings` — Place new service order
- `PUT /api/bookings/:id` — Reschedule slot, change address, or update status
- `DELETE /api/bookings/:id` — Remove / cancel booking

### Customer Addresses (`/api/addresses`)
- `GET /api/addresses` — Fetch saved addresses (optional `?phone=`)
- `POST /api/addresses` — Add a new delivery address
- `PUT /api/addresses/:id` — Update saved address
- `PUT /api/addresses/:id/default` — Set as primary default delivery address
- `DELETE /api/addresses/:id` — Delete address

### Onboarding Applications
- `GET /api/worker-applications` & `POST /api/worker-applications` — Technician onboarding
- `GET /api/partner-applications` & `POST /api/partner-applications` — Agency & fleet onboarding

### Admin Hub (`/api/admin`)
- `GET /api/admin/settings` — Get monsoon surge, broadcast announcement, and audit trail
- `POST /api/admin/surge` — Toggle Monsoon rain fee surge (+₹49)
- `POST /api/admin/broadcast` — Update top header announcement message
- `POST /api/admin/audit-logs` — Record administrative action
- `GET /api/admin/stats` — Real-time metrics (services count, orders count, revenue)

### Coupons & Auth
- `GET /api/coupons` — List available promo discounts
- `POST /api/coupons/verify` — Validate promo code against current cart value
- `POST /api/auth/login` — Phone-based user login
- `PUT /api/auth/profile` — Update customer profile and UC Plus status
