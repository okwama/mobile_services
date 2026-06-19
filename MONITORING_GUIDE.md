# 📊 Microservices Monitoring Guide

## 🎯 **How to View Service Status:**

### **Option 1: Beautiful HTML Dashboard** (Recommended)
```
Open in browser:
http://localhost:5008/api/health/dashboard
```

**Features:**
- ✅ Auto-refreshes every 5 seconds
- ✅ Shows all 9 services status
- ✅ Response times for each service
- ✅ Database connection status
- ✅ Memory usage
- ✅ Service uptime
- ✅ Color-coded (Green=healthy, Red=unhealthy)

**What You'll See:**
```
🚀 Air Charters Microservices Dashboard

Overall Status: ✅ Healthy
Services Running: 8/8
Check Duration: 245ms

┌─────────────────────────────┐
│ 👤 user-service             │
│ Status: healthy             │
│ Port: :3001                 │
│ Response: 45ms              │
│ Database: ✅ Connected      │
│ Uptime: 1234s               │
│ Memory: 85MB / 120MB        │
└─────────────────────────────┘
```

---

### **Option 2: JSON API** (For Scripts/Monitoring Tools)
```bash
curl http://localhost:5008/api/health/all
```

**Response:**
```json
{
  "overall": "healthy",
  "totalServices": 8,
  "healthyServices": 8,
  "unhealthyServices": 0,
  "checkDuration": "245ms",
  "services": [
    {
      "service": "user-service",
      "port": 3001,
      "status": "healthy",
      "database": "connected",
      "responseTime": "45ms",
      "uptime": "1234s",
      "memory": {
        "used": "85MB",
        "total": "120MB"
      }
    },
    ...
  ]
}
```

---

### **Option 3: Individual Service Check**
```bash
# Check specific service via gateway
curl http://localhost:5008/api/health
```

---

## 📱 **GUI Monitoring Tools (Optional):**

### **1. Uptime Kuma** (Best for your use case)
**Free, Open Source, Beautiful UI**

```bash
# Install with Docker
docker run -d --restart=always \
  -p 3100:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma \
  louislam/uptime-kuma:1

# Visit: http://localhost:3100
```

**Features:**
- ✅ Monitor all 9 services
- ✅ Email/SMS alerts when service down
- ✅ Status page (public/private)
- ✅ Response time graphs
- ✅ Uptime percentage (99.9%)
- ✅ Beautiful mobile-friendly UI

**Setup (5 minutes):**
1. Open http://localhost:3100
2. Create admin account
3. Add monitors:
   - HTTP: http://localhost:5008/api/health/all
   - Interval: Every 60 seconds
4. Done! Visual dashboard with graphs

---

### **2. Grafana + Prometheus** (Advanced)
**For serious production monitoring**

```yaml
# docker-compose.yml (add to existing)
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  
  grafana:
    image: grafana/grafana
    ports:
      - "3200:3000"
```

**Features:**
- Advanced metrics & graphs
- Custom dashboards
- Alerting rules
- Data retention

**Setup Time:** ~2 hours  
**Recommendation:** Only if you need advanced features

---

### **3. Your Custom Dashboard** (What I Built)
**Simplest - No Installation**

```
http://localhost:5008/api/health/dashboard
```

**Pros:**
- ✅ No installation
- ✅ Built-in
- ✅ Auto-refreshes
- ✅ Works immediately

**Cons:**
- ⚪ No history/graphs
- ⚪ No alerts
- ⚪ Basic features

---

## 🎯 **My Recommendation:**

### **For Now (Development):**
```
✅ Use built-in dashboard:
   http://localhost:5008/api/health/dashboard

✅ Monitor while developing
✅ Check service status during tests
✅ No setup needed
```

### **For Production (Later):**
```
✅ Add Uptime Kuma (5 minutes setup)
   - Beautiful UI
   - Email alerts
   - Status history
   - Free forever
```

### **For Enterprise (Future):**
```
⚪ Grafana + Prometheus
   - Advanced metrics
   - Custom dashboards
   - Only if you need it
```

---

## 📝 **Quick Test:**

```bash
# 1. Start services
npm start

# 2. Open dashboard in browser:
http://localhost:5008/api/health/dashboard

# 3. You'll see all 9 services with:
- Green boxes = healthy
- Red boxes = unhealthy
- Response times
- Memory usage
- Database status
```

**Auto-refreshes every 5 seconds!** 🔄

---

## 🎊 **Summary:**

**✅ I built you:** HTML dashboard at `/api/health/dashboard`  
**✅ JSON API at:** `/api/health/all`  
**✅ Recommendation:** Use built-in dashboard for now, add Uptime Kuma later if needed

**Want me to rebuild all services with health checks now?** 🚀
