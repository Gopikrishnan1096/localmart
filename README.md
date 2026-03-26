# LocalMart - Local Run Guide (Atlas)

This repository contains:
- `backend` (Express + MongoDB API) on `http://localhost:5000`
- `user-frontend` (customer app) on `http://localhost:3000`
- `shop-dashboard` (owner app) on `http://localhost:3001`

## Prerequisites
- Node.js 18+
- MongoDB Atlas URI

## Environment Setup

### 1) Backend
File: `backend/.env`

Required keys:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localmart?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d
USER_FRONTEND_URL=http://localhost:3000
SHOP_DASHBOARD_URL=http://localhost:3001
MAX_FILE_SIZE=5242880
```

Notes:
- `MONGODB_URI` must start with `mongodb://` or `mongodb+srv://`.
- Backend now fails fast at startup if `MONGODB_URI` is missing/placeholder/invalid.

### 2) User Frontend
File: `user-frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000
```

### 3) Shop Dashboard
File: `shop-dashboard/.env`
```env
PORT=3001
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_UPLOAD_URL=http://localhost:5000
```

## Install Dependencies

Run once in each app:
```bash
cd backend && npm install
cd ../user-frontend && npm install
cd ../shop-dashboard && npm install
```

## Run Locally (3 Terminals)

Terminal A:
```bash
cd backend
npm run dev
```

Terminal B:
```bash
cd user-frontend
npm start
```

Terminal C:
```bash
cd shop-dashboard
npm start
```

Expected:
- Backend: `http://localhost:5000`
- User app: `http://localhost:3000`
- Dashboard: `http://localhost:3001`

## Smoke Tests

Health check:
```bash
curl http://localhost:5000/api/health
```

Register shop owner:
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Shop Owner\",\"email\":\"shopowner@example.com\",\"password\":\"pass123\",\"role\":\"shopowner\"}"
```

Register user:
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Customer\",\"email\":\"customer@example.com\",\"password\":\"pass123\",\"role\":\"user\"}"
```

Login (example):
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"shopowner@example.com\",\"password\":\"pass123\"}"
```

Protected route should reject no token:
```bash
curl http://localhost:5000/api/auth/me
```

## Troubleshooting

1. Atlas connection fails
- In Atlas, add your current IP in Network Access.
- Ensure the Atlas DB user/password in `MONGODB_URI` are correct.

2. Invalid env formatting
- `.env` should contain only `KEY=VALUE` lines.
- Do not include shell commands in `.env`.
- `JWT_EXPIRE` should be `30d` (not `30d dev`).

3. Port already in use
- Free or change ports `3000`, `3001`, `5000`.
- If changed, also update frontend API URLs and backend CORS URLs.
