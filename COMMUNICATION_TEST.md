# 📧 Communication Service Testing

## 🧪 Test Commands

### **1. Test SMS (Infobip)**
```bash
curl -X POST http://localhost:5008/api/communication/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254706166875"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "code": "123456"
}
```

---

### **2. Test Email (Mailtrap/Infobip)**
```bash
curl -X POST http://localhost:5008/api/communication/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "bennjiokwama@gmail.com",
    "subject": "Test Email from Microservices",
    "html": "<h1>Hello from Air Charters Microservices!</h1><p>This is a test email.</p>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "messageId": "abc123..."
}
```

---

### **3. Test Password Reset Email**
```bash
curl -X POST http://localhost:5008/api/communication/send-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "to": "bennjiokwama@gmail.com",
    "code": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## 📝 Check Your Email/SMS

### **Email (Mailtrap):**
- Login to Mailtrap: https://mailtrap.io
- Check inbox for test emails

### **SMS (Infobip):**
- Check your phone for SMS
- Or check Infobip logs: https://portal.infobip.com

---

## 🐛 Troubleshooting

### **"SMS service not configured"**
Add to `.env`:
```
INFOBIP_API_KEY=55f02fda0540db7a8f066048d30395e9-d65bd564-04c4-4d61-80e2-9c6092e9d447
INFOBIP_BASE_URL=https://rpdjky.api.infobip.com
```

### **"Email service disabled"**
Add to `.env`:
```
MAILTRAP_API_KEY=e1b244e980155f5ae701854c145f8c9d
```

### **"Connection timeout"**
- Ensure Communication Service is running
- Check Redis is running: `redis-cli ping`

---

**Ready to test!** Run the curl commands above. 🚀

