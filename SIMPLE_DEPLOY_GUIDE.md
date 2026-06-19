# 🚀 Deploy to Ubuntu VPS - Super Simple Guide

## 🎯 What You're Doing
You're moving your backend code (air_services) from your Mac to an Ubuntu server so it can run 24/7 on the internet at **api.aircharterss.com**

---

## 📝 Before You Start - Write These Down

1. **Your VPS IP Address**: _________________ (example: 142.93.123.45)
2. **Your Domain**: api.aircharterss.com
3. **Your Email**: _________________ (for SSL certificate)
4. **Your Database IP**: _________________ (if external database)

---

## 🎪 Step 1: Point Your Domain to VPS (5 minutes)

**Go to where you bought aircharterss.com** (GoDaddy, Namecheap, etc.)

1. Find "DNS Settings" or "Manage DNS"
2. Add a new record:
   - **Type**: A
   - **Name**: api
   - **Value**: YOUR_VPS_IP (like 142.93.123.45)
   - **TTL**: 300 or Auto
3. Click "Save"
4. Wait 5-10 minutes (go get a snack! 🍪)

✅ **Test it works**: Open terminal and type:
```bash
ping api.aircharterss.com
```
If you see replies with your VPS IP, it worked! 🎉

---

## 🔐 Step 2: Login to Your VPS (1 minute)

Open your terminal:
```bash
ssh root@YOUR_VPS_IP
# Example: ssh root@142.93.123.45
```

Type "yes" if asked about fingerprint.
Enter your password.

You're now inside your server! 🎮

---

## 🛠️ Step 3: Install Basic Stuff (5 minutes)

Copy these commands ONE AT A TIME:

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2 (keeps your apps running)
```bash
npm install -g pm2
```

### Install NGINX (handles web traffic)
```bash
sudo apt update
sudo apt install -y nginx
```

### Install Certbot (for HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Install Redis (for caching)
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

---

## 📦 Step 4: Upload Your Code (3 minutes)

### On Your Mac (open NEW terminal tab):
```bash
cd "/Users/citlogistics/Desktop/Flutter Projects/Members/sp"
tar -czf air_services.tar.gz air_services/
scp air_services.tar.gz root@YOUR_VPS_IP:/root/
```
*Replace YOUR_VPS_IP with your actual IP*

This will take 1-2 minutes depending on your internet. 📤

### Back on VPS terminal:
```bash
cd /root
tar -xzf air_services.tar.gz
cd air_services
```

---

## 🏗️ Step 5: Install & Build (5-10 minutes)

**Stay patient, this takes a while! ⏳**

```bash
npm install
npm run build:all
```

You'll see lots of text scrolling. That's normal! When it stops and shows no errors, continue.

---

## ⚙️ Step 6: Create Environment File

**IMPORTANT**: Replace the database info with YOUR actual database details!

```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=5008

# Database - CHANGE THESE TO YOUR ACTUAL VALUES!
DB_HOST=your-database-ip-here
DB_PORT=3306
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
DB_DATABASE=air_charters

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret - CHANGE THIS!
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random

# API Keys - ADD YOUR KEYS
PAYSTACK_SECRET_KEY=your-paystack-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
EOF
```

**Now edit it with your real values:**
```bash
nano .env
```
- Use arrow keys to move
- Type your real values
- Press `Ctrl + X`, then `Y`, then `Enter` to save

---

## 🚀 Step 7: Start Your Services (2 minutes)

Create the PM2 config file:
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      instances: 1,
      env: { NODE_ENV: 'production', PORT: 5008 }
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

**Start everything:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copy the command it shows you and run it (it will be a long `sudo` command).

**Check if they're running:**
```bash
pm2 status
```

You should see 10 services with "online" status! 🟢

---

## 🌐 Step 8: Setup NGINX (3 minutes)

Create NGINX config:
```bash
cat > /etc/nginx/sites-available/api << 'EOF'
server {
    listen 80;
    server_name api.aircharterss.com;

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
```

**Enable it:**
```bash
ln -sf /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔒 Step 9: Add HTTPS (2 minutes)

**Make your site secure with FREE SSL:**
```bash
certbot --nginx -d api.aircharterss.com --non-interactive --agree-tos -m your-email@example.com
```
*Replace `your-email@example.com` with your real email*

---

## 🎉 Step 10: Test It!

Open your browser and go to:
```
https://api.aircharterss.com/api/health/all
```

You should see JSON showing all services are healthy! 🎊

If you see errors, run:
```bash
pm2 logs
```
to see what went wrong.

---

## 📱 Useful Commands (Save These!)

### See if services are running:
```bash
pm2 status
```

### See logs if something breaks:
```bash
pm2 logs
```

### Restart everything:
```bash
pm2 restart all
```

### Stop everything:
```bash
pm2 stop all
```

### Check NGINX:
```bash
systemctl status nginx
```

---

## 🔄 How to Update Your Code Later

When you make changes to your code:

```bash
# 1. SSH to VPS
ssh root@YOUR_VPS_IP

# 2. Go to folder
cd /root/air_services

# 3. Stop services
pm2 stop all

# 4. Upload new code from Mac (in new terminal):
cd "/Users/citlogistics/Desktop/Flutter Projects/Members/sp"
tar -czf air_services.tar.gz air_services/
scp air_services.tar.gz root@YOUR_VPS_IP:/root/

# 5. Back on VPS, extract and build
cd /root
tar -xzf air_services.tar.gz
cd air_services
npm install
npm run build:all

# 6. Start services
pm2 restart all

# 7. Check status
pm2 status
```

---

## 🆘 Troubleshooting

### Services won't start?
```bash
pm2 logs
```
Read the error messages. Usually it's:
- Wrong database credentials in .env
- Database not accessible
- Missing environment variables

### Can't access website?
```bash
# Check NGINX
systemctl status nginx

# Check firewall
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Database connection failed?
```bash
# Test from VPS
mysql -h YOUR_DB_IP -u YOUR_DB_USER -p
```

---

## ✅ Checklist

- [ ] DNS pointing to VPS IP
- [ ] Can SSH to VPS
- [ ] Node.js installed
- [ ] PM2 installed
- [ ] NGINX installed
- [ ] Redis installed
- [ ] Code uploaded and built
- [ ] .env file configured
- [ ] PM2 services running
- [ ] NGINX configured
- [ ] SSL certificate installed
- [ ] Website accessible via HTTPS

---

## 🎯 What You Just Did

You just:
1. ✅ Pointed your domain to your server
2. ✅ Installed all necessary software
3. ✅ Uploaded your code
4. ✅ Built your application
5. ✅ Started 10 microservices
6. ✅ Setup a web server (NGINX)
7. ✅ Added HTTPS encryption
8. ✅ Made it run 24/7

**Your API is now live at https://api.aircharterss.com!** 🚀

---

**Need Help?** Just run `pm2 logs` and read the error messages. They usually tell you exactly what's wrong!

