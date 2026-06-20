# Air Charters Microservices - Postman Collection

A comprehensive Postman collection for testing and integrating with the Air Charters microservices platform.

## 📦 Files Included

- **Air_Charters_Microservices.postman_collection.json** - Main collection with 100+ endpoints
- **Air_Charters_Local.postman_environment.json** - Local development environment (localhost)
- **Air_Charters_Production.postman_environment.json** - Production environment (https://gateway.aircharterss.com)

## 🚀 Quick Start

### 1. Import into Postman

1. Open **Postman** (download from https://www.postman.com/downloads/)
2. Click **Import** in the top-left corner
3. Select **Upload Files** and choose `Air_Charters_Microservices.postman_collection.json`
4. Import both environment files:
   - `Air_Charters_Local.postman_environment.json`
   - `Air_Charters_Production.postman_environment.json`

### 2. Select Environment

1. In Postman, click the **Environment** dropdown (top-right)
2. Choose:
   - **Air Charters - Local Development** for local testing
   - **Air Charters - Production** for production

### 3. Authenticate

All endpoints requiring authentication use the `{{access_token}}` variable.

**To login:**

1. Navigate to **🔐 Authentication → Login**
2. Enter your email and password
3. Send the request
4. The token is **automatically saved** to the environment

For local testing:
- Use the test credentials in the environment variables, or
- Register a new user via **🔐 Authentication → Register User**

## 📚 Collection Structure

### 🔐 Authentication (5 endpoints)
- Register User
- Login (auto-saves token)
- Refresh Token
- Google OAuth Login
- Logout

### 👤 User Management (6 endpoints)
- Get Current User Profile
- Update User Profile
- Get User by ID
- Change Password
- Request Password Reset
- List All Users (Admin)

### 🛫 Charters & Deals (8 endpoints)
- Search Charter Deals
- Get Charter Details
- Get All Charter Deals
- Get Charter Deal Details
- Create Charter Booking
- List Aircraft
- Get Aircraft Details

### 🚤 Yacht Services (5 endpoints)
- Search Yachts
- Get All Yachts
- Get Yacht Details
- Check Yacht Availability
- Book Yacht

### 🎯 Experiences & Activities (4 endpoints)
- Get All Experiences
- Search Experiences
- Get Experience Details
- Book Experience

### 📅 Bookings & Reservations (7 endpoints)
- Get All Bookings
- Get Booking Details
- Create Booking
- Update Booking
- Cancel Booking
- Get Booking Timeline

### 💳 Payments (6 endpoints)
- Get Payment Methods
- Add Payment Method
- Process Payment
- Get Payment History
- Get Payment Details
- Refund Payment

### 🛂 Passengers (4 endpoints)
- Get All Passengers
- Get Passenger Details
- Add Passenger
- Update Passenger

### 💰 Wallet & Balance (3 endpoints)
- Get Wallet Balance
- Add Funds to Wallet
- Get Wallet Transactions

### 📍 Locations & Search (3 endpoints)
- Search Locations
- Geocode Address
- Get Nearby Airports

### 🔔 Notifications & Communication (4 endpoints)
- Get Notifications
- Mark Notification as Read
- Send Email
- Send SMS

### 📱 Push Notifications & Devices (2 endpoints)
- Register Device
- Send Push Notification

### 🏥 Health & System (4 endpoints)
- API Gateway Health
- All Services Health
- Single Service Health
- Health Dashboard

## 🔑 Using Variables

The collection uses variables for flexibility across environments:

```
{{base_url}}           - API gateway base URL
{{access_token}}       - JWT token (auto-filled after login)
{{refresh_token}}      - Refresh token (auto-filled after login)
{{api_gateway_port}}   - API Gateway port
{{test_user_email}}    - Test user email
{{test_user_password}} - Test user password
```

### Change a Variable

1. Click the **Environment** dropdown
2. Select **Edit** on the right
3. Modify any variable values
4. Click **Save**

## 🧪 Testing Workflows

### Workflow 1: User Registration & Authentication

```
1. Register User → 🔐 Authentication → Register User
2. Login → 🔐 Authentication → Login (saves token automatically)
3. Get Profile → 👤 User Management → Get Current User Profile
```

### Workflow 2: Create a Charter Booking

```
1. Login (if not already)
2. Search Charters → 🛫 Charters & Deals → Search Charter Deals
3. Get Details → 🛫 Charters & Deals → Get Charter Details
4. Create Booking → 🛫 Charters & Deals → Create Charter Booking
5. View Booking → 📅 Bookings & Reservations → Get Booking Details
```

### Workflow 3: Process a Payment

```
1. Create Booking (as above)
2. Add Payment Method → 💳 Payments → Add Payment Method
3. Process Payment → 💳 Payments → Process Payment
4. View Transaction → 💳 Payments → Get Payment Details
```

### Workflow 4: Check System Health

```
1. Health Check → 🏥 Health & System → API Gateway Health
2. All Services → 🏥 Health & System → All Services Health
3. View Dashboard → 🏥 Health & System → Health Dashboard (opens HTML dashboard)
```

## 📝 Request Body Examples

All endpoints include example request bodies. Modify them based on your data:

### Charter Booking Example
```json
{
  "charterId": "charter-123",
  "passengerId": "passenger-456",
  "numberOfPassengers": 4,
  "departureDate": "2024-07-15",
  "returnDate": "2024-07-18",
  "specialRequests": "Catering required"
}
```

### Payment Processing Example
```json
{
  "bookingId": "booking-123",
  "paymentMethodId": "method-456",
  "amount": 5000,
  "currency": "USD",
  "description": "Charter booking payment"
}
```

## 🔐 Authentication Guide

### JWT Token Flow

1. **Register or Login** → Receive `accessToken` and `refreshToken`
2. **Automatic Save** → Token saved to `{{access_token}}` variable
3. **Use Token** → All subsequent requests include `Authorization: Bearer {{access_token}}`
4. **Token Expires** → When expired, use **Refresh Token** endpoint
5. **Logout** → Optional, clears session on server

### Setting Manual Token

If you have a token from another source:

1. Open **Environment**
2. Find `access_token` variable
3. Paste your token value
4. Save

## 🛠️ Tips & Tricks

### 1. Bulk Operations
- Use **Collections Runner** to run multiple requests sequentially
- Click **Runner** button, select collection, and run

### 2. Save Response Data
- Click **Tests** tab in any request
- Add test scripts to extract and save data
- Example: Auto-save booking ID after creation

### 3. Pre-request Scripts
- Manipulate data before sending
- Generate timestamps or random values
- Add custom headers

### 4. Response Validation
- Use the **Tests** tab to validate responses
- Set expectations for status codes, response bodies
- Monitor test results

### 5. Export Results
- After running tests, export results as CSV or JSON
- Use for documentation or analysis

## 🐛 Troubleshooting

### Token Not Saved
- Ensure the **Tests** script in Login request is enabled
- Check if the response includes `accessToken`
- Manually paste token if needed

### 401 Unauthorized
- Token may be expired → Use **Refresh Token** endpoint
- Token invalid → Re-login with **Login** endpoint
- Check environment has correct token

### 404 Not Found
- Verify endpoint path and method (GET, POST, etc.)
- Check for typos in path parameters (`:userId`, `:bookingId`, etc.)
- Ensure base_url is correct for your environment

### 500 Server Error
- Check microservice is running via **Health Dashboard**
- Review service logs for detailed error
- Verify request body matches expected format

## 📡 Service Ports (Local Development)

| Service | Port |
|---------|------|
| API Gateway | 5007 |
| User Service | 4001 |
| Booking Service | 4002 |
| Payment Service | 4003 |
| Charter Service | 4004 |
| Communication Service | 4005 |
| Location Service | 4006 |
| Yacht Service | 4007 |
| Experience Service | 4008 |
| Direct Charter Service | 3009 |

## 📚 API Documentation

For detailed API documentation, see:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [QUICK_START.md](./docs/guides/QUICK_START.md)

## 🔄 Updating the Collection

When endpoints change:

1. Update the collection JSON manually, or
2. Re-export from Postman after making changes
3. Commit changes to version control

## 📧 Support

For issues or questions:
- Check service health: **🏥 Health & System → Health Dashboard**
- Review PM2 logs: `pm2 logs`
- Check service status: `pm2 status`

## 📄 License

© 2024 Air Charters. All rights reserved.

---

**Happy Testing! 🚀**
