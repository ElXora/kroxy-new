#!/usr/bin/env bash
# =============================================================
# Kroxy Panel — Full Auto Installer
# https://github.com/ElXora/kroxy-new
# =============================================================
set -euo pipefail

# ── colours ───────────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

STEP=0
TOTAL=14

# ── helpers ───────────────────────────────────────────────────
step() {
    STEP=$((STEP+1))
    echo -e "\n  ${WHITE}[${STEP}/${TOTAL}]${RESET} ${BOLD}${1}${RESET}"
}

info()    { echo -e "  ${DIM}→ ${1}${RESET}"; }
success() { echo -e "  ${GREEN}✓ ${1}${RESET}"; }
warn()    { echo -e "  ${YELLOW}⚠ ${1}${RESET}"; }
error()   { echo -e "\n  ${RED}✗ ERROR: ${1}${RESET}\n"; exit 1; }
hr()      { echo -e "${DIM}──────────────────────────────────────────────────────${RESET}"; }

ask() {
    local var="$1" prompt="$2" default="${3:-}"
    if [[ -n "$default" ]]; then
        read -rp "  ${CYAN}?${RESET} ${prompt} [${default}]: " input
        printf -v "$var" '%s' "${input:-$default}"
    else
        read -rp "  ${CYAN}?${RESET} ${prompt}: " input
        while [[ -z "$input" ]]; do
            echo -e "  ${RED}This field is required.${RESET}"
            read -rp "  ${CYAN}?${RESET} ${prompt}: " input
        done
        printf -v "$var" '%s' "$input"
    fi
}

ask_secret() {
    local var="$1" prompt="$2"
    read -srp "  ${CYAN}?${RESET} ${prompt}: " input; echo
    while [[ -z "$input" ]]; do
        echo -e "  ${RED}This field is required.${RESET}"
        read -srp "  ${CYAN}?${RESET} ${prompt}: " input; echo
    done
    printf -v "$var" '%s' "$input"
}

env_set() {
    local key="$1" val="$2"
    local esc
    esc=$(printf '%s\n' "$val" | sed 's/[\/&]/\\&/g')
    if grep -q "^${key}=" .env 2>/dev/null; then
        sed -i "s|^${key}=.*|${key}=${esc}|" .env
    else
        echo "${key}=${esc}" >> .env
    fi
}

# ── must run as root ──────────────────────────────────────────
if [[ "$EUID" -ne 0 ]]; then
    error "Please run as root: sudo bash install.sh"
fi

# ── detect OS ─────────────────────────────────────────────────
if [[ -f /etc/os-release ]]; then
    source /etc/os-release
    OS_ID="${ID:-unknown}"
else
    error "Cannot detect OS. Only Ubuntu/Debian are supported."
fi

if [[ "$OS_ID" != "ubuntu" && "$OS_ID" != "debian" ]]; then
    error "Only Ubuntu and Debian are supported. Detected: $OS_ID"
fi

# ── banner ────────────────────────────────────────────────────
clear
echo -e "${WHITE}"
cat << 'BANNER'
  ██╗  ██╗██████╗  ██████╗ ██╗  ██╗██╗   ██╗
  ██║ ██╔╝██╔══██╗██╔═══██╗╚██╗██╔╝╚██╗ ██╔╝
  █████╔╝ ██████╔╝██║   ██║ ╚███╔╝  ╚████╔╝
  ██╔═██╗ ██╔══██╗██║   ██║ ██╔██╗   ╚██╔╝
  ██║  ██╗██║  ██║╚██████╔╝██╔╝ ██╗   ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝
        Panel Installer · github.com/ElXora/kroxy-new
BANNER
echo -e "${RESET}"
hr

echo -e "  This script will automatically install Kroxy Panel."
hr
echo
read -rp "  Press ENTER to begin, or Ctrl+C to cancel..."

# ── collect configuration ─────────────────────────────────────
echo
echo -e "${BOLD}Configuration${RESET}"
echo

ask APP_NAME  "Panel name" "Kroxy"
ask APP_URL   "Panel URL (e.g. https://panel.example.com)"
ask APP_TZ    "Timezone (e.g. UTC, Europe/London)" "UTC"

echo
echo -e "${BOLD}Admin account${RESET}"
ask ADMIN_FIRST    "First name"
ask ADMIN_LAST     "Last name"
ask ADMIN_EMAIL    "Email"
ask ADMIN_USERNAME "Username" "admin"
ask_secret ADMIN_PASS  "Password"
ask_secret ADMIN_PASS2 "Confirm password"

