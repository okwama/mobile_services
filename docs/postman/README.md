# Air Charters API - Postman Collection

Production-ready Postman collection targeting `https://gateway.aircharterss.com`.

## 📦 Files

| File | Purpose |
|------|---------|
| `Air_Charters_API.postman_collection.json` | **Main collection** — import this |
| `Air_Charters_Production.postman_environment.json` | Production environment (`gateway.aircharterss.com`) |
| `Air_Charters_Local.postman_environment.json` | Local environment (`localhost:5007`) |

## 🚀 Quick Start

1. Open **Postman** → **Import** → upload `Air_Charters_API.postman_collection.json`
2. Import the environment file you want (Production or Local)
3. Select the environment in the top-right dropdown
4. Run **🔐 Authentication → Login (Email)** — the token is automatically saved
5. All other requests will use `{{access_token}}` automatically

## 🔑 Login

**Email:**
```json
{ "email": "test@example.com", "password": "Test123!@#" }
```

**Phone:**
```json
{ "phoneNumber": "+254706166875", "password": "SecurePassword123!" }
```

After login the test script auto-saves `access_token`, `refresh_token`, and `user_id`.

---

## 📚 Collection Structure

### 🔐 Authentication (6 requests)
- Register User
- Login (Email) — *auto-saves token*
- Login (Phone) — *auto-saves token*
- Login (Phone - Legacy `/api/auth/login/phone`)
- Refresh Token
- Request Password Reset
- Logout

### 👤 User Management (5 requests)
- Get Current User Profile
- Update User Profile
- Get User by ID
- Change Password
- Get Wallet Balance

### 🛫 Charter Deals (3 requests)
- Get All Charter Deals
- Get Charter Deal by ID
- Search Charter Deals

### ✈️ Direct Charter (3 requests)
- Get All Aircraft
- Get Aircraft by ID
- Check Aircraft Availability

### 🎯 Experiences (2 requests)
- Get All Experiences
- Get Experience by ID

### 🚤 Yachts (2 requests)
- Get All Yachts
- Get Yacht by ID

### 📅 Bookings (7 requests)
- **Create Deal Booking** — uses `bookingType: "deal"`, `dealId`
- **Create Direct Charter Booking** — uses `bookingType: "direct"`, `aircraftId` + optional `stops[]`
- **Create Experience Booking** — uses `bookingType: "experience"`, `experienceTemplateId`
- **Create Yacht Booking** — uses `bookingType: "yacht"`, `yachtId`
- Get Booking by ID
- Get My Bookings
- Update Booking Status
- Cancel Booking

### 💳 Payments - Paystack (6 requests)
- **Initialize Paystack Payment** — `POST /api/payments/paystack/initialize` — *auto-saves reference*
- **Verify Paystack Payment** — `GET /api/payments/paystack/verify/:reference`
- Initialize Payment (Legacy `/api/payments/initialize`)
- Verify Payment (Legacy `/api/payments/verify/:reference`)
- Get Payment by ID
- Process Refund

### 📍 Locations (2 requests)
- Search Locations
- Get Airports

### 🏥 Health & System (4 requests)
- API Gateway Health
- All Services Health
- Health Dashboard (HTML)
- Swagger Docs

---

## 🧪 Booking Payload Reference

All 4 booking types share `POST /api/bookings` with bearer auth. The `bookingType` field determines routing.

### Passenger Schema (matches `charter_passengers` table)
```json
{
  "firstName": "string",       // required
  "lastName": "string",        // required
  "age": 30,                   // optional int
  "nationality": "string",     // optional
  "idPassportNumber": "string",// optional
  "isUser": true               // bool — true for the booking user
}
```

### Deal Booking
```json
{
  "bookingType": "deal",
  "dealId": 1,
  "totalPrice": 5000.00,
  "passengers": [{ ... }]
}
```

### Direct Charter Booking
```json
{
  "bookingType": "direct",
  "aircraftId": 1,
  "totalPrice": 12000.00,
  "passengers": [{ ... }],
  "stops": [{ "stopName": "...", "latitude": ..., "longitude": ..., "stopOrder": 1, "locationType": "airstrip" }]
}
```

### Experience Booking
```json
{
  "bookingType": "experience",
  "experienceTemplateId": 1,
  "totalPrice": 800.00,
  "passengers": [{ ... }]
}
```

### Yacht Booking
```json
{
  "bookingType": "yacht",
  "yachtId": 1,
  "totalPrice": 3500.00,
  "passengers": [{ ... }]
}
```

---

## 🔄 Test Workflow: Deal Booking + Payment

```
1. Login (Email)                       → token auto-saved
2. Bookings → Create Deal Booking      → booking_id auto-saved
3. Payments → Initialize Paystack      → paystack_reference auto-saved
4. Payments → Verify Paystack Payment  → check status
5. Bookings → Get Booking by ID       → confirm bookingStatus = "confirmed"
```

---

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| `401 Unauthorized` | Re-run Login — token may be expired (1h TTL) |
| `404 Not Found` | Check `{{deal_id}}`, `{{aircraft_id}}` etc. exist in DB |
| `400 Bad Request` | Check payload matches schema above |
| `500 Server Error` | Run Health → All Services Health to find the failing service |

**Check PM2 logs on server:** `pm2 logs --lines 50`
