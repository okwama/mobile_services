# Air Charters API - Quick Reference

## Authentication

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {...}
}
```

### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer {{refresh_token}}

Response:
{
  "accessToken": "eyJhbGci..."
}
```

---

## Charters

### Search Charter Deals
```
GET /api/charters/search
  ?departure=New York
  &arrival=Miami
  &date=2024-07-15
  &passengers=4

Response:
{
  "data": [
    {
      "id": "charter-123",
      "airline": "Elite Air",
      "price": 5000,
      "departure": "2024-07-15T08:00:00Z",
      "arrival": "2024-07-15T10:30:00Z",
      "capacity": 8
    }
  ],
  "total": 42
}
```

### Create Charter Booking
```
POST /api/charters/book
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "charterId": "charter-123",
  "numberOfPassengers": 4,
  "departureDate": "2024-07-15",
  "returnDate": "2024-07-18",
  "specialRequests": "Catering required"
}

Response:
{
  "id": "booking-789",
  "status": "pending",
  "totalPrice": 5000,
  "createdAt": "2024-07-01T12:00:00Z"
}
```

---

## Bookings

### Get All Bookings
```
GET /api/bookings
  ?page=1
  &limit=20
  &status=confirmed
Authorization: Bearer {{access_token}}

Response:
{
  "data": [
    {
      "id": "booking-123",
      "service": "charter",
      "status": "confirmed",
      "totalPrice": 5000,
      "startDate": "2024-07-15",
      "endDate": "2024-07-18"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

### Create Booking
```
POST /api/bookings
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "serviceType": "charter",
  "serviceId": "charter-123",
  "startDate": "2024-07-15",
  "endDate": "2024-07-18",
  "numberOfPassengers": 4,
  "totalPrice": 5000
}

Response:
{
  "id": "booking-456",
  "status": "pending",
  "createdAt": "2024-07-01T12:00:00Z"
}
```

### Cancel Booking
```
DELETE /api/bookings/:bookingId
Authorization: Bearer {{access_token}}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

---

## Payments

### Get Payment Methods
```
GET /api/payments/methods
Authorization: Bearer {{access_token}}

Response:
{
  "data": [
    {
      "id": "method-123",
      "type": "credit_card",
      "cardLast4": "4111",
      "default": true
    }
  ]
}
```

### Add Payment Method
```
POST /api/payments/methods
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "type": "credit_card",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "cardholderName": "John Doe"
}

Response:
{
  "id": "method-456",
  "type": "credit_card",
  "cardLast4": "1111"
}
```

### Process Payment
```
POST /api/payments/process
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookingId": "booking-123",
  "paymentMethodId": "method-456",
  "amount": 5000,
  "currency": "USD",
  "description": "Charter booking payment"
}

Response:
{
  "id": "payment-789",
  "status": "completed",
  "transactionId": "txn_abc123",
  "amount": 5000
}
```

### Refund Payment
```
POST /api/payments/refund
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "paymentId": "payment-789",
  "reason": "Booking cancelled",
  "refundAmount": 5000
}

Response:
{
  "id": "refund-123",
  "status": "processed",
  "amount": 5000,
  "createdAt": "2024-07-02T12:00:00Z"
}
```

---

## Yachts

### Search Yachts
```
GET /api/yachts/search
  ?location=Miami
  &date=2024-07-15
  &passengers=6

Response:
{
  "data": [
    {
      "id": "yacht-123",
      "name": "Luxury Yacht",
      "capacity": 8,
      "pricePerDay": 2000,
      "location": "Miami",
      "amenities": ["Pool", "Jacuzzi", "Dining"]
    }
  ],
  "total": 15
}
```

### Check Yacht Availability
```
GET /api/yachts/:yachtId/availability
  ?startDate=2024-07-15
  &endDate=2024-07-18
Authorization: Bearer {{access_token}}

Response:
{
  "yachtId": "yacht-123",
  "startDate": "2024-07-15",
  "endDate": "2024-07-18",
  "available": true,
  "pricePerDay": 2000,
  "totalPrice": 6000
}
```