while [[ "$ADMIN_PASS" != "$ADMIN_PASS2" ]]; do
    echo -e "  ${RED}Passwords do not match. Try again.${RESET}"
    ask_secret ADMIN_PASS  "Password"
    ask_secret ADMIN_PASS2 "Confirm password"
done

# Auto-generate credentials
DB_NAME="kroxy"
DB_USER="kroxy"
DB_PASS="$(tr -dc 'A-Za-z0-9!#%^' </dev/urandom | head -c 24)"
REDIS_PASS="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)"

# ── Confirmation AFTER admin info ─────────────────────────────
echo
hr
echo -e "  ${YELLOW}Installation Summary${RESET}"
echo -e "  Panel name : ${APP_NAME}"
echo -e "  Panel URL  : ${APP_URL}"
echo -e "  Timezone   : ${APP_TZ}"
echo -e "  Admin      : ${ADMIN_FIRST} ${ADMIN_LAST} <${ADMIN_EMAIL}> (${ADMIN_USERNAME})"
echo -e "  ${DIM}Database and Redis credentials will be auto-generated.${RESET}"
hr
echo

read -rp "  All information correct? Press ENTER to start installation or Ctrl+C to cancel..."
echo

# ── 1 · system update ─────────────────────────────────────────
step "Updating system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
success "System updated"

# ── 2 · base dependencies ─────────────────────────────────────
step "Installing base dependencies"
apt-get install -y -qq curl wget git unzip zip tar \
    software-properties-common apt-transport-https \
    ca-certificates gnupg lsb-release
success "Base dependencies installed"

# ── 3 · PHP 8.3 ───────────────────────────────────────────────
step "Installing PHP 8.3 and required extensions"
if [[ "$OS_ID" == "ubuntu" ]]; then
    add-apt-repository -y ppa:ondrej/php >/dev/null 2>&1
else
    curl -sSL https://packages.sury.org/php/apt.gpg | gpg --dearmor -o /usr/share/keyrings/sury-php.gpg
    echo "deb [signed-by=/usr/share/keyrings/sury-php.gpg] https://packages.sury.org/php/ $(lsb_release -sc) main" \
        > /etc/apt/sources.list.d/sury-php.list
fi

apt-get update -qq
apt-get install -y -qq php8.3 php8.3-cli php8.3-fpm php8.3-common \
    php8.3-mysql php8.3-mbstring php8.3-bcmath php8.3-xml \
    php8.3-curl php8.3-zip php8.3-gd php8.3-tokenizer \
    php8.3-readline php8.3-redis php8.3-intl
success "PHP 8.3 installed ($(php8.3 -r 'echo PHP_VERSION;'))"

# ── 4 · Composer ──────────────────────────────────────────────
step "Installing Composer"
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --quiet
success "Composer installed"

# ── 5 · Node 20 ───────────────────────────────────────────────
step "Installing Node.js 20 and npm"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
apt-get install -y -qq nodejs
success "Node.js 20 installed"

# ── 6 · MySQL 8 ───────────────────────────────────────────────
step "Installing and configuring MySQL 8"
apt-get install -y -qq mysql-server
systemctl enable mysql >/dev/null 2>&1
systemctl start mysql

mysql -u root << MYSQL_SETUP
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost','127.0.0.1','::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\_%';
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
MYSQL_SETUP
success "MySQL 8 installed"

# ── 7 · Redis ─────────────────────────────────────────────────
step "Installing and configuring Redis"
apt-get install -y -qq redis-server
sed -i "s/^# requirepass .*/requirepass ${REDIS_PASS}/" /etc/redis/redis.conf
sed -i "s/^requirepass .*/requirepass ${REDIS_PASS}/" /etc/redis/redis.conf
sed -i 's/^bind .*/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl enable redis-server >/dev/null 2>&1
systemctl restart redis-server
success "Redis installed and secured"

# ── 8 · Nginx ─────────────────────────────────────────────────
step "Installing and configuring Nginx"
apt-get install -y -qq nginx

APP_DOMAIN="${APP_URL#https://}"
APP_DOMAIN="${APP_DOMAIN#http://}"
APP_DOMAIN="${APP_DOMAIN%%/*}"

