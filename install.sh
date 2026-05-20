#!/usr/bin/env bash
# =============================================================
#  Kroxy Panel — One-Command Installer (Simplified)
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
TOTAL=9  # Reduced because we removed 3 sections

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
        Panel Installer · github.com/ElXora/kroxy-new

BANNER
echo -e "${RESET}"
hr
echo -e "  This script will:"
echo -e "  ${DIM}• Clone the repo from GitHub${RESET}"
echo -e "  ${DIM}• Install Composer & npm dependencies${RESET}"
echo -e "  ${DIM}• Set up your .env${RESET}"
echo -e "  ${DIM}• Run migrations & build the frontend${RESET}"
echo -e "  ${DIM}• Create your first admin user${RESET}"
hr
echo
read -rp "  Press ENTER to begin, or Ctrl+C to cancel..."

# ── 1 · collect config ────────────────────────────────────────
echo
echo -e "${BOLD}Basic Configuration${RESET}"
echo

ask       APP_NAME     "Panel name"                       "Kroxy"
ask       APP_URL      "Panel URL (e.g. https://panel.example.com)"
ask       APP_ENV      "Environment"                      "production"
ask       APP_TIMEZONE "Timezone (e.g. UTC, America/New_York)"  "UTC"

echo
echo -e "${BOLD}Admin account${RESET}"
ask        ADMIN_FIRST    "Admin first name"
ask        ADMIN_LAST     "Admin last name"
ask        ADMIN_EMAIL    "Admin email"
ask        ADMIN_USERNAME "Admin username"  "admin"
ask_secret ADMIN_PASS     "Admin password"

# confirm password
ask_secret ADMIN_PASS_CONFIRM "Confirm admin password"
while [[ "$ADMIN_PASS" != "$ADMIN_PASS_CONFIRM" ]]; do
    echo -e "  ${RED}Passwords do not match. Try again.${RESET}"
    ask_secret ADMIN_PASS         "Admin password"
    ask_secret ADMIN_PASS_CONFIRM "Confirm admin password"
done

echo
hr
echo -e "  ${YELLOW}Review your config:${RESET}"
echo -e "  App name  : ${APP_NAME}"
echo -e "  App URL   : ${APP_URL}"
echo -e "  Admin     : ${ADMIN_FIRST} ${ADMIN_LAST} <${ADMIN_EMAIL}> (${ADMIN_USERNAME})"
hr
read -rp "  Looks good? Press ENTER to install, or Ctrl+C to abort..."
echo

# ── 2 · check dependencies ────────────────────────────────────
step "Checking system dependencies"
for cmd in php composer node npm git curl; do
    if command -v "$cmd" &>/dev/null; then
        success "$cmd found ($(command $cmd --version 2>&1 | head -1))"
    else
        error "$cmd is not installed. Please install it and re-run this script."
    fi
done

PHP_VER=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
NODE_VER=$(node -e 'process.stdout.write(process.version.slice(1))')

if awk "BEGIN{exit !($PHP_VER >= 8.1)}"; then
    success "PHP $PHP_VER is compatible"
else
    error "PHP 8.1+ required. You have PHP $PHP_VER."
fi

if awk "BEGIN{exit !(${NODE_VER%%.*} >= 16)}"; then
    success "Node $NODE_VER is compatible"
else
    warn "Node 16+ recommended. You have Node $NODE_VER."
fi

# ── 3 · clone ────────────────────────────────────────────────
step "Cloning repository"

INSTALL_DIR="/var/www/kroxy"

if [[ -d "$INSTALL_DIR" ]]; then
    warn "Directory $INSTALL_DIR already exists."
    read -rp "  Overwrite? [y/N]: " ow
    if [[ "${ow,,}" == "y" ]]; then
        rm -rf "$INSTALL_DIR"
    else
        error "Aborted. Choose a different install dir or remove the existing one."
    fi
fi

git clone https://github.com/ElXora/kroxy-new "$INSTALL_DIR"
cd "$INSTALL_DIR"
success "Cloned to $INSTALL_DIR"

# ── 4 · composer ──────────────────────────────────────────────
step "Installing PHP dependencies (Composer)"
composer install --no-dev --optimize-autoloader --no-interaction
success "Composer packages installed"

