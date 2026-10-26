# 🏛️ AngkorVerses Admin Management Portal (`tourism-admin`)

A modern, high-performance administrative dashboard and moderation control hub for the **AngkorVerses — Kingdom of Cambodia** tourism ecosystem.

This management portal empowers Ministry administrators, regional supervisors, and certified tourism content editors to curate heritage destinations, moderate tourist reviews, approve business listings, track live user activity, and maintain system security.

---

## 🚀 Tech Stack & Libraries

- **Framework:** [React 19](https://react.dev/) (Single Page Application)
- **Build Tool:** [Vite 8](https://vitejs.dev/) with Fast Refresh & vendor chunk splitting
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Routing:** [React Router v7](https://reactrouter.com/) with nested layout route guards
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts & Visualization:** [Recharts](https://recharts.org/)
- **HTTP Client:** [Axios](https://axios-http.com/) with JWT Bearer token authentication & automatic 401 interceptors
- **Exporting & Reporting:** [jsPDF](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), [html2canvas](https://html2canvas.hertzen.com/), and [SheetJS XLSX](https://sheetjs.com/)

---

## 📋 Features & Functional Modules

| Module | Route | Access Level | Description |
|---|---|---|---|
| **Executive Dashboard** | `/dashboard` | All Staff | Real-time statistics, monthly visit charts, pending verification counters, and quick actions |
| **Destinations / Places** | `/places` | All Staff | Full CRUD over Cambodian destinations, multi-image uploads, entrance fees, and approval status |
| **Bookings Management** | `/bookings` | All Staff | Monitor reservations across registered businesses and tours, view customer info, and update status |
| **Curated Tour Packages** | `/tours` | All Staff | Manage multi-day travel itineraries, pricing, highlights, schedules, and active statuses |
| **Tour Guides Directory** | `/guides` | All Staff | Accredited guide profiles, license tracking, spoken languages, daily rates, and star ratings |
| **Categories & Themes** | `/categories` | All Staff | Categorize tourist spots (Temples, Eco-Tourism, Coastal, Cultural, Gastronomy) |
| **Provinces Directory** | `/provinces` | All Staff | Manage all 25 Cambodian provinces, provincial summaries, and attraction counts |
| **Cultural Events** | `/events` | All Staff | National festivals, religious ceremonies, and regional cultural schedules |
| **Media Galleries** | `/galleries` | All Staff | 4K photographic assets, aerial drone footage, tags, view metrics, and media comments |
| **Reviews & Ratings** | `/ratings` | All Staff | Tourist reviews moderation queue (Approve/Reject) and official staff replies |
| **Review Analytics** | `/ratings/analytics` | All Staff | Star distribution charts, sentiment metrics, and destination satisfaction scoring |
| **Wishlist & Favorites** | `/favorites` | All Staff | Tourist favorites metrics, top saved landmarks, and visited status tracking |
| **Favorites Analytics** | `/favorites/analytics` | All Staff | Geographical interest heatmaps and traveler preference analytics |
| **Notifications Center** | `/notifications` | All Staff | System alert dispatch, push notification preferences, and broadcast management |
| **Staff Profile** | `/profile` | All Staff | Personal staff credentials, avatar image upload, and password update |
| **Business Directory** | `/businesses` | Admin & Super Admin | Review business owner applications, approve/reject listings, verify documents, and suspend operators |
| **User Management** | `/users` | Admin & Super Admin | Manage accounts across all 5 RBAC roles, toggle account status (`Active`/`Suspended`), 2FA monitoring |
| **Reports & Analytics** | `/reports` | Admin & Super Admin | Comprehensive revenue, bookings, and user reports with instant **PDF** and **Excel (.xlsx)** export |
| **Reports Analytics** | `/reports/analytics` | Admin & Super Admin | Visual analytical trend lines, gross booking revenue, and seasonal travel surges |
| **Security & IP Defense** | `/security` | Admin & Super Admin | Login attempt logs, brute-force intrusion defense, and manual/automated IP address blocking |
| **Live User Tracking** | `/tracking-users` | Admin & Super Admin | Real-time online user presence, active device sessions, and chronological audit trail logs |
| **GDPR Deletion Queue** | `/deletion-requests` | **Super Admin Only** | Super Admin moderation pipeline to review and permanently purge account or content deletion requests |
| **System Settings** | `/settings` | Admin & Super Admin | Platform branding, emergency hotlines (Police, Ambulance, Fire), and localization defaults |

---

## 🔐 Role-Based Access Control (RBAC)

The portal applies layered route guards via [ProtectedRoute.jsx](file:///Users/bunheng/Desktop/tourism/tourism-admin/src/routes/ProtectedRoute.jsx) and [AppRoutes.jsx](file:///Users/bunheng/Desktop/tourism/tourism-admin/src/routes/AppRoutes.jsx):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ALL_ADMIN_ROLES                                 │
│          (Super Admin, Admin, Tourism Content Editor)                  │
│  Dashboard, Places, Bookings, Tours, Guides, Events, Galleries,        │
│  Categories, Provinces, Reviews & Replies, Favorites, Notifications    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    PRIVILEGED_ADMIN_ROLES                              │
│                    (Super Admin, Admin)                                │
│  Business Moderation & Approval, User Management, Reports & Export,    │
│  Security & IP Blocking, Live User Tracking, System Settings           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   SUPER_ADMIN_ONLY_ROLES                               │
│                       (Super Admin)                                    │
│  GDPR Deletion Requests Approval & Permanent Database Data Purge       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Default Staff Credentials

Use these seeded accounts to log in at [http://localhost:5174](http://localhost:5174):

| Name | Role | Email | Password | Access Level |
|---|---|---|---|---|
| **Ton Bunheng** | **Super Admin** (`super_admin`) | `admin@tourism.gov.kh` | `password123` | Full global access (including Deletion Requests) |
| **Kosal Visal** | **Admin** (`admin`) | `staff.admin@tourism.gov.kh` | `password123` | Full admin access (businesses, users, security, reports) |
| **Sophal Sopheaktra** | **Tourism Content Editor** (`guide_editor`) | `sopheaktra@tourism.gov.kh` | `password123` | Content, places, events, tours, galleries, and reviews |

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm**: `v10+`
- **Running Backend API**: Laravel backend active on `http://localhost:8000`

### 2. Configure Environment Variables
Create a `.env` file in the `tourism-admin/` root:

```env
# URL pointing to the Laravel Backend API Admin routes
VITE_API_URL=http://localhost:8000/api
```

*(For local network testing on mobile/tablet devices, replace `localhost` with your LAN IP, e.g. `http://192.168.1.11:8000/api`)*

### 3. Install Dependencies & Start Dev Server

```bash
# 1. Navigate to the project directory
cd tourism-admin

# 2. Install all dependencies
npm install

# 3. Start Vite development server (runs on port 5174 by default)
npm run dev
```

### 4. Build for Production

```bash
# Validate and build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🐳 Docker Deployment

To run the admin panel within the centralized Docker orchestration:

```bash
# From repository root:
docker compose -f tourism-docker/docker-compose.yml up -d admin

# Or from within tourism-docker/:
cd tourism-docker
docker compose up -d admin
```

The admin panel is exposed on **[http://localhost:5174](http://localhost:5174)**.

---

## 📁 Directory Structure

```text
tourism-admin/
├── src/
│   ├── assets/              # Static icons, logos, and images
│   ├── components/
│   │   ├── common/          # Reusable UI widgets, search bars, pagination, badges
│   │   ├── layout/          # Sidebar navigation, top header, breadcrumbs
│   │   └── modals/          # Confirmation dialogs, review reply modals, edit forms
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentication state, login/logout, staff session token
│   │   ├── SearchContext.jsx# Global multi-page search filter state
│   │   └── ThemeContext.jsx # Light/dark appearance toggling
│   ├── layouts/
│   │   └── Main.jsx         # Administrative dashboard shell with sidebar & header
│   ├── pages/
│   │   ├── auth/            # Staff Login & password recovery
│   │   ├── bookings/        # Customer bookings management & status updates
│   │   ├── businesses/      # Business verification queue & operator management
│   │   ├── categories/      # Tourist attraction categories
│   │   ├── dashboard/       # Statistical summary, Recharts widgets & pending queues
│   │   ├── delete/          # Super Admin GDPR deletion request moderation queue
│   │   ├── error/           # 404 Not Found & 403 Forbidden screens
│   │   ├── events/          # Festivals & cultural event management
│   │   ├── favorites/       # Wishlist analytics & tourist destination interest
│   │   ├── galleries/       # 4K photography & aerial video asset management
│   │   ├── guides/          # Licensed tour guides directory & profile verification
│   │   ├── notifications/   # System-wide alert dispatch & push notification settings
│   │   ├── places/          # Heritage places, coordinates, ticket fees & draft review
│   │   ├── profiles/        # Staff account profile & security settings
│   │   ├── provinces/       # 25 Cambodian provinces management
│   │   ├── ratings/         # Review moderation queue, replies & rating analytics
│   │   ├── reports/         # PDF and Excel XLSX statistical exports
│   │   ├── security/        # Security alarms, failed login attempts & IP blocking
│   │   ├── settings/        # Emergency hotlines, contact info & portal configuration
│   │   ├── tours/           # Curated multi-day tour package curation
│   │   ├── tracking/        # Real-time online user presence & audit logs
│   │   └── users/           # User account directory, roles, and status controls
│   ├── routes/
│   │   ├── AppRoutes.jsx    # Application routing definitions & role access tiers
│   │   ├── ProtectedRoute.jsx# Role-based route guard
│   │   └── PublicRoute.jsx  # Guest-only route guard (redirects if authenticated)
│   ├── services/
│   │   └── api.js           # Axios HTTP client with Bearer auth token interceptors
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css            # Tailwind CSS styling directives
├── Dockerfile               # Container build definition (Port 5174)
├── package.json
└── vite.config.js           # Vite configuration with Tailwind CSS v4 & host: '0.0.0.0'
```
