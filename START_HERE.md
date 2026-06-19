# 🚀 One-Command Startup

## Quick Start (3 Options)

### **Option 1: NPM Script (Recommended)** ⭐

```bash
# Start everything at once
npm start

# Or explicitly:
npm run start:all
```

This will start:
- 👤 User Service
- 🚁 Charter Service  
- 🌐 API Gateway

All in **one terminal** with color-coded output!

---

### **Option 2: Shell Script**

```bash
./start-services.sh
```

Includes pre-flight checks:
- ✅ Redis running
- ✅ .env exists
- ✅ Dependencies installed

---

### **Option 3: Docker Compose**

```bash
docker-compose up
```

Starts everything including Redis & MySQL!

---

## 🛑 Stop All Services

### NPM (Ctrl+C in terminal)
Just press `Ctrl+C` in the terminal running `npm start`

### Shell Script
```bash
./stop-services.sh
```

### Docker
```bash
docker-compose down
```

---

## 📋 Prerequisites

Before running ANY option:

### 1. Create `.env` File

```bash
touch .env
nano .env
```

Paste minimum config:

```env
NODE_ENV=development

# Database
DB_HOST=138.68.230.22
DB_PORT=3306
DB_USERNAME=charters_user
DB_PASSWORD=Y8b7T!G5xFq2zHk9Jv6pQs1Kd
DB_DATABASE=air_charters

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
JWT_EXPIRATION=1h

# API Gateway
API_GATEWAY_PORT=5008
```

### 2. Start Redis

```bash
redis-server
```

Or install first:
```bash
brew install redis
```

---

## ✅ Verify Everything Works

After starting services, check:

**1. Health Check:**
```bash
curl http://localhost:5008/api/health
```

**2. Swagger Docs:**
Open in browser: http://localhost:5008/api/docs

**3. Login Test:**
```bash
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🎨 What You'll See

When you run `npm start`, you'll see color-coded output:

```
[USER]    👤 User Service is listening on Redis
[CHARTER] 🚁 Charter Service is listening on Redis
[GATEWAY] 🚀 API Gateway running on http://localhost:5008
```

Each service has its own color:
- 🔵 Blue = User Service
- 🟢 Green = Charter Service
- 🟣 Purple = API Gateway

---

## 🐛 Troubleshooting

### "Redis connection refused"
```bash
redis-server  # Start Redis first
```

### "Port 5008 already in use"
```bash
lsof -ti:5008 | xargs kill -9
```

### Services won't start
```bash
# Clean restart
./stop-services.sh
npm run build:all
npm start
```

---

## 🎯 Next Steps

Once services are running:

1. **Test APIs**: http://localhost:5008/api/docs
2. **Connect Flutter**: Change `baseUrl` to `http://localhost:5008/api`
3. **Build more services**: Booking, Payment, etc.

---

## 📊 Current Services

| Service | Port | Status |
|---------|------|--------|
| API Gateway | 5008 | ✅ Ready |
| User Service | 3001 | ✅ Ready |
| Charter Service | 3004 | ✅ Ready |
| Booking Service | 3002 | ⚪ Coming Soon |
| Payment Service | 3003 | ⚪ Coming Soon |
| Communication | 3005 | ⚪ Coming Soon |
| Location Service | 3006 | ⚪ Coming Soon |

---

**Ready to test?** Just run:

```bash
npm start
```

Then visit: **http://localhost:5008/api/docs** 🎉

