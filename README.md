# coRide

This project is currently just a basic base to build upon. It contains foundational frontend and backend structures for a ride-sharing application, but is meant to be extended and refined.

## Tech Stack
- Frontend: React + Vite + TailwindCSS
- Backend: FastAPI (Python)
- Database: PostgreSQL (via asyncpg)

## Getting Started

### Backend
1. Navigate to the `backend` directory.
2. Ensure you have your PostgreSQL database running and update the `DATABASE_URL` in `.env`.
3. Start the virtual environment and install requirements.
4. Run the development server: `python -m uvicorn main:app --reload`

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