### Book Yacht
```
POST /api/yachts/book
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "yachtId": "yacht-123",
  "startDate": "2024-07-15",
  "endDate": "2024-07-18",
  "numberOfGuests": 6,
  "specialRequests": "Chef required"
}

Response:
{
  "id": "booking-999",
  "status": "pending",
  "totalPrice": 6000,
  "confirmationNumber": "YACHT-20240715-001"
}
```

---

## Users

### Get Profile
```
GET /api/users/profile
Authorization: Bearer {{access_token}}

Response:
{
  "id": "user-123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "https://...",
  "role": "passenger"
}
```

### Update Profile
```
PUT /api/users/profile
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "avatar": "https://...",
  "preferences": {
    "newsletter": true,
    "notifications": true
  }
}

Response:
{
  "id": "user-123",
  "firstName": "John",
  "lastName": "Doe",
  "updatedAt": "2024-07-02T12:00:00Z"
}
```

### Change Password
```
POST /api/users/change-password
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "oldPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Locations

### Search Locations
```
GET /api/locations/search
  ?query=miami
  &type=airport

Response:
{
  "data": [
    {
      "id": "loc-123",
      "name": "Miami International Airport",
      "code": "MIA",
      "type": "airport",
      "latitude": 25.7959,
      "longitude": -80.2870
    }
  ]
}
```

### Geocode Address
```
GET /api/locations/geocode
  ?address=123 Main St, Miami, FL

Response:
{
  "address": "123 Main St, Miami, FL",
  "latitude": 25.7617,
  "longitude": -80.1918,
  "formattedAddress": "123 Main Street, Miami, Florida 33101"
}
```

### Get Nearby Airports
```
GET /api/locations/airports
  ?latitude=25.7617
  &longitude=-80.1918
  &radius=50

Response:
{
  "data": [
    {
      "id": "loc-456",
      "name": "Miami International Airport",
      "code": "MIA",
      "distance": 5.2,
      "latitude": 25.7959,
      "longitude": -80.2870
    }
  ]
}
```

---

## Notifications

### Get Notifications
```
GET /api/notifications
  ?page=1
  &limit=20
Authorization: Bearer {{access_token}}

Response:
{
  "data": [
    {
      "id": "notif-123",
      "type": "booking_confirmed",
      "title": "Booking Confirmed",
      "body": "Your charter booking is confirmed",
      "read": false,
      "createdAt": "2024-07-02T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1
  }
}
```

### Mark as Read
```
PUT /api/notifications/:notificationId/read
Authorization: Bearer {{access_token}}

Response:
{
  "id": "notif-123",
  "read": true
}
```

### Send Email
```
POST /api/communications/email
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Booking Confirmation",
  "body": "Your booking has been confirmed",
  "templateId": "booking-confirmation"
}

Response:
{
  "success": true,
  "messageId": "msg-789"
}
```

---

## Health & System

### API Gateway Health
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2024-07-02T12:00:00Z",
  "service": "API Gateway",
  "version": "1.0.0"
}
```

### All Services Health
```
GET /api/health/all

Response:
{
  "overall": "healthy",
  "timestamp": "2024-07-02T12:00:00Z",
  "healthyServices": 10,
  "totalServices": 10,
  "services": [
    {
      "service": "api-gateway",
      "status": "healthy",
      "responseTime": "2ms"
    },
    {
      "service": "user-service",
      "status": "healthy",
      "responseTime": "15ms"
    }
  ]
}
```

### Single Service Health
```
GET /api/health/service/user-service

Response:
{
  "service": "user-service",
  "status": "healthy",
  "port": 4001,
  "responseTime": "12ms"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Need authentication |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

---

## Environment Variables

```
{{base_url}}              - http://localhost:5007 (local) or https://gateway.aircharterss.com (prod)
{{access_token}}          - JWT token (auto-filled after login)
{{refresh_token}}         - Refresh token (auto-filled after login)
{{test_user_email}}       - test@example.com
{{test_user_password}}    - TestPassword123!
```

---

**For detailed documentation, see POSTMAN_COLLECTION_GUIDE.md**
