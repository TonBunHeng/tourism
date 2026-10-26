# 🇰🇭 AngkorVerses Tourism Portal — Full System

A complete full-stack tourism management and tourist experience platform for the **AngkorVerses — Kingdom of Cambodia**.

The platform is composed of a unified Laravel REST API backend, a dedicated React 19 administrative portal, and a tourist client web application.

---

## 📚 Component Documentation Links

- **Backend REST API:** [tourism-backend-api/README.md](file:///Users/bunheng/Desktop/tourism/tourism-backend-api/README.md) — Comprehensive API reference, RBAC endpoints, seeder details, and moderation workflows.
- **Admin Management Panel:** [tourism-admin/README.md](file:///Users/bunheng/Desktop/tourism/tourism-admin/README.md) — Administrative dashboards, review moderation, business verification, live user tracking, and security controls.
- **Tourist Web Application:** [tourism-travel/README.md](file:///Users/bunheng/Desktop/tourism/tourism-travel/README.md) — Tourist exploration, trip planner, business directory, booking system, and AI travel assistant.

---

## 🏛️ Project Directory Structure

```text
tourism/
├── README.md                      # Global project documentation & instructions
├── aichatbot/                     # AI Tourism Chatbot Microservice (FastAPI, Python 3.9+, RAG, Port 8001)
│   ├── run.py                     # Entrypoint server script
│   ├── app/                       # FastAPI routes, models & RAG orchestrator
│   └── storage/tourism/           # Curated Cambodia tourism datasets & vector storage
├── tourism-docker/                # Centralized Docker orchestration directory
│   └── docker-compose.yml         # Main Docker Compose multi-service configuration
├── tourism-backend-api/           # Laravel 12/13 REST API (PHP 8.4 FPM, Sanctum, MySQL)
│   ├── Dockerfile
│   └── docker/
│       ├── entrypoint.sh          # Auto-migration, auto-seeding & permission setup
│       └── nginx/default.conf     # Nginx FastCGI configuration
├── tourism-admin/                 # Admin Management Web App (React 19, Vite 8, Tailwind CSS v4)
│   └── Dockerfile
└── tourism-travel/                # Tourist Client Web App (React 19, Vite 8, Tailwind CSS v4)
    └── Dockerfile
```

---

## 🐳 Docker Architecture & Services

All Docker configurations are centralized inside `tourism-docker/`.

| Service | Container Name | Port | Description |
|---|---|---|---|
| **nginx** | `tourism-nginx` | `8000` | Nginx Reverse Proxy exposing the Laravel backend API |
| **backend** | `tourism-backend` | `9000` (internal) | Laravel API (PHP 8.4 FPM, Composer, Auto-migrations & Database Seeders) |
| **admin** | `tourism-admin` | `5174` | Admin Management Web App (React 19, Vite, Tailwind CSS v4) |
| **travel** | `tourism-travel` | `5175` | Tourist Client Web App (React 19, Vite, Tailwind CSS v4) |
| **mysql** | `tourism-mysql` | `3306` | MySQL 8.0 Database with persistent data volume (`tourism-mysql-data`) |

---

## 🚀 How to Run with Docker

### 1. Start all containers

```bash
# Navigate to the tourism-docker directory:
cd tourism-docker

# Build and start all services in the background:
docker compose up -d --build
```

*(Alternatively, run from the root folder without changing directory: `docker compose -f tourism-docker/docker-compose.yml up -d --build`)*

### 2. Check container status & logs

```bash
cd tourism-docker

# Check status of all containers
docker compose ps

# View live real-time logs across all services
docker compose logs -f

# View logs for a specific service (e.g. backend)
docker compose logs -f backend
```

### 3. Stop containers

```bash
cd tourism-docker

# Stop containers (preserves database data)
docker compose down

# Stop containers and reset database volume (fresh start)
docker compose down -v
```

---

## 💻 How to Run Locally (Standalone / Without Docker)

If you prefer developing outside of Docker:

### 1. Backend API (`tourism-backend-api`)
```bash
cd tourism-backend-api
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite  # If using SQLite
php artisan migrate --seed
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. Admin Portal (`tourism-admin`)
```bash
cd tourism-admin
npm install
# Ensure .env has: VITE_API_URL=http://localhost:8000/api
npm run dev
# Running on http://localhost:5174
```

### 3. Tourist Web App (`tourism-travel`)
```bash
cd tourism-travel
npm install
# Ensure .env has: VITE_API_URL=http://localhost:8000/api/travel and VITE_AI_CHAT_URL=http://localhost:8001
npm run dev
# Running on http://localhost:5175
```

### 4. AI Chatbot Microservice (`aichatbot`)
```bash
cd aichatbot
# Activate local virtual environment:
source venv/bin/activate
# Start local FastAPI server:
python run.py
# Running on http://localhost:8001 (FastAPI + Grounded RAG)
```

---

## 🌐 Application Access URLs

Once running, access the services in your browser:

- **Tourist Web Application:** [http://localhost:5175](http://localhost:5175)
- **Admin Management Panel:** [http://localhost:5174](http://localhost:5174)
- **Backend API Root:** [http://localhost:8000/](http://localhost:8000/)
- **Backend API Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **AI Chatbot API Docs:** [http://localhost:8001/docs](http://localhost:8001/docs)
- **AI Chatbot Health Check:** [http://localhost:8001/api/health](http://localhost:8001/api/health)
- **Direct Database Access:** `localhost:3306`
  - **Database:** `tourism_db`
  - **Username:** `root`
  - **Password:** *(empty / no password)*

---

## 🔑 Default Seeded Accounts

The backend automatically runs migrations and seeds default test data on first launch:

| Name | Role | Email | Password | Access Portal |
|---|---|---|---|---|
| **Ton Bunheng** | **Super Admin** (`super_admin`) | `admin@tourism.gov.kh` | `password123` | [Admin Panel (Port 5174)](http://localhost:5174) |
| **Kosal Visal** | **Admin** (`admin`) | `staff.admin@tourism.gov.kh` | `password123` | [Admin Panel (Port 5174)](http://localhost:5174) |
| **Sophal Sopheaktra** | **Content Editor / Guide** (`guide_editor`) | `sopheaktra@tourism.gov.kh` | `password123` | [Admin Panel (Port 5174)](http://localhost:5174) & [Tourist Guide Portal](http://localhost:5175/guide/dashboard) |
| **Sokha Chanthou** | **Business Owner** (`business_owner`) | `owner@angkor-restaurant.com` | `password123` | [Tourist Web Business Hub (Port 5175)](http://localhost:5175/business/dashboard) |
| **VIT Vong** | **Tourist (User)** (`user`) | `vit.vong@example.com` | `password123` | [Tourist Web App (Port 5175)](http://localhost:5175) |
| **Ou Sreylin** | **Local Explorer** (`user`) | `ou.sreylin@example.com` | `password123` | [Tourist Web App (Port 5175)](http://localhost:5175) |

---

## 🛠️ Handy Artisan & Database Commands

Run commands from the `tourism-docker` directory:

```bash
# Check all database tables
docker compose exec mysql mysql -u root tourism_db -e "SHOW TABLES;"

# Formatted database schema and row counts via Laravel
docker compose exec backend php artisan db:show

# Run fresh migrations and re-seed database
docker compose exec backend php artisan migrate:fresh --seed

# Clear Laravel caches
docker compose exec backend php artisan optimize:clear

# Interactive MySQL shell
docker compose exec mysql mysql -u root tourism_db

# Interactive PHP Tinker
docker compose exec backend php artisan tinker
```
