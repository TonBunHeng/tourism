# 🧭 AngkorVerses Tourist Web Application (`tourism-travel`)

A full-featured, responsive, and modern tourist client web platform for the **AngkorVerses — Kingdom of Cambodia** tourism ecosystem.

This application provides an immersive travel planning experience for international visitors and domestic travelers, alongside dedicated portals for **Registered Tourists**, **Local Business Owners**, and **Certified Tour Guides**.

---

## 🚀 Tech Stack & Libraries

- **Framework:** [React 19](https://react.dev/) (Single Page Application)
- **Build Tool:** [Vite 8](https://vitejs.dev/) with Fast Refresh & vendor chunk splitting
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Routing:** [React Router v7](https://reactrouter.com/) with dual layout architectures:
  - `TravelUserLayout` for public discovery and tourist member pages (top navigation header)
  - `DashboardLayout` for Business Owner and Tour Guide management pages (sidebar & header)
- **Authentication:** [Laravel Sanctum](https://laravel.com/docs/sanctum) Bearer tokens & [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) (Google OAuth 2.0)
- **HTTP Client:** [Axios](https://axios-http.com/) with Bearer token injection and error interceptors
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts & Reports:** [Recharts](https://recharts.org/), [jsPDF](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable), and [SheetJS XLSX](https://sheetjs.com/)

---

## 🌐 Application Portals & Experience

The application is architected into three distinct functional experiences:

### 1. Public Tourist Discovery & Exploration
- **Destinations & Places:** Explore Cambodian historical temples, eco-reserves, beaches, and national monuments with interactive filters (province, category, entrance fee, rating).
- **Interactive Map & Coordinates:** View precise latitude/longitude, visiting hours, and admission fees.
- **25 Provinces Directory:** Dedicated guides for each province (Siem Reap, Phnom Penh, Battambang, Kampot, Mondulkiri, etc.).
- **Curated Tour Packages:** Multi-day organized excursions with day-by-day schedules and package booking.
- **Accredited Tour Guides:** Directory of official Ministry of Tourism certified guides with spoken languages, daily rates, and verified reviews.
- **Business Directory:** Discover local Khmer dining, eco-lodges, boutique resorts, and adventure services.
- **Cultural Events & Festivals:** Calendar of Cambodian national celebrations (Water Festival, Khmer New Year, Pchum Ben, Angkor Marathon).
- **4K Media Gallery:** High-resolution photographs, aerial drone videos, user comments, and view counters.
- **AI Travel Assistant:** Integrated Gemini AI chatbot, live weather advisory, currency converter (USD ↔ KHR), and transit fee estimator.
- **Ratings & Reviews:** Submit detailed reviews with 5-point sub-ratings (cleanliness, value, accessibility, hospitality) and photos.

### 2. Tourist Member Portal (`/travel-user/*`)
Authenticated travelers have access to their personal travel hub:
- **My Trips & Planner (`/trips`):** Create multi-day travel plans, add activities, track estimated costs, and reorder daily itineraries.
- **My Bookings (`/bookings`):** Track reservations made with local businesses and tour operators.
- **Wishlist & Favorites (`/wishlist`):** Save places to visit, toggle visited status, and organize bookmarks.
- **Achievements & Badges (`/achievements`):** Unlock gamified explorer milestones (*Heritage Explorer*, *Culture Enthusiast*, *Angkor Sunrise Chaser*).
- **Notification Center (`/notifications`):** Web push notifications, booking confirmations, and event reminders.
- **Privacy & GDPR Erasure (`/deletion-request`):** Submit self-service account or data deletion requests for Super Admin review.
- **Profile & Settings (`/profile`, `/settings`):** Manage avatar, bio, location, password, and notification preferences.

### 3. Business Owner Portal (`/business/*`)
Local enterprises (restaurants, boutique hotels, tour operators, craft shops) manage their presence:
- **Business Dashboard (`/business/dashboard`):** Real-time revenue metrics, customer reservations, and profile status.
- **Profile CRUD (`/business/businesses`):** Manage business listings, services, opening hours, photo galleries, and seasonal promotions.
- **Reservation Management (`/business/bookings`):** Review incoming customer bookings, confirm, reject, or mark completed.
- **Review Replies:** Post verified proprietor replies to customer feedback.
- **Performance Reports (`/business/reports`):** Download revenue summaries and customer booking statements as **CSV** or **JSON**.

### 4. Tour Guide & Content Editor Portal (`/guide/*`)
Certified guides and content contributors manage heritage listings:
- **Guide Dashboard (`/guide/dashboard`):** Submission stats, review inquiries, and uploaded destination status.
- **Draft Place Submissions (`/guide/places`):** Propose new attractions for Ministry admin verification.
- **Event Scheduling (`/guide/events`):** Submit cultural events and community gatherings.
- **Media Uploads (`/guide/gallery`):** Contribute photo assets and drone videos.
- **Tourist Inquiries & Review Engagement (`/guide/inquiries`, `/guide/reviews`).

---

## 🔑 Default Test Accounts

| Role | Email | Password | Target Experience |
|---|---|---|---|
| **Tourist (User)** | `vit.vong@example.com` | `password123` | Public Portal & Tourist Dashboard (`/travel-user`) |
| **Local Explorer** | `ou.sreylin@example.com` | `password123` | Public Portal & Tourist Dashboard (`/travel-user`) |
| **Business Owner** | `owner@angkor-restaurant.com` | `password123` | Business Management Hub (`/business/dashboard`) |
| **Tour Guide / Editor** | `sopheaktra@tourism.gov.kh` | `password123` | Guide Portal (`/guide/dashboard`) |

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: `v20+` or `v22+`
- **npm**: `v10+`
- **Running Backend API**: Laravel backend active on `http://localhost:8000`

### 2. Configure Environment Variables
Create a `.env` file in the `tourism-travel/` root:

```env
# Backend API URL pointing to the /api/travel prefix
VITE_API_URL=http://localhost:8000/api/travel

# Google OAuth 2.0 Web Client ID
VITE_GOOGLE_CLIENT_ID=992178086409-a9j45bl7piu53vlfbihe1c9sgpv0itsb.apps.googleusercontent.com
```

*(For Local LAN testing across mobile devices on your Wi-Fi, replace `localhost` with your machine's IP, e.g. `http://192.168.1.11:8000/api/travel`)*

### 3. Install Dependencies & Start Dev Server

```bash
# 1. Navigate to the project directory
cd tourism-travel

# 2. Install all dependencies
npm install

# 3. Start Vite development server (runs on port 5175 by default)
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

To launch the tourist web application within the centralized Docker orchestration:

```bash
# From repository root:
docker compose -f tourism-docker/docker-compose.yml up -d travel

# Or from within tourism-docker/:
cd tourism-docker
docker compose up -d travel
```

The web application is exposed on **[http://localhost:5175](http://localhost:5175)**.

---

## 🏛️ Project Directory Structure

```text
tourism-travel/
├── src/
│   ├── assets/               # Static graphics, icons, and hero images
│   ├── components/
│   │   ├── common/           # PlaceCard, EventCard, ProvinceCard, AuthModal, Pagination
│   │   ├── layout/           # Header, Footer, MobileNav, SearchBar
│   │   ├── reviews/          # ReviewModal, RatingStars, ReviewCard
│   │   ├── chat/             # Floating AI ChatWidget & Tourism Assistant
│   │   └── business/         # Business-specific components & modals
│   ├── context/
│   │   ├── AuthContext.jsx   # Tourist & business session, Google OAuth login, token state
│   │   └── TravelContext.jsx # Global wishlist, active filters, and toast notifications
│   ├── layouts/
│   │   ├── TravelUserLayout/ # Top navigation bar layout for tourists and public exploration
│   │   └── DashboardLayout/  # Sidebar & header dashboard layout for Business Owners & Guides
│   ├── routes/
│   │   ├── AppRoutes.jsx     # Central route definitions
│   │   ├── ProtectedRoute.jsx# Role-based route guard
│   │   └── PublicRoute.jsx   # Guest-only guard
│   ├── services/
│   │   ├── achievementService.js     # Tourist badges & gamification
│   │   ├── aiService.js              # Gemini AI chat, weather, currency & transit
│   │   ├── api.js                    # Axios HTTP client with Bearer token interceptor
│   │   ├── authService.js            # Register, login, Google OAuth, profile, password
│   │   ├── bookingService.js         # Customer & tourist reservations
│   │   ├── businessService.js        # Business directory, hours, services, promotions
│   │   ├── categoryService.js        # Tourist categories & themes
│   │   ├── chatService.js            # Live chat support messaging
│   │   ├── contactService.js         # Public inquiry submission
│   │   ├── deletionRequestService.js # GDPR erasure requests
│   │   ├── eventService.js           # Cultural events & national festivals
│   │   ├── favoriteService.js        # Wishlist & visited places
│   │   ├── galleryService.js         # 4K photography, drone videos & comments
│   │   ├── guideService.js           # Accredited tour guides directory
│   │   ├── notificationService.js    # Web Push notifications & unread alerts
│   │   ├── placeService.js           # Destinations, attractions & search
│   │   ├── provinceService.js        # 25 Cambodian provinces
│   │   ├── reviewService.js          # Ratings, reviews & guide replies
│   │   ├── settingService.js         # Emergency hotlines & public settings
│   │   ├── tourService.js            # Curated tour packages
│   │   └── tripService.js            # Multi-day itineraries & trip planner
│   ├── pages/
│   │   ├── about/            # About AngkorVerses platform
│   │   ├── achievements/     # Gamified badges & tourist accomplishments
│   │   ├── auth/             # Login, Register, Google OAuth modals & pages
│   │   ├── bookings/         # Tourist's personal bookings list
│   │   ├── business/         # Business Owner Dashboard, listings, bookings & reports
│   │   ├── businesses/       # Public business directory & business details
│   │   ├── categories/       # Category directory & associated places
│   │   ├── contact/          # Contact us & emergency hotlines
│   │   ├── dashboard/        # Unified management dashboard redirect
│   │   ├── delete/           # Deletion & privacy request form
│   │   ├── destinations/     # Destination discovery
│   │   ├── error/            # 404 Not Found & 403 Forbidden pages
│   │   ├── events/           # Upcoming cultural festivals & details
│   │   ├── favorites/        # Saved wishlist destinations
│   │   ├── galleries/        # Media photo & video explorer
│   │   ├── guide/            # Tour Guide portal (places, events, gallery, reviews)
│   │   ├── guides/           # Public accredited tour guides directory & profile
│   │   ├── home/             # Landing page with hero banner, featured destinations & AI teaser
│   │   ├── notifications/    # Notification list & settings
│   │   ├── places/           # Detailed place search, filters & PlaceDetails view
│   │   ├── profile/          # User profile view & edit
│   │   ├── provinces/        # 25 Provinces directory & ProvinceDetails view
│   │   ├── reviews/          # All reviews listing & filter
│   │   ├── settings/         # User preferences & privacy
│   │   ├── tours/            # Curated tour packages & TourDetails view
│   │   ├── travel-user/      # Dedicated Tourist Member overview dashboard
│   │   └── trips/            # Multi-day trip planner & day-by-day itineraries
│   ├── styles/
│   │   └── globals.css       # Custom animations, design tokens & scrollbar styling
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Tailwind CSS imports
├── Dockerfile                # Container build definition (Port 5175)
├── package.json
└── vite.config.js            # Vite configuration with host: '0.0.0.0' and port 5175
```
