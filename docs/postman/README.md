# Air Charters API - Postman Collection

Complete Postman collection for testing the Air Charters microservices API.

## 📦 Files

- **Air_Charters_API.postman_collection.json** - Main API collection (100+ endpoints)
- **Air_Charters_Production.postman_environment.json** - Production environment variables

## 🚀 Quick Start

### 1. Import into Postman

1. Open **Postman** (download: https://www.postman.com/downloads/)
2. Click **Import** → **Upload Files**
3. Select `Air_Charters_API.postman_collection.json`
4. Import the environment: **Air_Charters_Production.postman_environment.json**

### 2. Select Environment

- Click the **Environment** dropdown (top-right)
- Select **Air Charters - Production**

### 3. Login

Go to **🔐 Authentication → Login** and send with either:

**Email Login:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Phone Login:**
```json
{
  "phoneNumber": "+254706166875",
  "password": "SecurePassword123!"
}
```

Token automatically saves to `{{access_token}}` and `{{refresh_token}}` variables.

> **Backward Compatibility:** Existing apps using `/api/auth/login/phone` continue to work unchanged.

## 📚 API Endpoints

The collection includes 13 sections with 100+ endpoints:

- 🔐 **Authentication** (7 endpoints)
- 👤 **User Management** (5 endpoints)
- 🛫 **Charters & Aircraft** (6 endpoints)
- 🚤 **Yachts** (5 endpoints)
- 🎯 **Experiences** (4 endpoints)
- 📅 **Bookings** (7 endpoints)
- 💳 **Payments** (6 endpoints)
- 💰 **Wallet** (3 endpoints)
- 🛂 **Passengers** (4 endpoints)
- 📍 **Locations** (3 endpoints)
- 🔔 **Notifications & Communication** (5 endpoints)
- 📱 **Devices** (2 endpoints)
- 🏥 **Health & System** (4 endpoints)

## 🔑 Authentication

### Login Endpoints

The system supports **two ways to login** using a unified or legacy endpoint:

**Option 1: Unified Endpoint (Recommended)**
```
POST /api/auth/login

// Email:
{ "email": "user@example.com", "password": "..." }

// OR Phone:
{ "phoneNumber": "+254706166875", "password": "..." }
```

**Option 2: Phone Endpoint (Backward Compatible)**
```
POST /api/auth/login/phone
{ "phoneNumber": "+254706166875", "password": "..." }
```

Both endpoints return the same response with tokens.

### Token Management

Tokens are automatically saved after login:
- `{{access_token}}` - JWT token for API requests (expires in 1 hour)
- `{{refresh_token}}` - Token to get new access token

**Refresh expired token:**
```
POST /api/auth/refresh
{ "refreshToken": "{{refresh_token}}" }
```

## 🧪 Testing Workflows

### Workflow 1: Register & Login
```
1. Register → 🔐 Authentication → Register User
2. Login → 🔐 Authentication → Login (token auto-saves)
3. Get Profile → 👤 User Management → Get Current User Profile
```

### Workflow 2: Book a Charter
```
1. Login (get token)
2. Search → 🛫 Charters → Search Charter Deals
3. Book → 🛫 Charters → Create Charter Booking
4. View → 📅 Bookings → Get Booking Details
```

### Workflow 3: Process Payment
```
1. Create booking (above)
2. Add Method → 💳 Payments → Add Payment Method
3. Process → 💳 Payments → Process Payment
4. History → 💳 Payments → Get Payment History
```

## 🔄 Environment Variables

Update these in the environment:

| Variable | Value |
|----------|-------|
| `base_url` | https://gateway.aircharterss.com |
| `access_token` | (auto-filled after login) |
| `refresh_token` | (auto-filled after login) |
| `test_user_email` | test@aircharterss.com |
| `test_user_phone` | +254706166875 |
| `test_user_password` | (set your password) |

## 📝 Request Format

All authenticated requests automatically include:
```
Authorization: Bearer {{access_token}}
```

All requests use:
```
Content-Type: application/json
```

## ⚡ Tips

### Auto-Save Tokens
The **Login** endpoint has a test script that auto-saves the token. Just send the login request and tokens are immediately available for other requests.

### Test Multiple Users
Update `test_user_email` and `test_user_password` in the environment to test with different accounts.

### Check Service Health
Before testing:
```
GET /api/health/all
```

All services should return `"status": "healthy"`.

### View Live Dashboard
```
GET /api/health/dashboard
```

Opens an HTML dashboard showing real-time service status.

## 🐛 Troubleshooting

**401 Unauthorized**
- Token expired → Use **Refresh Token** endpoint
- Token invalid → Re-login with **Login** endpoint
- Check environment has correct token

**404 Not Found**
- Verify path parameters (`:bookingId`, `:userId`, etc.)
- Check for typos in endpoint path
- Ensure using correct base_url

**500 Server Error**
- Check service health: `GET /api/health/all`
- Verify request body matches expected format
- Check PM2 logs: `pm2 logs`

## 📄 Documentation

- See [API_QUICK_REFERENCE.md](../../API_QUICK_REFERENCE.md) for quick reference
- See [POSTMAN_COLLECTION_GUIDE.md](../../POSTMAN_COLLECTION_GUIDE.md) for detailed guide

---

**Ready to test! Import the collection and start exploring the API.** 🚀
