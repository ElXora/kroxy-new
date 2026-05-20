#!/usr/bin/env bash
# =============================================================
#  Kroxy Panel — One-Command Full Installer
#  https://github.com/ElXora/kroxy-new
# =============================================================
set -euo pipefail

# ── colours ──────────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

STEP=0
TOTAL=11

# ── helpers ───────────────────────────────────────────────────
step() {
    STEP=$((STEP + 1))
    echo -e "\n${WHITE}[${STEP}/${TOTAL}]${RESET} ${BOLD}${1}${RESET}"
}

info()    { echo -e "  ${DIM}→ ${1}${RESET}"; }
success() { echo -e "  ${GREEN}✓ ${1}${RESET}"; }
warn()    { echo -e "  ${YELLOW}⚠ ${1}${RESET}"; }
error()   { echo -e "\n  ${RED}✗ ERROR: ${1}${RESET}\n"; exit 1; }

ask() {
    local var="$1" prompt="$2" default="${3:-}"
    if [[ -n "$default" ]]; then
        read -rp "  $(echo -e "${CYAN}?${RESET}") ${prompt} ${DIM}[${default}]${RESET}: " input
        printf -v "$var" '%s' "${input:-$default}"
    else
        read -rp "  $(echo -e "${CYAN}?${RESET}") ${prompt}: " input
        while [[ -z "$input" ]]; do
            echo -e "  ${RED}This field is required.${RESET}"
            read -rp "  $(echo -e "${CYAN}?${RESET}") ${prompt}: " input
        done
        printf -v "$var" '%s' "$input"
    fi
}

ask_secret() {
    local var="$1" prompt="$2"
    read -srp "  $(echo -e "${CYAN}?${RESET}") ${prompt}: " input
    echo
    while [[ -z "$input" ]]; do
        echo -e "  ${RED}This field is required.${RESET}"
        read -srp "  $(echo -e "${CYAN}?${RESET}") ${prompt}: " input
        echo
    done
    printf -v "$var" '%s' "$input"
}

hr() { echo -e "${DIM}──────────────────────────────────────────────────────${RESET}"; }

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
        Full One-Command Installer

BANNER
echo -e "${RESET}"
hr
echo -e "  This script will install everything needed and set up Kroxy Panel."
echo
read -rp "  Press ENTER to begin, or Ctrl+C to cancel..."

# ── 1 · Install System Dependencies ───────────────────────────
step "Installing system dependencies (PHP, MariaDB, Redis, Nginx...)"

if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root (sudo)"
fi

if [[ ! -f /etc/os-release ]]; then
    error "Cannot detect OS. Only Ubuntu/Debian supported for auto-install."
fi

OS_NAME=$(awk -F= '/^NAME/{print $2}' /etc/os-release | tr -d '"')

if [[ "$OS_NAME" == *"Ubuntu"* ]] || [[ "$OS_NAME" == *"Debian"* ]]; then
    info "Detected $OS_NAME — installing required packages..."
    
    apt-get update -qq
    
    # PHP repository
    apt-get install -y software-properties-common curl
    add-apt-repository ppa:ondrej/php -y
    
    apt-get update -qq
    
    apt-get install -y \
        php8.3 php8.3-cli php8.3-fpm php8.3-mysql php8.3-curl \
        php8.3-mbstring php8.3-xml php8.3-zip php8.3-bcmath \
        php8.3-gd php8.3-redis php8.3-intl php8.3-opcache \
        mariadb-server mariadb-client \
        redis-server \
        nginx \
        git curl unzip \
        nodejs npm
    
    # Composer
    if ! command -v composer &> /dev/null; then
        curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
        chmod +x /usr/local/bin/composer
    fi

    success "All system dependencies installed successfully"
else
    error "This script currently only supports Ubuntu and Debian for automatic dependency installation."
fi

# ── 2 · collect config ────────────────────────────────────────
step "Gathering configuration"

echo -e "${BOLD}Basic Settings${RESET}"
echo

ask       APP_NAME     "Panel name"                       "Kroxy"
ask       APP_URL      "Panel URL (e.g. https://panel.example.com)"
ask       APP_ENV      "Environment"                      "production"
ask       APP_TIMEZONE "Timezone (e.g. UTC, America/New_York)"  "UTC"

echo
echo -e "${BOLD}Admin Account${RESET}"
ask        ADMIN_FIRST    "Admin first name"
ask        ADMIN_LAST     "Admin last name"
ask        ADMIN_EMAIL    "Admin email"
ask        ADMIN_USERNAME "Admin username"  "admin"
ask_secret ADMIN_PASS     "Admin password"

ask_secret ADMIN_PASS_CONFIRM "Confirm admin password"
while [[ "$ADMIN_PASS" != "$ADMIN_PASS_CONFIRM" ]]; do
    echo -e "  ${RED}Passwords do not match. Try again.${RESET}"
    ask_secret ADMIN_PASS         "Admin password"
    ask_secret ADMIN_PASS_CONFIRM "Confirm admin password"
done

echo
hr
echo -e "  ${YELLOW}Review:${RESET}"
echo -e "  App Name : ${APP_NAME}"
echo -e "  App URL  : ${APP_URL}"
echo -e "  Admin    : ${ADMIN_FIRST} ${ADMIN_LAST} <${ADMIN_EMAIL}>"
hr
read -rp "  Continue? Press ENTER or Ctrl+C to abort..."

