# CoRide

A ride-sharing application connecting drivers and passengers with real-time chat, GPS tracking, and seamless booking.

## Tech Stack

- **Frontend:** React + Vite, Framer Motion, Leaflet Maps, react-hot-toast
- **Backend:** FastAPI (Python), asyncpg, JWT auth (bcrypt + HS256)
- **Database:** PostgreSQL (via Supabase)

## Features

### Authentication & Profile

- User registration (name, email, phone, password) and login with JWT
- Persistent sessions via localStorage, protected routes
- Profile editing and rating display

### Ride Search & Discovery

- Search rides by origin, destination, and date
- Popular Hyderabad route chips for quick selection
- Leaflet map previews with OSRM route polyline on each ride card
- Sort results by departure time or price

### Ride Offering

- Publish a ride with origin, destination, date/time, seats, fare, and vehicle
- Client-side Nominatim geocoding and OSRM distance calculation
- Auto-populate from 12 popular routes

### Ride Management

- **My Rides** tabbed view (Upcoming / History)
- Offered rides and joined rides in separate lists
- Ride detail page with breadcrumb, interactive route map, journey timeline
- Driver controls: Start / Complete / Cancel Ride
- Passenger controls: Request Seat, Cancel Request, view booking status

### Booking & Ride Requests

- Passengers request seats; drivers accept or reject
- Automatic notifications on request sent, accepted, rejected
- Seat availability enforcement

### Real-Time Chat

- Full-screen chat with conversations sidebar and active chat window
- Polling-based message sync (3s interval)
- Typing indicator, message timestamps, read receipts
- Quick action chips: **Share Location**, Wait for 5 mins, Where are you?
- **Share Location** uses browser geolocation to send a Google Maps link rendered as a clickable location card

### Live GPS Tracking

- Driver broadcasts GPS coordinates via `watchPosition`
- Passenger polls driver location every 3 seconds
- Activated from the ride detail page

### Notifications

- Bell icon with animated unread badge in the navbar
- Polled every 10 seconds with incremental loading
- Dropdown panel with mark-all-read
- Toast popup on new notifications

### Ratings

- Post-ride star rating (1–5) with optional review
- One-time rating enforcement per ride

### Vehicle Management

- Register vehicles (car / SUV / bike) with brand, model, registration number
- Unique registration number validation
- Vehicle selector when publishing a ride

### UI/UX

- Page transitions with Framer Motion
- Scroll-triggered reveal animations
- Responsive navbar with mobile support
- Custom CSS design system with CSS custom properties
- Material Symbols icons throughout

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL database (or Supabase project)

### One-Click Run

```powershell
.\run.ps1
```

This script checks prerequisites, sets up the backend virtual environment and frontend `node_modules` if needed, then starts both servers in separate windows:

- **Backend** → `http://localhost:8000`
- **Frontend** → `http://localhost:5173`

You can also run individually:

```powershell
.\run.ps1 -BackendOnly   # backend only
.\run.ps1 -FrontendOnly  # frontend only
```

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://user:password@host:5432/coride
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:5173
```

Run:

```bash
python -m uvicorn main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Database

The schema (tables: `users`, `vehicles`, `rides`, `ride_requests`, `ride_participants`, `chat_messages`, `notifications`, `ratings`) must be set up manually in your PostgreSQL database. Refer to the backend models and router files for column definitions.
