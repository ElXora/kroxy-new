# Kroxy Panel

A customised game server management panel built on Pterodactyl, featuring a black & white animated theme, Kxy currency system, AFK farming, a user-facing shop, and a server creation dashboard.

---

## Features

- **Black & White animated theme** — sleek minimal design with smooth transitions
- **Dashboard resource bars** — real-time RAM, CPU, disk, and server slot usage with colour-coded progress bars
- **Create Server page** — non-admin users can deploy servers using their resource pool
- **Kxy currency** — earn in-panel currency via AFK farming
- **AFK Farm page** — stay on the page to accumulate Kxy passively
- **Shop** — spend Kxy to buy more RAM, CPU, disk space, and server slots
- **Sidebar Kxy balance** — always-visible currency counter in the navigation bar

---

## Installation

### Requirements

- PHP 8.1+
- Composer 2+
- Node.js 18+ and npm 9+ (or yarn)
- MySQL 8 / MariaDB 10.3+
- Redis
- A web server (Nginx recommended)

### 1 — Clone the repository

```bash
git clone https://github.com/your-fork/kroxy-panel.git
cd kroxy-panel
```

### 2 — Install PHP dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 3 — Install Node dependencies and build frontend

```bash
npm install
npm run build
```

For development with hot-reload:

```bash
npm run dev
```

### 4 — Environment setup

```bash
cp .env.example .env
php artisan key:generate --force
```

Edit `.env` and set your database, Redis, mail, and app URL values:

```
APP_NAME="Kroxy"
APP_URL=https://panel.yourdomain.com

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kroxy
DB_USERNAME=kroxy
DB_PASSWORD=your_password

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 5 — Database setup

```bash
php artisan migrate --seed --force
```

### 6 — Set permissions

```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 7 — Queue worker (systemd service recommended)

```bash
php artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
```

### 8 — Create your first admin user

```bash
php artisan p:user:make
```

### 9 — Web server

Point your Nginx or Apache virtual host document root to the `public/` folder. Example Nginx config:

```nginx
server {
    listen 80;
    server_name panel.yourdomain.com;
    root /var/www/kroxy-panel/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

---

## Development

```bash
# Start dev server with hot-reload
npm run dev

# Type-check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test
php artisan test
```

---

## Kxy System

The Kxy currency is earned by using the AFK Farm page (default rate: **5 Kxy/minute**). Users can spend Kxy in the Shop to expand their resource pool:

| Item | Cost |
|------|------|
| 1 GB RAM | 100 Kxy |
| 4 GB RAM | 350 Kxy |
| 100% CPU | 280 Kxy |
| 20 GB Disk | 150 Kxy |
| 1 Server Slot | 200 Kxy |

To adjust rates, edit `resources/scripts/components/kroxy/AfkContainer.tsx` (`KXY_PER_MINUTE`) and `StoreContainer.tsx` (item prices). In a production deployment you would back these with database tables and API routes.

---

## License

MIT — see `LICENSE.md`
