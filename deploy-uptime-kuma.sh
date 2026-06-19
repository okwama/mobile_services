#!/bin/bash

# =================================================================
# Uptime Kuma Installation Script for Ubuntu Droplet
# =================================================================
# Usage: 
#   1. Upload this script to your Ubuntu droplet
#   2. chmod +x deploy-uptime-kuma.sh
#   3. sudo ./deploy-uptime-kuma.sh your-domain.com your-email@example.com
# =================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# Get domain and email from arguments
DOMAIN=${1:-"monitor.aircharters.com"}
EMAIL=${2:-"admin@aircharters.com"}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Uptime Kuma Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Domain: ${YELLOW}${DOMAIN}${NC}"
echo -e "Email: ${YELLOW}${EMAIL}${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Update system
echo -e "${GREEN}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y

# Install Docker
echo -e "${GREEN}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker already installed${NC}"
fi

# Install Docker Compose
echo -e "${GREEN}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker Compose already installed${NC}"
fi

# Create Uptime Kuma directory
echo -e "${GREEN}[4/8] Creating Uptime Kuma directory...${NC}"
mkdir -p /opt/uptime-kuma
cd /opt/uptime-kuma

# Run Uptime Kuma with Docker
echo -e "${GREEN}[5/8] Starting Uptime Kuma container...${NC}"
docker run -d \
  --name uptime-kuma \
  --restart=always \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1

echo -e "${GREEN}✅ Uptime Kuma started on port 3001${NC}"

# Install NGINX
echo -e "${GREEN}[6/8] Installing NGINX...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    echo -e "${GREEN}✅ NGINX installed${NC}"
else
    echo -e "${YELLOW}⚠️  NGINX already installed${NC}"
fi

# Configure NGINX
echo -e "${GREEN}[7/8] Configuring NGINX reverse proxy...${NC}"
cat > /etc/nginx/sites-available/uptime-kuma <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/uptime-kuma /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Test NGINX config
nginx -t

# Restart NGINX
systemctl restart nginx
echo -e "${GREEN}✅ NGINX configured${NC}"

# Install Certbot (SSL)
echo -e "${GREEN}[8/8] Installing SSL certificate...${NC}"
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m ${EMAIL}

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${GREEN}📊 Uptime Kuma Dashboard:${NC}"
echo -e "   ${YELLOW}https://${DOMAIN}${NC}\n"
echo -e "${GREEN}🔐 First-time Setup:${NC}"
echo -e "   1. Visit https://${DOMAIN}"
echo -e "   2. Create admin account"
echo -e "   3. Add monitors\n"
echo -e "${GREEN}📝 Useful Commands:${NC}"
echo -e "   View logs:    ${YELLOW}docker logs uptime-kuma${NC}"
echo -e "   Restart:      ${YELLOW}docker restart uptime-kuma${NC}"
echo -e "   Stop:         ${YELLOW}docker stop uptime-kuma${NC}"
echo -e "   Start:        ${YELLOW}docker start uptime-kuma${NC}"
echo -e "   Update:       ${YELLOW}docker pull louislam/uptime-kuma:1 && docker restart uptime-kuma${NC}\n"
echo -e "${GREEN}🔥 Firewall Setup:${NC}"
echo -e "   ${YELLOW}ufw allow 80/tcp${NC}"
echo -e "   ${YELLOW}ufw allow 443/tcp${NC}"
echo -e "   ${YELLOW}ufw enable${NC}\n"
echo -e "${GREEN}========================================${NC}\n"

# Setup firewall
echo -e "${GREEN}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp  # SSH
    echo "y" | ufw enable
    echo -e "${GREEN}✅ Firewall configured${NC}"
fi

echo -e "\n${GREEN}🎉 Setup complete! Visit https://${DOMAIN} to access Uptime Kuma${NC}\n"