cat > /etc/nginx/sites-available/kroxy << NGINX_CONF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_DOMAIN};
    root /var/www/kroxy/public;
    index index.php;

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }

    client_max_body_size 100m;
}
NGINX_CONF

ln -sf /etc/nginx/sites-available/kroxy /etc/nginx/sites-enabled/kroxy
rm -f /etc/nginx/sites-enabled/default
nginx -t >/dev/null 2>&1 && systemctl restart nginx
systemctl enable nginx >/dev/null 2>&1
success "Nginx configured"

# ── 9 · Clone ─────────────────────────────────────────────────
step "Cloning Kroxy Panel"
INSTALL_DIR="/var/www/kroxy"
if [[ -d "$INSTALL_DIR" ]]; then
    warn "Directory exists, removing..."
    rm -rf "$INSTALL_DIR"
fi
git clone https://github.com/ElXora/kroxy-new "$INSTALL_DIR" --quiet
cd "$INSTALL_DIR"
success "Repository cloned"

# ── 10 · Composer ─────────────────────────────────────────────
step "Installing PHP dependencies"
composer install --no-dev --optimize-autoloader --no-interaction --quiet
success "Composer dependencies installed"

# ── 11 · .env ─────────────────────────────────────────────────
step "Configuring .env file"
cp .env.example .env

env_set APP_NAME        "${APP_NAME}"
env_set APP_ENV         "production"
env_set APP_URL         "${APP_URL}"
env_set APP_TIMEZONE    "${APP_TZ}"
env_set APP_DEBUG       "false"
env_set DB_CONNECTION   "mysql"
env_set DB_HOST         "127.0.0.1"
env_set DB_PORT         "3306"
env_set DB_DATABASE     "${DB_NAME}"
env_set DB_USERNAME     "${DB_USER}"
env_set DB_PASSWORD     "${DB_PASS}"
env_set REDIS_HOST      "127.0.0.1"
env_set REDIS_PORT      "6379"
env_set REDIS_PASSWORD  "${REDIS_PASS}"
env_set CACHE_DRIVER    "redis"
env_set SESSION_DRIVER  "redis"
env_set QUEUE_CONNECTION "redis"
env_set MAIL_MAILER     "log"
env_set MAIL_FROM_ADDRESS "no-reply@${APP_DOMAIN}"
env_set MAIL_FROM_NAME  "${APP_NAME}"

php artisan key:generate --force --quiet
success ".env configured"

# ── 12 · Migrate ──────────────────────────────────────────────
step "Setting permissions and running migrations"
chown -R www-data:www-data "$INSTALL_DIR"
chmod -R 755 storage bootstrap/cache
php artisan migrate --seed --force --quiet
success "Migrations completed"

# ── 13 · Frontend ─────────────────────────────────────────────
step "Building frontend"
npm install --silent
npm run build --silent
success "Frontend built"

# ── 14 · Admin + Queue ────────────────────────────────────────
step "Creating admin user"
php artisan p:user:make \
    --email="$ADMIN_EMAIL" \
    --username="$ADMIN_USERNAME" \
    --name-first="$ADMIN_FIRST" \
    --name-last="$ADMIN_LAST" \
    --password="$ADMIN_PASS" \
    --admin=1

# Queue service
cat > /etc/systemd/system/kroxy-queue.service << SERVICE
[Unit]
Description=Kroxy Panel Queue Worker
After=network.target mysql.service redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
RestartSec=5
ExecStart=/usr/bin/php /var/www/kroxy/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now kroxy-queue.service >/dev/null 2>&1
success "Admin user created & queue worker started"

# ── Finish ────────────────────────────────────────────────────
echo
echo -e "${WHITE}╔════════════════════════════════════════════════════╗${RESET}"
echo -e "${WHITE}║     Kroxy Panel installed successfully! 🎉        ║${RESET}"
echo -e "${WHITE}╚════════════════════════════════════════════════════╝${RESET}"
echo
echo -e "  ${BOLD}Panel URL   :${RESET} ${APP_URL}"
echo -e "  ${BOLD}Admin Email :${RESET} ${ADMIN_EMAIL}"
echo -e "  ${BOLD}Admin User  :${RESET} ${ADMIN_USERNAME}"
echo
echo -e "  ${YELLOW}Next:${RESET} Run ${BOLD}certbot --nginx -d ${APP_DOMAIN}${RESET} for HTTPS"
echo

exit 0
