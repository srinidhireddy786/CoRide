# CoRide — Complete Architecture Document

> **Tagline:** Ride Together, Save Together  
> **Domain:** Ride-sharing / Carpooling for **Hyderabad, India**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [System Architecture](#4-system-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Authentication Flow](#9-authentication-flow)
10. [Data Flows](#10-data-flows)
11. [Key Features & Implementation Details](#11-key-features--implementation-details)
12. [Component Tree](#12-component-tree)
13. [External Services](#13-external-services)
14. [Deployment](#14-deployment)
15. [Known Issues & Notes](#15-known-issues--notes)

---

## 1. Project Overview

CoRide is a full-stack ride-sharing application that connects drivers with available seats to passengers traveling in the same direction. It is geographically focused on Hyderabad, India, with popular routes pre-configured for quick selection.

### Primary Use Cases

| Role | Capabilities |
|------|-------------|
| **Driver** | Register vehicles, publish rides (route + schedule), manage passenger requests, share GPS location live, in-app chat |
| **Passenger** | Search available rides, request seats, track driver's live location, chat, rate completed rides |

---

## 2. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 18.3.1 |
| **Build Tool** | Vite | 5.4 |
| **Routing** | React Router DOM | 6.26 |
| **Animations** | Framer Motion | 12.40 |
| **Maps** | TomTom Web SDK Maps + Services | 6.25 |
| **Icons** | Material Symbols (Google) | — |
| **Notifications** | React Hot Toast | 2.4.1 |
| **Date Formatting** | date-fns | 3.6 |
| **Backend Framework** | FastAPI | 0.115 |
| **ASGI Server** | Uvicorn | 0.31 |
| **Database** | PostgreSQL (via asyncpg) | 0.30 |
| **SQL Toolkit** | SQLAlchemy (async) | 2.0.35 |
| **Auth (JWT)** | PyJWT (HS256) | 2.9 |
| **Password Hashing** | Passlib + bcrypt | 1.7.4 / 4.0.1 |
| **Frontend Hosting** | Vercel | — |
| **Backend Hosting** | Railway (Nixpacks) | — |
| **Database Hosting** | Supabase PostgreSQL | — |
| **Geocoding** | TomTom Geocoding API | — |
| **Routing** | TomTom Routing API (with traffic) | — |

---

## 3. Directory Structure

```
CoRide/
├── .gitignore
├── README.md
├── run.ps1                          # Launches frontend + backend in separate windows
├── CoRide.docx
│
├── backend/
│   ├── .env                          # DB credentials, JWT secret, CORS origin
│   ├── .env.example
│   ├── config.py                     # Env loading & constants
│   ├── database.py                   # asyncpg connection pool
│   ├── auth.py                       # JWT creation/decoding, password hashing
│   ├── main.py                       # FastAPI app, CORS, router includes
│   ├── requirements.txt
│   ├── runtime.txt                   # python-3.12
│   ├── railway.json                  # Nixpacks deployment config
│   └── routers/
│       ├── __init__.py
│       ├── auth.py                   # /api/auth/* endpoints
│       ├── rides.py                  # /api/rides/* endpoints
│       ├── vehicles.py               # /api/vehicles/* endpoints
│       ├── requests.py               # /api/requests/* endpoints
│       ├── chat.py                   # /api/chat/* endpoints
│       ├── ratings.py                # /api/ratings/* endpoints
│       ├── profile.py                # /api/profile/* endpoints
│       └── notifications.py         # /api/notifications/* endpoints
│
└── frontend/
    ├── .env                          # VITE_API_URL (backend URL)
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── vercel.json                   # SPA rewrite rules for Vercel
    └── src/
        ├── main.jsx                  # React entry point
        ├── App.jsx                   # Router definition
        ├── index.css                 # Global styles + Tailwind-like classes
        ├── contexts/
        │   └── AuthContext.jsx        # Global auth state provider
        ├── hooks/
        │   ├── useScrollReveal.js     # IntersectionObserver scroll animations
        │   ├── useRideStatus.js       # Poll ride detail periodically
        │   ├── useRealtime.js         # (Unused) Supabase Realtime hook
        │   └── useLocation.js         # Browser Geolocation API wrapper
        ├── lib/
        │   ├── supabase.js            # Supabase client (mostly unused)
        │   ├── auth.js                # Login/signup API calls
        │   ├── api.js                 # Base fetch wrapper with JWT interceptor
        │   ├── tomtom.js              # TomTom Geocoding + Routing + Fuzzy Search
        │   ├── hyderabad.js           # Pre-defined popular routes data
        ├── components/
        │   ├── auth/
        │   │   ├── Login.jsx
        │   │   └── Register.jsx
        │   ├── layout/
        │   │   └── Navbar.jsx
        │   ├── rides/
        │   │   ├── PublishRide.jsx
        │   │   └── RideCard.jsx
        │   ├── bookings/
        │   │   ├── RequestButton.jsx
        │   │   └── RequestList.jsx
        │   ├── AddressAutocomplete.jsx  # TomTom Fuzzy Search autocomplete dropdown
        │   ├── chat/
        │   │   └── ChatWindow.jsx
        │   ├── map/
        │   │   ├── RouteMap.jsx
        │   │   └── LiveTracker.jsx
        │   ├── notifications/
        │   │   └── NotificationBell.jsx
        │   ├── ratings/
        │   │   └── RatingModal.jsx
        │   └── vehicles/
        │       └── AddVehicle.jsx
        └── pages/
            ├── Home.jsx               # Landing page
            ├── Dashboard.jsx          # Main user hub
            ├── SearchRides.jsx        # Find rides
            ├── MyRides.jsx            # Offered / Joined tabs
            ├── RideDetailPage.jsx     # Full ride detail + map + chat
            ├── ChatPage.jsx           # Full-screen chat
            └── ProfilePage.jsx        # Edit profile
```

---

## 4. System Architecture

```
┌───────────────────────────────────────────────┐
│              Frontend (React + Vite)           │
│  Port 5173 (Dev) / Vercel (Prod)              │
│                                               │
│  React Router ──► AuthContext ──► API Client  │
│       │                │              │        │
│       ▼                ▼              ▼        │
│  Pages ─── Components ─── Hooks ─── Library    │
│                                               │
│  TomTom Maps SDK (Maps)  TomTom API (Routing   │
│  + Geocoding)  (Client-side calls)             │
└──────────────────────┬────────────────────────┘
                       │ HTTP REST (JSON)
                       │ Bearer Token Auth
                       ▼
┌───────────────────────────────────────────────┐
│              Backend (FastAPI + Uvicorn)        │
│  Port 8000 (Dev) / Railway (Prod)             │
│                                               │
│  Middleware: CORS, JWT Auth via Dependency     │
│                                               │
│  Routers:                                      │
│  ┌──────┬───────┬──────┬────────┬──────┬───┐  │
│  │ Auth │ Rides │ Veh. │ Reqs   │ Chat │ ..│  │
│  └──┬───┴───┬───┴──┬───┴───┬────┴──┬───┴───┘  │
│     │       │      │       │       │           │
│     ▼       ▼      ▼       ▼       ▼           │
│         asyncpg Connection Pool                │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │   PostgreSQL (Supabase)  │
          │                         │
          │  Tables:                │
          │  users, vehicles,       │
          │  rides, ride_requests,  │
          │  ride_participants,     │
          │  chat_messages,         │
          │  notifications, ratings │
          └─────────────────────────┘
```

---

## 5. Frontend Architecture

### 5.1 Route Structure

| Path | Component | Auth Required | Description |
|------|-----------|---------------|-------------|
| `/` | Home | No (guest) | Marketing landing page. Redirects to `/dashboard` if logged in. |
| `/login` | Login | No (guest-only) | Login form. Redirects to `/dashboard` if already logged in. |
| `/register` | Register | No (guest-only) | Signup form. Redirects to `/dashboard` if already logged in. |
| `/dashboard` | Dashboard | Yes | Main hub with "Offer a Ride" / "Find a Ride" cards. |
| `/search` | SearchRides | Yes | Search rides by source, destination, date. Popular routes grid. |
| `/my-rides` | MyRides | Yes | Tabbed view: Offered rides / Joined rides. |
| `/rides/:id` | RideDetailPage | Yes | Full ride detail: info, map, requests, chat, live tracking, rating. |
| `/chat/:rideId` | ChatPage | Yes | Full-screen chat interface. |
| `/profile` | ProfilePage | Yes | Edit name, phone, view stats. |

### 5.2 State Management

**Global state:** React Context (`AuthContext.jsx`)

```
AuthContext provides:
  - user: { id, name, email, phone, avg_rating, total_ratings, ... } | null
  - loading: boolean
  - login(email, password): Promise<void>
  - logout(): void
  - setUser(user): void
```

**Local state:** Every component manages its own data with `useState` + `useEffect`. No Redux, no Zustand.

**Token storage:**
- JWT stored in `localStorage` key: `coride_token`
- User profile cached in `localStorage` key: `coride_user`
- Reads from `api.js` which attaches `Authorization: Bearer <token>` header

**Real-time:** HTTP polling only — no WebSockets.

### 5.3 Core Library Files

| File | Purpose |
|------|---------|
| `lib/api.js` | Base fetch wrapper. Automatically attaches JWT, handles 401 redirect to /login, base URL from env. |
| `lib/auth.js` | Login/signup API calls (don't use api.js — they call backend directly without token). |
| `lib/tomtom.js` | TomTom Geocoding, Fuzzy Search (autocomplete), and Routing APIs. Returns { lat, lon, formattedAddress } for geocoding, { distanceMeters, durationSeconds, trafficDurationSeconds, routeGeometry } for routing. |
| `lib/hyderabad.js` | 12 pre-defined popular Hyderabad routes for quick search selection. |
| `lib/supabase.js` | Supabase client. Currently only used by unused `useRealtime` hook. |

### 5.4 Custom Hooks

| Hook | Purpose |
|------|---------|
| `useScrollReveal` | IntersectionObserver-based scroll animation. Returns a ref to attach to elements. |
| `useRideStatus` | Polls `GET /api/rides/{id}` every 3 seconds. Returns { ride, loading, error }. Used for live tracking. |
| `useRealtime` | **Unused.** Supabase Realtime subscription wrapper. |
| `useLocation` | Wraps browser Geolocation API. Returns { latitude, longitude, error, loading, startWatching, stopWatching }. |

### 5.5 Styling Approach

- Custom CSS in `index.css` with a consistent design system (CSS custom properties for colors, shadows, border-radius).
- No Tailwind CSS — uses hand-written utility classes and component styles.
- Responsive breakpoints for mobile/tablet/desktop.
- Framer Motion for page transitions, micro-interactions, skeleton loaders.

---

## 6. Backend Architecture

### 6.1 Application Structure

```
main.py
  ├── FastAPI app with CORS middleware
  ├── Lifespan handler: init DB pool on startup, close on shutdown
  └── Include all 8 routers under /api prefix

config.py
  ├── Load .env via python-dotenv
  └── Constants: DATABASE_URL, JWT_SECRET, CORS_ORIGIN

database.py
  ├── asyncpg connection pool (create_pool)
  └── get_pool() / close_pool()

auth.py
  ├── hash_password(password) -> str
  ├── verify_password(password, hash) -> bool
  ├── create_token(user_id) -> str  (JWT, HS256, 72h expiry)
  ├── verify_token(token) -> dict
  └── get_current_user(token=Depends(oauth2_scheme)) -> UUID
```

### 6.2 Router Details

#### `routers/auth.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| POST | `/api/auth/signup` | No | Validate fields, hash password, insert into `users`, return JWT + user |
| POST | `/api/auth/login` | No | Find user by email, verify password, return JWT + user |
| GET | `/api/auth/me` | Yes | Return current user profile from DB |

#### `routers/rides.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/rides` | Yes | Search: `from_city`, `to_city`, `date` params. Exclude own rides. Filter by `open` status. |
| POST | `/api/rides` | Yes | Insert ride. Deducts `available_seats` by 1 (driver's seat). Adds driver to `ride_participants`. |
| GET | `/api/rides/my` | Yes | Return rides where current user is owner |
| GET | `/api/rides/joined` | Yes | Return rides where current user is participant (accepted requests) |
| GET | `/api/rides/{ride_id}` | Yes | Full ride detail + user's booking status if applicable |
| PATCH | `/api/rides/{ride_id}/status` | Yes | Owner only. Transition: open→in_progress, in_progress→completed, any→cancelled. Updates timestamps. |
| PATCH | `/api/rides/{ride_id}/location` | Yes | Owner only. Updates `driver_lat`, `driver_lng`, `last_updated`. |

#### `routers/vehicles.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/vehicles` | Yes | Return all vehicles for current user |
| POST | `/api/vehicles` | Yes | Insert vehicle. Check unique registration number. |

#### `routers/requests.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/requests/ride/{ride_id}` | Yes | Owner only. Return all requests for their ride with passenger info. |
| POST | `/api/requests/ride/{ride_id}` | Yes | Create request. Check: ride exists, not owner, not already requested, not accepted, seats available. |
| PATCH | `/api/requests/{request_id}` | Yes | Update status. Owner can accept/reject. Original requester can cancel. Creates notification. |

#### `routers/chat.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/chat/{ride_id}` | Yes | Get messages. Optional `?after_id` for incremental polling. Returns only if user is participant. |
| POST | `/api/chat/{ride_id}` | Yes | Create message. Max 500 chars. Requires user to be ride participant. |

#### `routers/ratings.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/ratings/check/{ride_id}` | Yes | Returns whether user has already rated this ride |
| POST | `/api/ratings` | Yes | Create rating. Validates ride exists, ride is completed, user was participant, not already rated. |

#### `routers/profile.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/profile` | Yes | Return current user profile with stats |
| PATCH | `/api/profile` | Yes | Update name, phone |

#### `routers/notifications.py`
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/api/notifications` | Yes | Get user's notifications, ordered by recency. Optional `?after_id`. |
| POST | `/api/notifications/read` | Yes | Mark all user's notifications as `is_read=true`. |

#### Additional
| Method | Endpoint | Auth | Logic |
|--------|----------|------|-------|
| GET | `/health` | No | Returns `{"status": "healthy"}` |

---

## 7. Database Schema

### Table: `users`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | |
| `name` | TEXT | NOT NULL | |
| `email` | TEXT | NOT NULL, UNIQUE | |
| `phone` | TEXT | | |
| `password_hash` | TEXT | NOT NULL | bcrypt hash |
| `avg_rating` | FLOAT | DEFAULT 0.0 | |
| `total_ratings` | INTEGER | DEFAULT 0 | |
| `completed_rides` | INTEGER | DEFAULT 0 | |
| `cancelled_rides` | INTEGER | DEFAULT 0 | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Table: `vehicles`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, NOT NULL | |
| `type` | TEXT | NOT NULL | car, suv, bike |
| `brand` | TEXT | NOT NULL | |
| `model` | TEXT | NOT NULL | |
| `registration_number` | TEXT | NOT NULL, UNIQUE | |
| `seat_capacity` | INTEGER | NOT NULL | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Table: `rides`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `owner_id` | UUID | FK → users.id, NOT NULL | |
| `vehicle_id` | UUID | FK → vehicles.id, NOT NULL | |
| `from_city` | TEXT | NOT NULL | |
| `to_city` | TEXT | NOT NULL | |
| `from_lat` | FLOAT | | Geocoded |
| `from_lng` | FLOAT | | Geocoded |
| `to_lat` | FLOAT | | Geocoded |
| `to_lng` | FLOAT | | Geocoded |
| `departure_time` | TIMESTAMPTZ | NOT NULL | |
| `total_seats` | INTEGER | NOT NULL | |
| `available_seats` | INTEGER | NOT NULL | (total_seats - 1 initially for driver) |
| `final_cost` | FLOAT | NOT NULL | Cost per seat (INR) |
| `distance_km` | FLOAT | | Calculated via OSRM |
| `status` | TEXT | NOT NULL, DEFAULT 'open' | open, in_progress, completed, cancelled |
| `driver_lat` | FLOAT | | Live tracking |
| `driver_lng` | FLOAT | | Live tracking |
| `last_updated` | TIMESTAMP | | Live tracking timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Table: `ride_requests`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `ride_id` | UUID | FK → rides.id, NOT NULL | |
| `passenger_id` | UUID | FK → users.id, NOT NULL | |
| `status` | TEXT | NOT NULL, DEFAULT 'pending' | pending, accepted, rejected, cancelled |
| `requested_at` | TIMESTAMP | DEFAULT NOW() | |
| `responded_at` | TIMESTAMP | | |

### Table: `ride_participants`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `ride_id` | UUID | FK → rides.id, NOT NULL | |
| `user_id` | UUID | FK → users.id, NOT NULL | |
| `role` | TEXT | NOT NULL | driver, passenger |

### Table: `chat_messages`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `ride_id` | UUID | FK → rides.id, NOT NULL | |
| `sender_id` | UUID | FK → users.id, NOT NULL | |
| `content` | TEXT | NOT NULL, MAX 500 | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Table: `notifications`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → users.id, NOT NULL | |
| `type` | TEXT | NOT NULL | request_sent, request_accepted, request_rejected, ride_completed, ride_cancelled |
| `title` | TEXT | NOT NULL | |
| `message` | TEXT | NOT NULL | |
| `related_ride_id` | UUID | | |
| `related_request_id` | UUID | | |
| `is_read` | BOOLEAN | DEFAULT FALSE | |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Table: `ratings`
| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | UUID | PK | |
| `ride_id` | UUID | FK → rides.id, NOT NULL | |
| `reviewer_id` | UUID | FK → users.id, NOT NULL | |
| `reviewee_id` | UUID | FK → users.id, NOT NULL | The driver being rated |
| `stars` | INTEGER | NOT NULL, CHECK (1-5) | |
| `review` | TEXT | | Optional text review |
| `created_at` | TIMESTAMP | DEFAULT NOW() | |

### Inferred Database Triggers

The application logic implies the following triggers exist in the database (or are handled via application code):

1. **Seat Count Update**: When a request is `accepted`, `available_seats` in `rides` decrements by 1. When cancelled/rejected, it increments back.
2. **Participant Management**: When a request is `accepted`, a record is added to `ride_participants` with role `passenger`.
3. **Rating Aggregation**: When a new rating is inserted, `users.avg_rating` and `users.total_ratings` are updated.
4. **Ride Counts**: When a ride reaches `completed` status, increment `users.completed_rides`.

---

## 8. API Reference

### Authentication

#### `POST /api/auth/signup`
```
Request:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}

Response (201):
{
  "token": "jwt_string",
  "user": { "id": "uuid", "name": "...", "email": "...", "phone": "..." }
}

Errors: 400 (email exists), 422 (validation)
```

#### `POST /api/auth/login`
```
Request:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "token": "jwt_string",
  "user": { "id": "uuid", "name": "...", "email": "...", "phone": "...", ... }
}

Errors: 401 (invalid credentials)
```

#### `GET /api/auth/me`
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "id": "uuid",
  "name": "...",
  "email": "...",
  "phone": "...",
  "avg_rating": 4.5,
  "total_ratings": 10,
  "completed_rides": 5,
  "cancelled_rides": 1,
  "created_at": "timestamp"
}
```

### Vehicles

#### `GET /api/vehicles`
Returns array of user's vehicles.

#### `POST /api/vehicles`
```
Request:
{
  "type": "car|suv|bike",
  "brand": "string",
  "model": "string",
  "registration_number": "string",
  "seat_capacity": 4
}
```

### Rides

#### `GET /api/rides?from_city=...&to_city=...&date=...`
Search available rides. All params optional. Excludes user's own rides.

#### `POST /api/rides`
```
Request:
{
  "vehicle_id": "uuid",
  "from_city": "Hyderabad",
  "to_city": "Warangal",
  "from_lat": 17.3850,
  "from_lng": 78.4867,
  "to_lat": 17.9784,
  "to_lng": 79.5941,
  "departure_time": "2026-06-20T09:00:00Z",
  "total_seats": 4,
  "final_cost": 150,
  "distance_km": 150.5
}
```

#### `GET /api/rides/my`
Returns rides where current user is the owner/driver.

#### `GET /api/rides/joined`
Returns rides where current user has an accepted request.

#### `GET /api/rides/{ride_id}`
Returns full ride detail including:
- Ride info, vehicle info, driver info
- Current user's booking status (`request_status`, `is_participant`)
- All participants
- Driver's live location (if in_progress)

#### `PATCH /api/rides/{ride_id}/status`
```
Request: { "status": "in_progress" | "completed" | "cancelled" }
```

#### `PATCH /api/rides/{ride_id}/location`
```
Request: { "driver_lat": 17.3850, "driver_lng": 78.4867 }
```

### Requests

#### `GET /api/requests/ride/{ride_id}`
Returns all requests for a given ride. Driver only.

#### `POST /api/requests/ride/{ride_id}`
Creates a join request. Returns the request object.

#### `PATCH /api/requests/{request_id}`
```
Request: { "status": "accepted" | "rejected" | "cancelled" }
```

### Chat

#### `GET /api/chat/{ride_id}?after_id=uuid`
Returns messages. If `after_id` provided, returns only newer messages.

#### `POST /api/chat/{ride_id}`
```
Request: { "content": "string (max 500 chars)" }
```

### Ratings

#### `GET /api/ratings/check/{ride_id}`
Returns `{ "has_rated": true/false }`.

#### `POST /api/ratings`
```
Request:
{
  "ride_id": "uuid",
  "reviewee_id": "uuid",      // driver's user_id
  "stars": 5,
  "review": "optional text"
}
```

### Profile

#### `GET /api/profile`
Returns user profile with all stats.

#### `PATCH /api/profile`
```
Request: { "name": "...", "phone": "..." }
```

### Notifications

#### `GET /api/notifications?after_id=uuid`
Returns user's notifications ordered by recency.

#### `POST /api/notifications/read`
Marks all notifications as read. No request body needed.

### Health

#### `GET /health`
Returns `{ "status": "healthy" }`.

---

## 9. Authentication Flow

### Registration
```
User fills form → Register.jsx
  → POST /api/auth/signup (name, email, phone, password)
  → Backend: hash password (bcrypt) → insert user → create JWT (sub=user_id, exp=72h)
  → Returns { token, user }
  → AuthContext.login(): stores token in localStorage, sets user state
  → Redirect to /dashboard
```

### Login
```
User fills form → Login.jsx
  → POST /api/auth/login (email, password)
  → Backend: find user → verify password → create JWT
  → Returns { token, user }
  → AuthContext.login(): stores token in localStorage, sets user state
  → Redirect to /dashboard
```

### Session Restoration (Page Refresh)
```
App mounts → AuthContext useEffect checks localStorage for token
  → If token exists: GET /api/auth/me (Authorization: Bearer <token>)
    → Success: setUser(response) → app is ready
    → 401: clear token + user from localStorage → redirect to /login
  → If no token: set loading=false, user=null → show guest routes
```

### Authenticated Requests
```
api.js defines a base fetch function:
  → Read token from localStorage
  → Attach 'Authorization: Bearer {token}' header to all requests
  → If response is 401:
    → Clear localStorage
    → Redirect to /login
    → Throw error
```

---

## 10. Data Flows

### 10.1 Ride Publishing Flow

```
Dashboard ("Offer a Ride")
  → Check for existing vehicles: GET /api/vehicles
    → No vehicles → show AddVehicle component inline
    → Has vehicles → show PublishRide form
  → User fills: from_city, to_city, departure_time, seats, cost
  → Client-side:
    1. Geocode from_city: tomtom.js → TomTom Geocoding API → { lat, lon }
    2. Geocode to_city: tomtom.js → TomTom Geocoding API → { lat, lon }
    3. Calculate distance + route: tomtom.js → TomTom Routing API → { distanceMeters, durationSeconds, trafficDurationSeconds, routeGeometry }
    (If user selected an autocomplete suggestion, the lat/lon is already known — skips geocoding)
  → POST /api/rides (all data including lat/lng/distance)
  → Backend: insert ride, add driver as participant, subtract 1 seat
  → Toast success → redirect to /my-rides
```

### 10.2 Ride Search Flow

```
Search page loads
  → Pre-fetch all rides: GET /api/rides (no params)
  → Display popular routes from hyderabad.js (12 pre-defined routes)
  → User types source/destination:
    → Debounced (600ms) auto-search with typed params
    → GET /api/rides?from_city=X&to_city=Y&date=Z
  → Results rendered as RideCard components
  → Each card shows: driver, route, time, seats, cost
```

### 10.3 Ride Request Flow

```
Passenger on RideDetailPage
  → Clicks "Request Seat" → RequestButton.jsx
  → POST /api/requests/ride/{ride_id}
  → Backend: validates → creates ride_request (status=pending) → creates notification for driver
  → Button changes to "Pending" state
  → RequestList.jsx (driver view) polls GET /api/requests/ride/{ride_id}
  → Driver sees new request → clicks Accept/Reject
  → PATCH /api/requests/{id} with status=accepted|rejected
  → Backend:
    → If accepted: insert into ride_participants, decrement available_seats
    → Creates notification for passenger
  → Passenger's UI updates via polling or indicator
```

### 10.4 Live Tracking Flow

```
Driver side:
  → RideDetailPage → driver clicks "Start Ride"
  → PATCH /api/rides/{id}/status → status = "in_progress"
  → useLocation hook activates browser GPS (watchPosition)
  → Every 5 seconds:
    → PATCH /api/rides/{id}/location { driver_lat, driver_lng }
    → Updates last_updated timestamp

Passenger side:
  → RideDetailPage or LiveTracker
  → useRideStatus hook polls GET /api/rides/{id} every 3 seconds
  → Reads driver_lat, driver_lng, last_updated from response
  → LiveTracker renders driver marker on TomTom map
  → Calculates ETA via TomTom Routing API every 15 seconds (traffic-aware)
  → Shows traffic-aware ETA: "12 min away (traffic: +4 min)"
  → Shows "Updated Xs ago" staleness indicator
```

### 10.5 Chat Flow

```
Both parties on RideDetailPage or ChatPage
  → ChatWindow mounts → GET /api/chat/{ride_id} (all messages)
  → Polls every 3 seconds: GET /api/chat/{ride_id}?after_id={last_message_id}
    → Only fetches new messages
  → User sends message → POST /api/chat/{ride_id} { content }
  → Backend: validates participant → inserts message
  → Next poll picks up the new message for the other user
  → Messages displayed with sender distinction:
    → sender_id === user.id → right-aligned, blue
    → Other → left-aligned, gray
```

### 10.6 Notification Flow

```
NotificationBell component (rendered in Navbar)
  → On mount: GET /api/notifications (latest 50)
  → Polls every 10 seconds: GET /api/notifications?after_id={latest_id}
  → Displays badge count (unread notifications)
  → Click bell → dropdown shows notification list
  → "Mark all read" button → POST /api/notifications/read
  → Notification types:
    → request_sent: "Someone requested to join your ride"
    → request_accepted: "Your request was accepted"
    → request_rejected: "Your request was rejected"
    → ride_completed: "Your ride was completed by the driver"
    → ride_cancelled: "Your ride was cancelled"
```

---

## 11. Key Features & Implementation Details

### 11.1 Landing Page (Home.jsx)
- Animated hero section with Framer Motion
- Scroll-reveal animation on feature cards
- 3-step explanation: "Post a Ride" → "Find a Ride" → "Ride Together"
- CTA buttons → /register or /login
- If user is already logged in → redirect to /dashboard

### 11.2 Dashboard (Dashboard.jsx)
- Central hub with two large cards: "Offer a Ride" and "Find a Ride"
- "Offer a Ride" path:
  - Checks for vehicles → if none, shows AddVehicle component inline
  - If vehicles exist, shows PublishRide form inline
- "Find a Ride" → links to /search page
- Animated layout with staggered entrance

### 11.3 Vehicle Registration (AddVehicle.jsx)
- Form fields: type (car/suv/bike dropdown), brand, model, registration number, seat capacity
- POST /api/vehicles on submit
- Toast feedback
- Inline usage on Dashboard; standalone on ProfilePage

### 11.4 Ride Publishing (PublishRide.jsx)
- Form: from_city, to_city, date/time picker, seats, cost per seat
- Live address autocomplete on FROM/TO fields via TomTom Fuzzy Search (debounced 300ms)
- Auto-geocodes cities using TomTom Geocoding API (skipped if autocomplete already provided coords)
- Auto-calculates distance + route geometry using TomTom Routing API (with traffic)
- Vehicle selector dropdown (fetches user's vehicles)
- Loading states during geocoding/distance calculation

### 11.5 Ride Search (SearchRides.jsx)
- Search bar with from/to city inputs + date picker
- Live address autocomplete on FROM/TO fields via TomTom Fuzzy Search
- Popular Hyderabad routes grid (12 routes in hyderabad.js):
  - HITEC City → Gachibowli, Kondapur → Madhapur, Secunderabad → Ameerpet, LB Nagar → Dilsukhnagar, etc.
- Results as RideCard grid/list with TomTom map previews
- Loading skeletons during search
- Empty state when no rides found

### 11.6 Ride Card (RideCard.jsx)
- Shows: driver name + rating, vehicle info, route, departure time, available seats, cost
- Status badges for: open, in_progress, completed, cancelled
- Booking status indicators: pending (yellow), accepted (green), rejected (red)
- Click → navigate to /rides/:id

### 11.7 Ride Detail Page (RideDetailPage.jsx)
- The most feature-rich page. Shows:
  - Full ride info (route, time, driver, vehicle, cost, distance, seats)
  - RouteMap (TomTom map showing source → destination markers + actual route geometry)
  - Action buttons based on role and status:
    - Owner: Start Ride, Cancel Ride, Complete Ride
    - Passenger: Request Seat (or shows booking status)
  - RequestList (driver only): pending requests with accept/reject
  - ChatWindow: messaging for participants
  - LiveTracker: if ride is `in_progress`:
    - Shows driver's live marker on map
    - Polls every 3 seconds for location updates
  - RatingModal: if ride is `completed` and user hasn't rated yet

### 11.8 Chat Window (ChatWindow.jsx)
- Scrollable message list
- Auto-scrolls to bottom on new messages
- Sender distinction: right-aligned (mine), left-aligned (theirs)
- Message input with send button
- 3-second polling for new messages (incremental via after_id)
- Character limit display (500 max)

### 11.9 Live Tracker (LiveTracker.jsx)
- Rendered during `in_progress` rides
- TomTom map with driver marker
- Calculates traffic-aware ETA via TomTom Routing API (polled every 15 seconds)
- Shows "12 min away (traffic: +4 min)" when traffic data is available
- Shows "Updated Xs ago" staleness indicator
- Driver-side and passenger-side

### 11.10 Route Map (RouteMap.jsx)
- TomTom map (two variants: `components/maps/RouteMap.jsx` and `components/map/RouteMap.jsx`)
- Start marker + End marker
- Actual route geometry from TomTom Routing API (not a straight line)
- `map.fitBounds` to show entire route
- Driver location marker support (in the `components/map/` variant)

### 11.11 Rating (RatingModal.jsx)
- Star rating (1-5, clickable with hover effect)
- Optional text review
- Shown after ride is completed (modal popup)
- Can only rate once per ride

### 11.12 Profile (ProfilePage.jsx)
- User info display + edit (name, phone)
- Stats: avg_rating, total_ratings, completed_rides, cancelled_rides
- Vehicle management: AddVehicle component + list of existing vehicles
- Account section

### 11.13 Animated UI Patterns
- Framer Motion `AnimatePresence` for page transitions
- `useScrollReveal` hook for IntersectionObserver-based fade-in-up animations
- Skeleton loaders during data fetching
- Micro-interactions: hover scale, tap effects on buttons
- Staggered children animations in lists

---

## 12. Component Tree

```
<BrowserRouter>
  <AuthProvider>
    <App>
      <Navbar />                              (always visible)
        ├── <NotificationBell />              (polls notifications)
        │     └── Notification dropdown
        └── Navigation links

      <Routes>
        <Route path="/" element={<Home />} />          # Guest only
        <Route path="/login" element={<Login />} />    # Guest only
        <Route path="/register" element={<Register />} />  # Guest only

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard>
              ├── <AddVehicle />                (if no vehicles)
              └── <PublishRide />               (if has vehicles)
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute>
            <SearchRides>
              ├── Search Form
              ├── Popular Routes Grid
              └── <RideCard /> (multiple)
            </SearchRides>
          </ProtectedRoute>
        } />

        <Route path="/my-rides" element={
          <ProtectedRoute>
            <MyRides>
              ├── Tab: Offered
              │     └── <RideCard /> (multiple)
              └── Tab: Joined
                    └── <RideCard /> (multiple)
            </MyRides>
          </ProtectedRoute>
        } />

        <Route path="/rides/:id" element={
          <ProtectedRoute>
            <RideDetailPage>
              ├── Ride Info
              ├── <RouteMap />
              ├── <RequestButton />
              ├── <RequestList />           (driver only)
              ├── <ChatWindow />
              ├── <LiveTracker />           (in_progress only)
              └── <RatingModal />           (completed, not yet rated)
            </RideDetailPage>
          </ProtectedRoute>
        } />

        <Route path="/chat/:rideId" element={
          <ProtectedRoute>
            <ChatPage>
              └── <ChatWindow />            (full screen)
            </ChatPage>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage>
              ├── Profile Form
              ├── User Stats
              └── <AddVehicle />
            </ProfilePage>
          </ProtectedRoute>
        } />
      </Routes>
    </App>
    <Toaster />                               # react-hot-toast
  </AuthProvider>
</BrowserRouter>
```

---

## 13. External Services

| Service | Purpose | Usage | Notes |
|---------|---------|-------|-------|
| **TomTom Maps SDK** | Map tiles, markers, layers | Client-side via `@tomtom-international/web-sdk-maps` | Requires API key (`VITE_TOMTOM_API_KEY`). Maps CSS imported in `main.jsx`. |
| **TomTom Geocoding API** | Geocoding city names → lat/lon + Fuzzy Search autocomplete | Client-side via `lib/tomtom.js` | Hyderabad-biased (lat=17.385, lon=78.4867, radius=50km). |
| **TomTom Routing API** | Driving distance + route geometry + traffic-aware ETA | Client-side via `lib/tomtom.js` | Returns `distanceMeters`, `durationSeconds`, `trafficDurationSeconds`, `routeGeometry`. |
| **Supabase** | PostgreSQL hosting | Backend database | Used only as DB host; real-time features not actually used |
| **Railway** | Backend hosting | Deploy via Nixpacks | `railway.json` config |
| **Vercel** | Frontend hosting | Deploy via git | `vercel.json` for SPA rewrites |

---

## 14. Deployment

### Frontend (Vercel)
```
vercel.json:
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
- SPA fallback: all routes serve `index.html`
- Build command: `npm run build` (Vite)
- Output directory: `dist/`
- Environment variables:
  - `VITE_API_URL` = backend URL
  - `VITE_TOMTOM_API_KEY` = TomTom developer API key

### Backend (Railway)
```
railway.json:
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "restartPolicyType": "always"
  }
}
```
- Python version: 3.12 (from `runtime.txt`)
- Environment variables in Railway dashboard:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `JWT_SECRET`
  - `CORS_ORIGIN` (frontend URL)

### Local Development
```
run.ps1 script:
  - Starts backend: uvicorn main:app --reload --port 8000
  - Starts frontend: npm run dev (Vite on port 5173)
  - Opens two separate PowerShell windows
```

---

## 15. Known Issues & Notes

### Bug: Joined Rides Tab Not Working
- **File:** `frontend/src/pages/MyRides.jsx` (line 15)
- **Issue:** Fetches from `api.get('/api/requests/my')` — this endpoint **does not exist** in the backend.
- **Correct endpoint:** `GET /api/rides/joined` (defined in `routers/rides.py`).
- **Impact:** The "Joined" tab always shows 0 rides.

### Unused Code
- `useRealtime.js` hook — never imported or used by any component.
- `lib/supabase.js` — creates Supabase client but only used by the unused `useRealtime` hook.
- Supabase Realtime features are not actually implemented despite the SDK being installed.

### Security Notes
- The `.env` files contain real credentials (DB URL with password, Supabase keys).
- The JWT secret in `.env` is a dev placeholder: `coride-dev-secret-change-in-production`.

### Polling vs WebSockets
- All "real-time" features use HTTP polling:
  - Live tracking: every 3s (passenger), every 5s (driver)
  - Chat: every 3s
  - Notifications: every 10s
- No WebSocket or Server-Sent Events are used.

### External API Limitations
- **TomTom Geocoding/Routing** requires a valid API key (`VITE_TOMTOM_API_KEY`). Without it, geocoding, routing, and maps will fail.
- The TomTom Free Tier has usage limits (2,500 transactions/day for geocoding, 1,000 transactions/day for routing).

### Database Schema Management
- There are no migration files in the repository. The schema is managed manually (likely via Supabase dashboard or direct SQL).
- Several inferred DB triggers (seat count updates, participant management, rating aggregation) appear to be handled in application code rather than as actual SQL triggers.

### Missing TypeScript
- The project uses plain JavaScript (JSX) throughout. No TypeScript.

### Supabase Dependency
- While `@supabase/supabase-js` is installed and Supabase is the PostgreSQL host, the backend connects directly via `asyncpg` using a connection string, not through the Supabase client.
- The Supabase client on the frontend is essentially unused.
