#!/usr/bin/env bash
set -euo pipefail

# bootstrap-vps.sh
# Minimal VPS bootstrap for Node apps + PM2 + Nginx + Redis + optional Uptime Kuma
# Usage: sudo bash bootstrap-vps.sh [options]
# Options via env vars:
#  DEPLOY_USER=deploy          (user to create / use)
#  NODE_VERSION=24             (nvm node version or 'lts')
#  GIT_REPO=                   (optional repo to clone)
#  GIT_BRANCH=main             (branch)
#  APP_DIR=/opt/apps/myapp     (where to clone)
#  APP_START_CMD="pm2 start ecosystem.config.js --env production" (optional)
#  DOMAIN=                     (optional domain to create nginx server block)
#  EMAIL=                      (email for certbot; only used if DOMAIN provided)
#  INSTALL_KUMA=true           (set to 'true' to install Uptime Kuma under /opt/uptime-kuma)

# Defaults
DEPLOY_USER=${DEPLOY_USER:-deploy}
NODE_VERSION=${NODE_VERSION:-lts}
GIT_REPO=${GIT_REPO:-}
GIT_BRANCH=${GIT_BRANCH:-main}
APP_DIR=${APP_DIR:-/opt/apps}
APP_START_CMD=${APP_START_CMD:-}
DOMAIN=${DOMAIN:-}
EMAIL=${EMAIL:-}
INSTALL_KUMA=${INSTALL_KUMA:-false}

echo "Bootstrap started: user=$DEPLOY_USER node=$NODE_VERSION domain=${DOMAIN:-none}"

# 1) System update + essentials
apt update && apt upgrade -y
apt install -y build-essential git curl ca-certificates apt-transport-https lsb-release software-properties-common

# 2) Create deploy user (if not exists)
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" $DEPLOY_USER
  usermod -aG sudo $DEPLOY_USER
  echo "Created user $DEPLOY_USER and added to sudoers"
else
  echo "User $DEPLOY_USER already exists"
fi

# 3) Install Nginx
apt install -y nginx
systemctl enable --now nginx

# 4) Install Redis (simple default install)
apt install -y redis-server
systemctl enable --now redis-server

# 5) Install NVM & Node for deploy user
export NVM_DIR="/home/$DEPLOY_USER/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  sudo -u $DEPLOY_USER bash -lc "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
fi
# Load nvm and install Node
sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION"

# 6) Install Yarn & PM2 globally (as deploy user)
sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && npm install -g yarn pm2@latest"

# 7) Create apps dir
mkdir -p "$APP_DIR"
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# 8) Optional: clone project and build
if [ -n "$GIT_REPO" ]; then
  APP_NAME=$(basename -s .git "$GIT_REPO")
  TARGET="$APP_DIR/$APP_NAME"
  if [ -d "$TARGET/.git" ]; then
    echo "Repository already cloned at $TARGET. Pulling latest..."
    sudo -u $DEPLOY_USER git -C "$TARGET" pull origin "$GIT_BRANCH"
  else
    sudo -u $DEPLOY_USER git clone --branch "$GIT_BRANCH" "$GIT_REPO" "$TARGET"
  fi
  # Install & build if package.json exists
  if [ -f "$TARGET/package.json" ]; then
    sudo -u $DEPLOY_USER bash -lc "cd $TARGET && . \"$NVM_DIR/nvm.sh\" && npm ci --production && npm run build || true"
  fi
  # Start app with provided start command
  if [ -n "$APP_START_CMD" ]; then
    sudo -u $DEPLOY_USER bash -lc "cd $TARGET && . \"$NVM_DIR/nvm.sh\" && $APP_START_CMD"
  fi
fi

# 9) PM2 startup (generate systemd service)
sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && pm2 unstartup || true"
PM2_START_CMD=$(sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER" )
eval "$PM2_START_CMD"
pm2 save || true

# 10) Create simple nginx server block template (if DOMAIN provided)
if [ -n "$DOMAIN" ]; then
  NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
  cat > "$NGINX_CONF" <<EOF
server {
  listen 80;
  server_name $DOMAIN;

  root /var/www/$DOMAIN;
  index index.html;

  location / {
    proxy_pass http://127.0.0.1:5000; # adjust to your app port or create additional server blocks
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"
  mkdir -p /var/www/$DOMAIN
  chown -R $DEPLOY_USER:$DEPLOY_USER /var/www/$DOMAIN
  nginx -t && systemctl reload nginx
  echo "Created nginx server block for $DOMAIN at $NGINX_CONF"
  if [ -n "$EMAIL" ]; then
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" || echo "certbot failed - run manually"
  else
    echo "No email provided; skipping certbot. Provide EMAIL env to request a certificate." 
  fi
fi

# 11) Optional: Install Uptime Kuma under /opt/uptime-kuma and start with PM2
if [ "$INSTALL_KUMA" = "true" ] || [ "$INSTALL_KUMA" = "1" ]; then
  KUMA_DIR=/opt/uptime-kuma
  if [ ! -d "$KUMA_DIR" ]; then
    git clone https://github.com/louislam/uptime-kuma.git "$KUMA_DIR"
    chown -R $DEPLOY_USER:$DEPLOY_USER "$KUMA_DIR"
    sudo -u $DEPLOY_USER bash -lc "cd $KUMA_DIR && . \"$NVM_DIR/nvm.sh\" && npm ci --production"
  else
    echo "Uptime Kuma already present at $KUMA_DIR"
  fi
  # Start with pm2
  sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && pm2 start $KUMA_DIR/server/server.js --name uptime-kuma --env production --watch --update-env"
  pm2 save
fi

# 12) Final notes
cat <<EOT
Bootstrap complete.
- Deploy user: $DEPLOY_USER
- Node: $NODE_VERSION (installed via nvm for $DEPLOY_USER)
- PM2 installed and pm2 startup configured for $DEPLOY_USER
- Nginx and Redis installed and running

If you cloned a repo with APP_START_CMD set, it was attempted.
To start additional projects:
  - Clone into $APP_DIR
  - Create a .env (production) and ecosystem.config.js
  - Run: pm2 start ecosystem.config.js --env production

Verification commands:
  sudo -u $DEPLOY_USER bash -lc ". \"$NVM_DIR/nvm.sh\" && node -v && npm -v && pm2 -v"
  systemctl status nginx
  systemctl status redis-server
  pm2 ls
EOT

exit 0
