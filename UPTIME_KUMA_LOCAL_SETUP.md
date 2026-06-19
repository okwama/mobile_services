# 📊 Uptime Kuma - Local Monitoring Setup

## ✅ **Installation Complete!**

Uptime Kuma is now installed at:
```
/Users/citlogistics/Desktop/Flutter Projects/Members/sp/uptime-kuma
```

---

## 🚀 **How to Use:**

### **Step 1: Start Your Microservices**
```bash
cd /Users/citlogistics/Desktop/Flutter\ Projects/Members/sp/air_services
npm start
```

Wait for all 9 services to start (20-30 seconds)

---

### **Step 2: Start Uptime Kuma**
```bash
cd /Users/citlogistics/Desktop/Flutter\ Projects/Members/sp/uptime-kuma
npm run start-server
```

**Access Dashboard:**
```
🌐 Open in browser: http://localhost:3001
```

---

### **Step 3: First Time Setup (1 minute)**

1. **Create Admin Account:**
   - Username: admin
   - Password: (choose secure password)

2. **Add First Monitor:**
   - Click "+ Add New Monitor"
   - Monitor Type: HTTP(s)
   - Friendly Name: "Air Charters Microservices"
   - URL: `http://localhost:5008/api/health/all`
   - Heartbeat Interval: 60 seconds
   - Click "Save"

3. **See Real-Time Status:**
   - Green = All services healthy
   - Red = Services down
   - Response time graphs
   - Uptime percentage

---

## 📊 **What to Monitor:**

### **Option A: Monitor Aggregated Health (Recommended)**
```
URL: http://localhost:5008/api/health/all
Checks: All 9 services at once
```

### **Option B: Monitor Individual Services**
```
User Service: http://localhost:3001 (Redis - can't monitor directly)
Charter Service: http://localhost:3004 (Redis - can't monitor directly)
API Gateway: http://localhost:5008/api/health ✅ Can monitor
Built-in Dashboard: http://localhost:5008/api/health/dashboard ✅ Can monitor
```

**Best Approach:** Monitor the aggregated endpoint `/api/health/all`

---

## 🎯 **What You'll See:**

### **Uptime Kuma Dashboard:**
```
┌─────────────────────────────────────────┐
│ Air Charters Microservices              │
│ ✅ Up (99.9%)                           │
│ Response Time: 245ms                    │
│ Last checked: 2 seconds ago             │
│                                         │
│ [Graph showing response time over time] │
│ [Graph showing uptime percentage]       │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Real-time status
- ✅ Response time graphs (24h, 7d, 30d, 90d)
- ✅ Uptime percentage
- ✅ Downtime alerts
- ✅ Certificate monitoring (SSL)
- ✅ Ping monitoring
- ✅ Port monitoring

---

## 🔔 **Setup Notifications (Optional):**

### **Email Alerts:**
1. Settings → Notifications
2. Setup Type: Email (SMTP)
3. Add your email
4. Test notification
5. Get alerts when services go down!

### **Telegram Alerts:**
1. Create Telegram bot
2. Add bot token to Kuma
3. Get instant alerts on your phone!

---

## 🎨 **Create Public Status Page (Optional):**

```
Status Page → Create New
Public URL: http://localhost:3001/status/aircharters

Shows users:
✅ All Systems Operational
⚠️ Partial Outage
❌ Major Outage
```

**Perfect for showing customers your service status!**

---

## 🔄 **Daily Workflow:**

### **Morning:**
```bash
# Terminal 1: Start microservices
cd air_services
npm start

# Terminal 2: Start Uptime Kuma
cd uptime-kuma
npm run start-server

# Browser:
http://localhost:3001  → Uptime Kuma Dashboard
http://localhost:5008/api/health/dashboard → Built-in Dashboard
```

### **During Development:**
- Kuma shows you if a service crashes
- See response time spikes
- Monitor while you code

---

## 📱 **Two Dashboards Available:**

| Dashboard | URL | Best For |
|-----------|-----|----------|
| **Built-in** | http://localhost:5008/api/health/dashboard | Quick glance, auto-refresh |
| **Uptime Kuma** | http://localhost:3001 | Detailed monitoring, history, alerts |

**Use both!** They complement each other.

---

## 🎯 **Summary:**

✅ **Uptime Kuma installed locally**  
✅ **Access at:** http://localhost:3001  
✅ **Monitor:** http://localhost:5008/api/health/all  
✅ **Works on Mac** (development)  
✅ **Also works on Ubuntu droplet** (production later)  

---

## 🚀 **Next Steps:**

1. Open http://localhost:3001
2. Create admin account
3. Add monitor for `/api/health/all`
4. Watch all 9 services in beautiful UI!

**Uptime Kuma is now starting...** Check http://localhost:3001 in a few seconds! 🎉

