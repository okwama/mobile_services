# 🧪 Air Charters Microservices - Testing Guide

**Before continuing to Phase 4, test all current services**

---

## 🚀 Step 1: Start All Services

```bash
cd air_services
npm start
```

**Expected Output:**
```
[USER]     👤 User Service is listening on Redis
[CHARTER]  🚁 Charter Service is listening on Redis
[LOCATION] 📍 Location Service is listening on Redis
[COMMS]    📨 Communication Service is listening on Redis
[GATEWAY]  🚀 API Gateway running on http://localhost:5008
```

---

## ✅ Step 2: Test Each Service

### **Test 1: Health Check**
```bash
curl http://localhost:5008/api/health
```
**Expected:** `{"status":"ok","service":"API Gateway"}`

---

### **Test 2: Login (Critical)**
```bash
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bennjiokwama@gmail.com","password":"password"}'
```

**Expected:** Returns `accessToken`, `refreshToken`, and user object

**Extract User ID from response for next tests**

---

### **Test 3: User Profile**
```bash
# Replace {userId} with actual ID from login response
curl "http://localhost:5008/api/users/profile?userId=user_1752093294468_5lug3jt2p"
```

**Expected:** Returns user object + profile settings

---

### **Test 4: Wallet Balance**
```bash
curl "http://localhost:5008/api/wallet/balance?userId=user_1752093294468_5lug3jt2p"
```

**Expected:** `{"balance":0,"points":0}`

---

### **Test 5: Charter Deals**
```bash
curl "http://localhost:5008/api/charter-deals?page=1&limit=5"
```

**Expected:** Array of deals with company, aircraft, images, amenities

---

### **Test 6: Location Search**
```bash
curl "http://localhost:5008/api/locations/search?query=Nairobi"
```

**Expected:** Array of locations matching "Nairobi"

---

### **Test 7: Get Airports**
```bash
curl "http://localhost:5008/api/locations?type=airport"
```

**Expected:** Array of airports

---

## 🌐 Step 3: Swagger UI Testing

Open in browser:
```
http://localhost:5008/api/docs
```

**Interactive API testing:**
1. Click on any endpoint
2. Click "Try it out"
3. Fill in parameters
4. Click "Execute"
5. See response

---

## 📊 Step 4: Verify Terminal Logs

### **Look for:**

✅ **Success Indicators:**
- "Connected to Redis"
- "TypeORM database connection"
- "Nest microservice successfully started"
- Query logs showing SELECT statements

❌ **Error Indicators:**
- "ECONNREFUSED" (Redis not running)
- "EntityMetadataNotFoundError" (Entity not registered)
- "Unknown column" (Schema mismatch)
- "Connection timeout" (Database unreachable)

---

## 🔍 Step 5: Test User Registration

```bash
curl -X POST http://localhost:5008/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+254700123456",
    "countryCode": "+254"
  }'
```

**Expected:** New user created, returns JWT tokens

**Verify in DB:**
```sql
SELECT * FROM users WHERE email = 'newuser@test.com';
```

---

## 🧪 Step 6: Test Error Handling

### **Invalid Login:**
```bash
curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}'
```

**Expected:** `{"statusCode":401,"message":"Invalid email or password"}`

---

### **Non-existent User:**
```bash
curl "http://localhost:5008/api/users/profile?userId=invalid_id"
```

**Expected:** `{"statusCode":404,"message":"User not found"}`

---

## 📱 Step 7: Connect Flutter App (Optional)

### **Update Flutter config:**
```dart
// lib/config/config.dart
static const String baseUrl = 'http://localhost:5008/api';
```

### **Test from Flutter:**
1. Login screen
2. Profile screen
3. Charter deals list
4. Location search

---

## 📋 Testing Checklist

### **User Service:**
- [ ] Login works
- [ ] Register works
- [ ] Profile retrieval works
- [ ] Wallet balance works
- [ ] Password reset code sent

### **Charter Service:**
- [ ] List deals works
- [ ] Get single deal works
- [ ] Filter deals works
- [ ] Aircraft images included
- [ ] Amenities included

### **Location Service:**
- [ ] Search works
- [ ] Filter by type works
- [ ] Returns coordinates

### **Communication Service:**
- [ ] Email service initialized
- [ ] SMS service initialized
- [ ] Can receive events

### **API Gateway:**
- [ ] All routes mapped
- [ ] Swagger docs accessible
- [ ] CORS working
- [ ] Validation working

---

## 🐛 Common Issues & Solutions

### **Issue: "Connection refused" to Redis**
```bash
# Solution:
redis-cli ping
# If fails:
brew services start redis
```

### **Issue: "Unknown column" errors**
```bash
# Solution: Entity field name mismatch
# Check entity vs dbmodel.sql
# Fix field names to match exactly
```

### **Issue: Services won't start**
```bash
# Solution:
./stop-services.sh
npm run build:all
npm start
```

---

## ✅ Success Criteria

**All tests passing = Ready for Phase 4**

When all above tests work:
- ✅ User Service fully functional
- ✅ Charter Service returns data
- ✅ Location Service searchable
- ✅ Communication Service ready
- ✅ No Redis connection errors
- ✅ No database errors
- ✅ Swagger docs working

---

## 🎯 After Testing

**If all tests pass:**
→ Proceed to Phase 4: Booking Service

**If tests fail:**
→ Fix issues first
→ Re-test
→ Then proceed

---

**Ready to test?** Start with `npm start` and work through the checklist! 🚀