# ── 3 · clone repository ──────────────────────────────────────
step "Cloning Kroxy Panel repository"

INSTALL_DIR="/var/www/kroxy"

if [[ -d "$INSTALL_DIR" ]]; then
    warn "Directory $INSTALL_DIR already exists."
    read -rp "  Overwrite it? [y/N]: " ow
    if [[ "${ow,,}" == "y" ]]; then
        rm -rf "$INSTALL_DIR"
    else
        error "Aborted by user."
    fi
fi

git clone https://github.com/ElXora/kroxy-new "$INSTALL_DIR"
cd "$INSTALL_DIR"
success "Repository cloned to $INSTALL_DIR"

# ── 4 · composer dependencies ─────────────────────────────────
step "Installing PHP dependencies (Composer)"
composer install --no-dev --optimize-autoloader --no-interaction
success "Composer dependencies installed"

# ── 5 · .env setup ────────────────────────────────────────────
step "Creating .env configuration"

cp .env.example .env

env_set() {
    local key="$1" val="$2"
    local escaped_val=$(printf '%s\n' "$val" | sed 's/[\/&]/\\&/g')
    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${escaped_val}|" .env
    else
        echo "${key}=${escaped_val}" >> .env
    fi
}

env_set APP_NAME        "\"${APP_NAME}\""
env_set APP_ENV         "$APP_ENV"
env_set APP_URL         "$APP_URL"
env_set APP_TIMEZONE    "$APP_TIMEZONE"
env_set APP_DEBUG       "false"

# Database
env_set DB_CONNECTION   "mysql"
env_set DB_HOST         "127.0.0.1"
env_set DB_PORT         "3306"
env_set DB_DATABASE     "kroxy"
env_set DB_USERNAME     "kroxy"
env_set DB_PASSWORD     "kroxy_password"

# Redis
env_set REDIS_HOST      "127.0.0.1"
env_set REDIS_PORT      "6379"
env_set REDIS_PASSWORD  "null"

env_set CACHE_DRIVER    "redis"
env_set SESSION_DRIVER  "redis"
env_set QUEUE_CONNECTION "redis"

# Mail (using log driver by default)
env_set MAIL_MAILER     "log"
env_set MAIL_FROM_ADDRESS "no-reply@${APP_URL#https://}"
env_set MAIL_FROM_NAME  "\"${APP_NAME}\""

success ".env file created with defaults"

# ── 6 · application key ───────────────────────────────────────
step "Generating application key"
php artisan key:generate --force
success "Application key generated"

# ── 7 · permissions & database setup ─────────────────────────
step "Setting up permissions and database"

chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS kroxy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 
mysql -e "CREATE USER IF NOT EXISTS 'kroxy'@'localhost' IDENTIFIED BY 'kroxy_password';"
mysql -e "GRANT ALL PRIVILEGES ON kroxy.* TO 'kroxy'@'localhost'; FLUSH PRIVILEGES;"

success "Database and permissions configured"

# ── 8 · migrations ────────────────────────────────────────────
step "Running database migrations"
php artisan migrate --seed --force
success "Migrations completed"

# ── 9 · frontend build ────────────────────────────────────────
step "Installing Node.js dependencies"
npm install
success "Node dependencies installed"

step "Building frontend assets"
npm run build
success "Frontend assets built"

# ── 10 · create admin user ────────────────────────────────────
step "Creating admin user"
php artisan p:user:make \
    --email="$ADMIN_EMAIL" \
    --username="$ADMIN_USERNAME" \
    --name-first="$ADMIN_FIRST" \
    --name-last="$ADMIN_LAST" \
    --password="$ADMIN_PASS" \
    --admin=1
success "Admin user created successfully"

# ── 11 · queue worker ─────────────────────────────────────────
step "Setting up queue worker"

cat << 'SERVICE' > /tmp/kroxy-queue.service
[Unit]
Description=Kroxy Panel Queue Worker
After=network.target

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/kroxy/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3 --max-time=3600

[Install]
WantedBy=multi-user.target
SERVICE

if [[ -d /etc/systemd/system ]]; then
    cp /tmp/kroxy-queue.service /etc/systemd/system/kroxy-queue.service
    systemctl daemon-reload
    systemctl enable kroxy-queue.service
    systemctl start kroxy-queue.service
    success "Queue worker service installed and started"
else
    warn "systemd not found. Please start queue worker manually later."
fi

# ── Final Step ────────────────────────────────────────────────
step "Installation Complete! 🎉"

echo
echo -e "${WHITE}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${WHITE}║               Kroxy Panel Installed Successfully!            ║${RESET}"
echo -e "${WHITE}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo
echo -e "  ${BOLD}Panel URL     :${RESET} ${APP_URL}"
echo -e "  ${BOLD}Admin Email   :${RESET} ${ADMIN_EMAIL}"
echo -e "  ${BOLD}Admin Password:${RESET} ${ADMIN_PASS}"
echo -e "  ${BOLD}Install Path  :${RESET} ${INSTALL_DIR}"
echo
echo -e "  ${YELLOW}Important Post-Installation Tasks:${RESET}"
echo -e "  • Change the default database password in ${INSTALL_DIR}/.env"
echo -e "  • Configure Nginx to point to ${INSTALL_DIR}/public"
echo -e "  • Set up SSL (recommended: certbot)"
echo -e "  • Restart services: systemctl restart nginx php8.3-fpm"
echo
echo -e "  Enjoy your Kroxy Panel!"
