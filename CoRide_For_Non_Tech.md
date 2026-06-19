# CoRide — Plan & Overview (For Everyone)

> **Tagline:** Ride Together, Save Together  
> **What it is:** A ride-sharing app for people in and around **Hyderabad**

---

## What is CoRide?

CoRide is a platform that connects **drivers who have empty seats** with **passengers who need a ride** in the same direction. Think of it as a friendly, organized way to share car rides — drivers save on fuel costs, passengers save on travel, and everyone helps reduce traffic.

Imagine you're driving from HITEC City to Gachibowli every morning. You have 3 empty seats in your car. With CoRide, you can offer those seats to people heading the same way. They pay a small share of the cost, you all travel together, and everyone wins.

---

## Who is it for?

| If you are... | You can... |
|--------------|-----------|
| A **driver** | Register your vehicle, publish your route and schedule, accept passengers, and share your live location during the ride |
| A **passenger** | Search for rides going your way, request a seat, track the driver live, chat with them, and rate your experience |

---

## Key Features (in simple terms)

### 1. Create an Account
Sign up with your name, email, and phone number. Log in securely. Your profile stays saved.

### 2. Register Your Vehicle (for drivers)
Add your car, SUV, or bike details — brand, model, license plate number, and how many seats you have.

### 3. Publish a Ride (for drivers)
Tell the app:
- Where you're starting from
- Where you're going
- When you're leaving
- How many seats you're offering
- How much each seat costs

The app automatically figures out the location coordinates and distance. As you type in the from/to fields, address suggestions appear — just tap to select.

### 4. Search for Rides (for passengers)
Type your starting point and destination — the app shows live address suggestions as you type. Pick a date. The app shows you all matching rides with driver details, timings, seat availability, and price.

You can also quickly pick from popular Hyderabad routes like:
- HITEC City → Gachibowli
- Secunderabad → Ameerpet
- LB Nagar → Dilsukhnagar
- And 9 more common routes

### 5. Request a Seat
Found a ride you like? Hit "Request Seat." The driver gets a notification. They can accept or reject your request. You'll be notified either way.

### 6. Chat with Your Ride Partner
Once you're part of a ride, you can message the driver or other passengers through the in-app chat. No need to share phone numbers.

### 7. Live Tracking (during the ride)
When the driver starts the ride, you can see their **live location** on a map. You'll know exactly where they are and when they'll reach you.

### 8. Rate Your Ride
After a ride is completed, you can rate the driver with stars (1 to 5) and leave a review. This helps build trust in the community.

### 9. Notifications
You get instant alerts when:
- Someone requests to join your ride
- Your ride request is accepted or rejected
- A ride you're part of is completed or cancelled

---

## How It All Works (Step by Step)

### For Drivers:
```
1. Sign up → 2. Add your vehicle → 3. Publish a ride
   → 4. Wait for requests → 5. Accept passengers
   → 6. Start the ride → 7. Share live location
   → 8. Complete the ride → 9. Get rated
```

### For Passengers:
```
1. Sign up → 2. Search for a ride → 3. Request a seat
   → 4. Get accepted → 5. Track the driver live
   → 6. Chat if needed → 7. Complete the ride
   → 8. Rate the driver
```

---

## The Dashboard — Your Home Base

When you log in, you land on the **Dashboard**. It's simple:

- **"Offer a Ride"** card — click here if you're driving and want to share seats
- **"Find a Ride"** card — click here if you're looking for a ride

---

## Your Rides Page

Shows two tabs:

| Tab | What you see |
|-----|-------------|
| **Offered** | Rides you posted as a driver |
| **Joined** | Rides you've been accepted into as a passenger |

---

## Ride Detail Page

When you click on any ride, you see:
- Full route info (from → to, time, distance, cost)
- A map showing the route
- Driver or passenger details
- Buttons to: Request Seat / Start Ride / Cancel / Complete
- Chat window (if you're part of the ride)
- Live tracker (if the ride is ongoing)

---

## Profile Page

View and edit your:
- Name and phone number
- Rating and reviews (from completed rides)
- Number of rides completed/cancelled
- Your registered vehicles

---

## What Makes CoRide Different

| Feature | Benefit |
|---------|---------|
| **Hyderabad-focused** | Pre-set popular routes make finding rides faster |
| **Live tracking** | Passengers can see exactly where the driver is |
| **In-app chat** | No need to share personal numbers |
| **Rating system** | Builds trust — good drivers get recognized |
| **Simple design** | Easy to use, works on phones and computers |

---

## Technical Bits (Simplified)

- **Website (Frontend):** Built with React — runs in your browser
- **Server (Backend):** Built with FastAPI (Python) — handles all the logic
- **Database:** PostgreSQL — stores all user data, rides, messages, etc.
- **Maps:** Uses TomTom Maps (professional-grade maps with traffic data)
- **Security:** Passwords are encrypted; login uses secure tokens
- **Hosting:** The website is on Vercel, the server is on Railway

---

## What's Coming / Future Plans

While the core app works end-to-end, here are planned improvements:

1. **Real-time updates** — Switch from polling to instant updates (WebSocket)
2. **Mobile app** — Native Android/iOS versions
3. **Payment integration** — Handle payments directly in the app
4. **More cities** — Expand beyond Hyderabad
5. **Scheduled/recurring rides** — For daily commuters
6. **Women-only rides** — Safety option
7. **Ride verification** — OTP-based ride start confirmation
8. **In-app SOS** — Emergency button during rides

---

## Quick Facts

| Item | Detail |
|------|--------|
| App name | **CoRide** |
| Built for | Hyderabad, India |
| Launch ready | Yes — fully functional web app |
| Cost to use | Free to join; drivers set their own fare per seat |
| Platform | Web (desktop + mobile browser) |
| Tech | React (frontend) + Python/FastAPI (backend) + PostgreSQL (database) |

---

*CoRide — Ride Together, Save Together.*
