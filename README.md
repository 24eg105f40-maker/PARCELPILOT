# ParcelPilot — Courier & Parcel Tracking System (MERN Stack)

A complete, enterprise-grade Courier Management and Parcel Tracking System built on the **MERN Stack** (MongoDB Atlas, Express.js, React, Node.js) with JWT authentication, role-based access control, persistent tracking history, and a responsive UI.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────────────────┐
                      │                 PARCELPILOT MERN STACK                   │
                      └──────────────────────────────────────────────────────────┘

     Frontend (React 19 + Vite)                          Backend (Express.js + Node.js)
     Port: 5173                                          Port: 5000
    ┌─────────────────────────────┐                     ┌─────────────────────────────┐
    │  - Overview Dashboard       │  REST API (Axios)   │  - Auth Controller (JWT)    │
    │  - Shipments CRUD           │ ──────────────────> │  - Shipment Controller      │
    │  - Public Tracking Portal   │  Bearer Auth Token  │  - Rate Limiting Middleware │
    │  - Activity Log & Reports   │ <────────────────── │  - Error Handler Middleware │
    │  - Auth (Staff/Admin Login) │                     └──────────────┬──────────────┘
    └─────────────────────────────┘                                    │
                                                                       │ Mongoose ODM
                                                                       ▼
                                                        ┌─────────────────────────────┐
                                                        │   MongoDB Atlas / Local     │
                                                        │  - Users Collection         │
                                                        │  - Shipments Collection     │
                                                        │  - Tracking Events Timeline │
                                                        └─────────────────────────────┘
```

---

## 1. Technology Stack

- **Database**: MongoDB Atlas / Local MongoDB via Mongoose ODM
- **Backend**: Node.js & Express.js REST API
- **Frontend**: React 19 + Vite with custom responsive CSS
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
- **Security**: Rate limiting on login and public tracking, CORS protection, sanitized public tracking endpoints
- **Icons**: Lucide React
- **HTTP Client**: Centralized Axios client with automatic bearer authorization interceptor

---

## 2. Quick Start & Local Setup

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/parcelpilot
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/parcelpilot?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=parcelpilot_super_secret_jwt_key_2026_dev_mode_secure_hash
CLIENT_URL=http://localhost:5173
ADMIN_NAME=ParcelPilot Admin
ADMIN_EMAIL=admin@parcelpilot.demo
ADMIN_PASSWORD=Admin@123456
NODE_ENV=development
```

**Frontend (`.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Seed MongoDB Database
Seeds the 5 initial demo shipments and creates the default administrator account:
```bash
npm run server:seed
```

### Step 4: Run Application

**Terminal 1 — Backend API:**
```bash
npm run server
# Running at http://localhost:5000
```

**Terminal 2 — React Frontend:**
```bash
npm run dev
# Running at http://localhost:5173
```

---

## 3. Demo Credentials & Benchmark Records

### Administrator Account
- **Email**: `admin@parcelpilot.demo`
- **Password**: `Admin@123456`
- **Role**: `admin` (Full access to create, update status, and manage all shipments)

### Public Demo Tracking Numbers
Public tracking works without login and sanitizes recipient emails and phone numbers for privacy:

| Tracking ID    | Route                 | Status             | Service    |
|----------------|-----------------------|--------------------|------------|
| `PP-2048-7316` | Hyderabad → Mumbai    | In Transit         | Express    |
| `PP-2048-7315` | Bengaluru → Chennai   | Out for Delivery   | Standard   |
| `PP-2048-7314` | Delhi → Kolkata       | Delivered          | Express    |
| `PP-2048-7313` | Pune → Ahmedabad      | Pending Pickup     | Economy    |
| `PP-2048-7312` | Jaipur → Lucknow      | Exception          | Standard   |

---

## 4. REST API Endpoints

### System & Health
- `GET /api/health` — Application and database connection status check

### Authentication
- `POST /api/auth/login` — Sign in and receive JWT token (rate-limited)
- `POST /api/auth/register` — Create staff account (admin only)
- `GET /api/auth/me` — Verify token and get current user profile

### Shipment Management
- `GET /api/shipments` — Paginated shipment list with search and filter (`auth required`)
- `GET /api/shipments/:id` — Shipment details by tracking ID (`auth required`)
- `GET /api/shipments/track/:trackingId` — **Public Tracking** (no login required, sanitized privacy)
- `POST /api/shipments` — Create shipment with server-generated tracking ID (`auth required`)
- `PATCH /api/shipments/:id` — Update shipment details (`auth required`)
- `PATCH /api/shipments/:id/status` — Change shipment status and append tracking event (`auth required`)
- `DELETE /api/shipments/:id` — Soft-delete shipment (`admin required`)

### Operations & Analytics
- `GET /api/dashboard/stats` — Real calculated counts from MongoDB (`auth required`)
- `GET /api/activity` — Chronological tracking timeline feed (`auth required`)
- `GET /api/reports/shipments` — Status and service type breakdown (`auth required`)

---

## 5. MongoDB Atlas Cloud Setup (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a free shared cluster (M0).
3. Under **Database Access**, create a database user with password authentication.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** > **Drivers** > copy the connection string.
6. Replace `<password>` with your database user password.
7. Paste this connection string into `server/.env` as `MONGODB_URI`.

---

## 6. Production Deployment

### Backend (Render / Railway)
1. Deploy the `server/` directory as a Node.js web service.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables on Render:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `PORT`: `5000` (or leave default assigned by host)
   - `JWT_SECRET`: Random 32+ character string
   - `CLIENT_URL`: Your deployed frontend URL (e.g. `https://your-parcelpilot.vercel.app`)
   - `NODE_ENV`: `production`

### Frontend (Vercel)
1. Import the root repository to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`

---

## 7. Security Highlights

- **Sanitized Public Tracking**: Protects customer privacy by hiding recipient phone numbers, email addresses, and administrative notes from public API responses.
- **Role-Based Authorization**: Unauthenticated users cannot create shipments or change parcel statuses.
- **Password Protection**: Passwords hashed with bcryptjs (12 salt rounds); password hashes never returned in API responses.
- **CORS & Rate Limiting**: Cross-origin requests restricted to configured frontend domains. Login and tracking endpoints protected by express-rate-limit.
