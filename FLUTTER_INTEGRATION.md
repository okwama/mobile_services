# 📱 Flutter App Integration with Microservices

## ✅ **Changes Made to Flutter App:**

### **Updated: `air_charters/lib/config/env/app_config.dart`**

---

## 🔄 **What Changed:**

### **1. Base URL (CRITICAL)**
```dart
// OLD (Monolith):
backendUrl = 'http://157.245.105.6:3000';

// NEW (Microservices):
backendUrl = 'http://localhost:5008';  // Local testing
// backendUrl = 'http://157.245.105.6:5008';  // Production
```

### **2. Payment Endpoints**
```dart
// OLD:
paystackInitializeEndpoint = '/api/payments/paystack/initialize';
paystackVerifyEndpoint = '/api/payments/paystack/verify';

// NEW (Simplified):
paystackInitializeEndpoint = '/api/payments/initialize';
paystackVerifyEndpoint = '/api/payments/verify';
```

### **3. SMS Endpoints**
```dart
// OLD:
sendSmsVerificationEndpoint = '/api/sms/send-verification';

// NEW:
sendSmsVerificationEndpoint = '/api/communication/send-sms';
```

---

## 🎯 **Flutter → Microservices Flow:**

```
Flutter App
    ↓ HTTP Request
API Gateway (localhost:5008)
    ↓ Redis Message
Appropriate Service
    ↓ Database Query
MySQL (138.68.230.22)
    ↓ Response
API Gateway
    ↓ HTTP Response
Flutter App
```

**Example - User Login:**
```
1. Flutter: POST http://localhost:5008/api/auth/login
2. API Gateway receives HTTP
3. Gateway sends Redis message to User Service
4. User Service queries database
5. User Service returns JWT to Gateway
6. Gateway returns HTTP response to Flutter
7. Flutter saves JWT token
```

---

## 📊 **Endpoint Mapping:**

### **✅ Authentication (No Changes Needed)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `POST /api/auth/login` | → `USER_SERVICE` | User Service |
| `POST /api/auth/register` | → `USER_SERVICE` | User Service |
| `POST /api/auth/refresh` | → `USER_SERVICE` | User Service |
| `POST /api/auth/forgot-password` | → `USER_SERVICE` | User Service |

### **✅ Experiences (No Changes Needed)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `GET /api/experiences` | → `EXPERIENCE_SERVICE` | Experience Service |
| `GET /api/experiences/:id` | → `EXPERIENCE_SERVICE` | Experience Service |
| `GET /api/experiences/:id/schedules` | → `EXPERIENCE_SERVICE` | Experience Service |

### **⚠️ Payments (UPDATED)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `POST /api/payments/initialize` | → `PAYMENT_SERVICE` | Payment Service |
| `GET /api/payments/verify/:ref` | → `PAYMENT_SERVICE` | Payment Service |
| `POST /api/payments/webhook/paystack` | → `PAYMENT_SERVICE` | Payment Service |

### **⚠️ Communication (UPDATED)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `POST /api/communication/send-sms` | → `COMMUNICATION_SERVICE` | Communication Service |
| `POST /api/communication/send-email` | → `COMMUNICATION_SERVICE` | Communication Service |

### **✅ Charter Deals (No Changes)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `GET /api/charter-deals` | → `CHARTER_SERVICE` | Charter Service |
| `GET /api/charter-deals/:id` | → `CHARTER_SERVICE` | Charter Service |

### **✅ Yachts (NEW)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `GET /api/yachts` | → `YACHT_SERVICE` | Yacht Service |
| `GET /api/yachts/:id` | → `YACHT_SERVICE` | Yacht Service |

### **✅ Bookings (NEW)**
| Flutter Calls | API Gateway Routes To | Service |
|---------------|----------------------|---------|
| `POST /api/bookings` | → `BOOKING_SERVICE` | Booking Service |
| `GET /api/bookings?userId=X` | → `BOOKING_SERVICE` | Booking Service |

---

## 🚀 **Testing Flutter with Microservices:**

### **Step 1: Start Microservices**
```bash
cd air_services
npm start

# Wait for all services to start (30 seconds)
```

### **Step 2: Verify API Gateway**
```bash
curl http://localhost:5008/api/health
# Should return: {"status":"ok"}
```

### **Step 3: Run Flutter App**
```bash
cd air_charters
flutter run
```

### **Step 4: Test Login**
```
Email: bennjiokwama@gmail.com
Password: password

Expected: ✅ Login successful
```

---

## 🔒 **Security:**

### **API Gateway handles:**
- ✅ CORS (Cross-Origin Resource Sharing)
- ✅ Rate limiting
- ✅ JWT validation
- ✅ Request validation
- ✅ Error handling

### **Individual Services:**
- ⚪ NO HTTP endpoints
- ⚪ NO CORS
- ⚪ NO public access
- ⚪ Only Redis communication

---

## 📝 **Environment Switching:**

### **Local Development:**
```dart
backendUrl = 'http://localhost:5008';
```

### **Production:**
```dart
backendUrl = 'http://157.245.105.6:5008';
// OR
backendUrl = 'https://api.aircharters.com';
```

### **Testing with Monolith (Fallback):**
```dart
backendUrl = 'http://157.245.105.6:3000';
```

---

## 🎯 **Summary:**

### **What Was Updated:**
1. ✅ Base URL: `3000` → `5008`
2. ✅ Payment endpoints: Simplified paths
3. ✅ SMS endpoints: `/api/sms` → `/api/communication`

### **What Stayed Same:**
- ✅ Auth endpoints (login, register, etc.)
- ✅ Experience endpoints
- ✅ All other endpoints

### **Architecture:**
```
Flutter ONLY talks to API Gateway (:5008)
API Gateway routes to services via Redis
Services are internal (not exposed to Flutter)
```

---

## 🧪 **Quick Test:**

```bash
# 1. Start microservices
cd air_services
npm start

# 2. In Flutter, change base URL to:
backendUrl = 'http://localhost:5008'

# 3. Run Flutter app:
cd air_charters
flutter run

# 4. Test:
- Login ✅
- Browse charter deals ✅
- Browse experiences ✅
- Browse yachts ✅
- Create booking ✅
- Pay with Paystack ✅
```

---

## 🎊 **Flutter App is Now Connected to Microservices!**

**No UI changes needed** - just backend URL changed from port 3000 → 5008! 🚀

