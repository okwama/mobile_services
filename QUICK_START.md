# 🚀 Quick Start - Testing Your Microservices

## ✅ What's Ready

1. **User Service** - Auth, Users, Passengers, Wallet
2. **Charter Service** - Charter deals
3. **API Gateway** - HTTP interface (NEW!)

---

## 📝 Step-by-Step Testing

### **Step 1: Create `.env` File**

```bash
cd air_services
nano .env
```

Paste this (with YOUR database credentials from `air_backend/.env`):

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
REDIS_PASSWORD=

# JWT
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRATION=7d

# API Gateway
API_GATEWAY_PORT=5008
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

---

### **Step 2: Start Redis**

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
redis-server
```

Expected: `PONG` ✅

---

### **Step 3: Start Services**

Open **3 separate terminals**:

**Terminal 1 - User Service:**
```bash
cd air_services
npm run start:user-service
```

Expected output:
```
👤 User Service is listening on Redis
📡 Redis: localhost:6379
🗄️  Database: 138.68.230.22:3306/air_charters
🔐 JWT Secret: ***
```

**Terminal 2 - Charter Service:**
```bash
cd air_services
npm run start:charter-service
```

Expected output:
```
🚁 Charter Service is listening on Redis
📡 Redis: localhost:6379
🗄️  Database: 138.68.230.22:3306/air_charters
```

**Terminal 3 - API Gateway:**
```bash
cd air_services
npm run start:api-gateway
```

Expected output:
```
🚀 ====================================
   Air Charters API Gateway
   ====================================
   📡 Server: http://localhost:5008
   📚 Docs:   http://localhost:5008/api/docs
   🔐 Auth:   http://localhost:5008/api/auth
   ====================================
```

---

### **Step 4: Test the API**

#### **Option A: Browser (Swagger Docs)**

Open in browser:
```
http://localhost:5008/api/docs
```

You'll see interactive API documentation! 🎉

#### **Option B: curl**

**Test Health:**
```bash
curl http://localhost:5008/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:5008/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254700000000"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Charter Deals:**
```bash
curl http://localhost:5008/api/charter-deals
```

#### **Option C: Postman**

1. Open Postman
2. Import this collection: `http://localhost:5008/api/docs-json`
3. Test all endpoints visually

---

## 🎯 Available Endpoints

### **Authentication** (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password

### **Users** (`/api/users`)
- `GET /api/users/profile?userId=1` - Get profile
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `GET /api/users?page=1&limit=10` - List users
- `DELETE /api/users/:id` - Delete user

### **Passengers** (`/api/passengers`)
- `GET /api/passengers?userId=1` - Get user's passengers
- `GET /api/passengers/:id` - Get passenger
- `POST /api/passengers` - Create passenger
- `PUT /api/passengers/:id` - Update passenger
- `DELETE /api/passengers/:id` - Delete passenger

### **Wallet** (`/api/wallet`)
- `GET /api/wallet/balance?userId=1` - Get balance
- `GET /api/wallet/transactions?userId=1` - Get transactions
- `POST /api/wallet/add-funds` - Add funds
- `POST /api/wallet/deduct-funds` - Deduct funds

### **Charter Deals** (`/api/charter-deals`)
- `GET /api/charter-deals` - List all deals
- `GET /api/charter-deals/:id` - Get deal
- `POST /api/charter-deals/filter` - Filter deals
- `POST /api/charter-deals/check-availability` - Check availability

---

## 🔍 Architecture Flow

```
Flutter App
    ↓ HTTP
API Gateway (Port 5008)
    ↓ Redis Messages
User Service (Port 3001)
Charter Service (Port 3004)
    ↓
MySQL Database
```

---

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Install Redis
brew install redis

# Start Redis
redis-server
```

### Database Connection Error
- Check `.env` has correct DB credentials
- Verify database is accessible from your machine
- Test with: `mysql -h 138.68.230.22 -u charters_user -p`

### Port Already in Use
```bash
# Find what's using port 5008
lsof -i :5008

# Kill it
kill -9 <PID>
```

---

## 🎉 Success!

If you can:
1. ✅ See all services start without errors
2. ✅ Access Swagger docs at `http://localhost:5008/api/docs`
3. ✅ Register and login a user
4. ✅ Fetch charter deals

**You're ready to integrate with your Flutter app!** 🚀

---

## 🔄 Next: Connect Flutter App

Update your Flutter `config.dart`:

```dart
// From:
static const String baseUrl = 'http://138.68.230.22:5000/api';

// To:
static const String baseUrl = 'http://localhost:5008/api';
```

All existing endpoints will work! The API Gateway routes them to microservices transparently.

---

## 📊 Migration Status

```
✅ Phase 0: Infrastructure (100%)
✅ Phase 1: User Service (100%)
✅ API Gateway (100%)
🟡 Charter Service (40% - Basic functionality)
⚪ Location Service (0%)
⚪ Communication Service (0%)
⚪ Booking Service (0%)
⚪ Payment Service (0%)
```

**Overall: 35% Complete** 🎯

