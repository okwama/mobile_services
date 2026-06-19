# 🚀 Ubuntu Droplet Deployment Guide

## 📋 **Complete Deployment: Microservices + Uptime Kuma**

---

## 🎯 **What You'll Deploy:**

1. ✅ All 10 microservices
2. ✅ Redis
3. ✅ Uptime Kuma (monitoring)
4. ✅ NGINX (reverse proxy)
5. ✅ SSL certificates (Let's Encrypt)
6. ✅ PM2 (process manager)

---

## 💰 **Droplet Requirements:**

**Recommended:**
- **Size:** 2GB RAM / 2 CPUs ($12/month)
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 50GB SSD

**Minimum:**
- 1GB RAM / 1 CPU ($6/month) - Might be slow

---

## 🚀 **Step 1: Create DigitalOcean Droplet**

1. Go to digitalocean.com
2. Create → Droplets
3. Choose:
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($12/month - 2GB RAM)
   - **Datacenter:** Closest to you (e.g., Frankfurt, London)
   - **Authentication:** SSH key (recommended) or password
   - **Hostname:** aircharters-api
4. Click "Create Droplet"
5. Wait 1 minute
6. Copy your droplet IP: `159.89.123.45`

---

## 🌐 **Step 2: Point Domain to Droplet**

**In your domain registrar (Namecheap, GoDaddy, etc.):**

Add these DNS records:
```
Type  | Name     | Value (Droplet IP) | TTL
------+----------+--------------------+------
A     | api      | 159.89.123.45      | 300
A     | monitor  | 159.89.123.45      | 300
```

**Result:**
- `api.aircharters.com` → Your microservices
- `monitor.aircharters.com` → Uptime Kuma

Wait 5-10 minutes for DNS to propagate.

---

## 🔧 **Step 3: Deploy Uptime Kuma**

### **SSH into droplet:**
```bash
ssh root@159.89.123.45
```

### **Upload & run script:**
```bash
# Upload the deploy-uptime-kuma.sh script
# Then run:
chmod +x deploy-uptime-kuma.sh
sudo ./deploy-uptime-kuma.sh monitor.aircharters.com admin@aircharters.com
```

**Wait 3-5 minutes for installation.**

---

## 📦 **Step 4: Deploy Microservices**

### **A. Install Node.js & PM2:**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2
```

### **B. Upload Your Code:**
```bash
# On your Mac:
cd /Users/citlogistics/Desktop/Flutter\ Projects/Members/sp
tar -czf air_services.tar.gz air_services/

# Upload to droplet
scp air_services.tar.gz root@159.89.123.45:/opt/

# On droplet:
cd /opt
tar -xzf air_services.tar.gz
cd air_services
```

### **C. Install Dependencies:**
```bash
npm install --production
npm run build:all
```

### **D. Create PM2 Ecosystem File:**
```bash
cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5008
      }
    },
    {
      name: 'user-service',
      script: 'dist/apps/user-service/main.js',
      instances: 1
    },
    {
      name: 'charter-service',
      script: 'dist/apps/charter-service/main.js',
      instances: 1
    },
    {
      name: 'direct-charter-service',
      script: 'dist/apps/direct-charter-service/main.js',
      instances: 1
    },
    {
      name: 'yacht-service',
      script: 'dist/apps/yacht-service/main.js',
      instances: 1
    },
    {
      name: 'experience-service',
      script: 'dist/apps/experience-service/main.js',
      instances: 1
    },
    {
      name: 'location-service',
      script: 'dist/apps/location-service/main.js',
      instances: 1
    },
    {
      name: 'communication-service',
      script: 'dist/apps/communication-service/main.js',
      instances: 1
    },
    {
      name: 'booking-service',
      script: 'dist/apps/booking-service/main.js',
      instances: 1
    },
    {
      name: 'payment-service',
      script: 'dist/apps/payment-service/main.js',
      instances: 1
    }
  ]
};
EOF
```

### **E. Start All Services:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **F. Configure NGINX for API:**
```bash
cat > /etc/nginx/sites-available/api <<'EOF'
server {
    listen 80;
    server_name api.aircharters.com;

    # API Gateway
    location / {
        proxy_pass http://localhost:5008;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for payment processing
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Add SSL
certbot --nginx -d api.aircharters.com --non-interactive --agree-tos -m admin@aircharters.com
```

### **G. Install Redis:**
```bash
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 🎯 **Step 5: Configure Uptime Kuma to Monitor Production**

1. Visit `https://monitor.aircharters.com`
2. Create admin account
3. Add monitor:
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Air Charters API (Production)
   URL: https://api.aircharters.com/api/health/all
   Heartbeat Interval: 60 seconds
   ```
4. Save

---

## 📊 **Final Architecture:**

```
DigitalOcean Droplet (Ubuntu 22.04)
├── Port 80/443: NGINX
│   ├── monitor.aircharters.com → Uptime Kuma (:3001)
│   └── api.aircharters.com → API Gateway (:5008)
├── PM2 Running:
│   ├── api-gateway :5008
│   ├── user-service :3001
│   ├── charter-service :3004
│   ├── direct-charter-service :3009
│   ├── yacht-service :3007
│   ├── experience-service :3008
│   ├── location-service :3006
│   ├── communication-service :3005
│   ├── booking-service :3002
│   └── payment-service :3003
├── Redis :6379
├── Uptime Kuma (Docker) :3001
└── MySQL: External (138.68.230.22)

Public URLs:
├── https://api.aircharters.com/api/docs (Swagger)
├── https://api.aircharters.com/api/health/all (JSON)
├── https://api.aircharters.com/api/health/dashboard (HTML)
└── https://monitor.aircharters.com (Uptime Kuma)
```

---

## 🔥 **Firewall Configuration:**

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Block direct access to services (only NGINX should access)
# Microservices ports (3001-3008, 5008) not exposed
```

---

## 📝 **Useful Commands on Droplet:**

### **PM2 Commands:**
```bash
pm2 status              # See all services
pm2 logs                # View all logs
pm2 logs api-gateway    # View specific service
pm2 restart all         # Restart all services
pm2 stop all            # Stop all services
pm2 delete all          # Remove all services
pm2 monit               # Real-time monitoring
```

### **Docker Commands (Uptime Kuma):**
```bash
docker ps                      # See running containers
docker logs uptime-kuma        # View logs
docker restart uptime-kuma     # Restart
docker stop uptime-kuma        # Stop
docker rm uptime-kuma          # Remove container

# Update Uptime Kuma
docker pull louislam/uptime-kuma:1
docker stop uptime-kuma
docker rm uptime-kuma
# Then run the docker run command again
```

### **NGINX Commands:**
```bash
nginx -t                       # Test config
systemctl reload nginx         # Reload config
systemctl restart nginx        # Restart NGINX
systemctl status nginx         # Check status
tail -f /var/log/nginx/error.log  # View errors
```

---

## 🔄 **Deployment Workflow:**

### **Update Production:**
```bash
# On your Mac
git push origin main

# On droplet
cd /opt/air_services
git pull
npm install
npm run build:all
pm2 restart all

# Check status
pm2 status
curl https://api.aircharters.com/api/health/all
```

---

## 📊 **Cost Breakdown:**

| Service | Cost | Required |
|---------|------|----------|
| DigitalOcean Droplet 2GB | $12/month | ✅ Yes |
| Domain (aircharters.com) | $10-15/year | ✅ Yes |
| SSL Certificate | FREE (Let's Encrypt) | ✅ Yes |
| Uptime Kuma | FREE | ✅ Yes |
| Redis | FREE (on droplet) | ✅ Yes |
| MySQL Database | Already have | ✅ Yes |

**Total: ~$12/month + domain** 💰

---

## 🎉 **What You Get:**

✅ **All 10 microservices running 24/7**  
✅ **Auto-restart on crash** (PM2 + Docker)  
✅ **SSL encryption** (HTTPS)  
✅ **Professional monitoring** (Uptime Kuma)  
✅ **Email alerts** when services go down  
✅ **Public status page** for customers  
✅ **99.9% uptime**  

---

## 🚀 **Quick Start:**

```bash
# 1. Create droplet on DigitalOcean
# 2. Point domain DNS to droplet IP
# 3. SSH to droplet
# 4. Upload & run deploy-uptime-kuma.sh
# 5. Deploy microservices (follow Step 4 above)
# 6. Configure monitoring
# 7. Done! 🎉
```

---

**The script `deploy-uptime-kuma.sh` is ready in your `air_services` folder!** 

When you're ready to deploy to production, just upload it to your Ubuntu droplet and run it. 🚀

**For now, on your Mac, make sure your microservices are running and visit:**
- http://localhost:5008/api/health/dashboard (Built-in)
- http://localhost:3001 (Uptime Kuma)

**Need help setting up the droplet, or ready to test locally first?** 🎯