# ── 5 · .env setup ────────────────────────────────────────────
step "Generating .env file"

cp .env.example .env

# helper: set or add a key in .env
env_set() {
    local key="$1" val="$2"
    local escaped_val
    escaped_val=$(printf '%s\n' "$val" | sed 's/[\/&]/\\&/g')
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

# === Database (defaults) ===
env_set DB_CONNECTION   "mysql"
env_set DB_HOST         "127.0.0.1"
env_set DB_PORT         "3306"
env_set DB_DATABASE     "kroxy"
env_set DB_USERNAME     "kroxy"
env_set DB_PASSWORD     "kroxy_password"   # ← Change this after install!

# === Redis (defaults) ===
env_set REDIS_HOST      "127.0.0.1"
env_set REDIS_PORT      "6379"
env_set REDIS_PASSWORD  "null"

env_set CACHE_DRIVER    "redis"
env_set SESSION_DRIVER  "redis"
env_set QUEUE_CONNECTION "redis"

# === Mail (defaults - disabled by default) ===
env_set MAIL_MAILER     "log"        # Use "log" so it doesn't try to send real emails
env_set MAIL_HOST       "smtp.mailtrap.io"
env_set MAIL_PORT       "2525"
env_set MAIL_USERNAME   ""
env_set MAIL_PASSWORD   ""
env_set MAIL_ENCRYPTION "tls"
env_set MAIL_FROM_ADDRESS "no-reply@${APP_URL#https://}"
env_set MAIL_FROM_NAME  "\"${APP_NAME}\""

success ".env written (DB/Redis/Mail use defaults)"

# ── 6 · app key ───────────────────────────────────────────────
step "Generating application key"
php artisan key:generate --force
success "App key generated"

# ── 7 · storage permissions ───────────────────────────────────
step "Setting storage permissions"
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null \
    && success "Ownership set to www-data" \
    || warn "Could not chown to www-data (may need manual fix)"

# ── 8 · database ──────────────────────────────────────────────
step "Running database migrations"
info "Make sure your database '${DB_DATABASE}' exists and user '${DB_USERNAME}' has access."
php artisan migrate --seed --force
success "Database migrated and seeded"

# ── 9 · npm build ─────────────────────────────────────────────
step "Installing Node dependencies"
npm install
success "npm packages installed"

step "Building frontend assets"
npm run build
success "Frontend built"

# ── 10 · create admin user ────────────────────────────────────
step "Creating admin user"
php artisan p:user:make \
    --email="$ADMIN_EMAIL" \
    --username="$ADMIN_USERNAME" \
    --name-first="$ADMIN_FIRST" \
    --name-last="$ADMIN_LAST" \
    --password="$ADMIN_PASS" \
    --admin=1
success "Admin user created: ${ADMIN_FIRST} ${ADMIN_LAST} <${ADMIN_EMAIL}>"

# ── 11 · queue worker hint ────────────────────────────────────
step "Queue worker setup"
# (same as before)
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
    systemctl start  kroxy-queue.service
    success "Queue worker service installed and started"
else
    warn "systemd not found. Start manually: php ${INSTALL_DIR}/artisan queue:work"
fi

# ── 12 · done ─────────────────────────────────────────────────
step "Installation complete"

echo
echo -e "${WHITE}╔════════════════════════════════════════════════╗${RESET}"
echo -e "${WHITE}║          Kroxy Panel is ready!  🎉             ║${RESET}"
echo -e "${WHITE}╚════════════════════════════════════════════════╝${RESET}"
echo
echo -e "  ${BOLD}Panel URL   :${RESET} ${APP_URL}"
echo -e "  ${BOLD}Admin login :${RESET} ${ADMIN_EMAIL}"
echo -e "  ${BOLD}Installed to:${RESET} ${INSTALL_DIR}"
echo
echo -e "  ${YELLOW}Important:${RESET}"
echo -e "  • Update DB password in ${INSTALL_DIR}/.env"
echo -e "  • Point your web server root to ${INSTALL_DIR}/public"
echo -e "  • Set up SSL"
echo
