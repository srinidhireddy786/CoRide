# coRide

A ride-sharing application with a FastAPI backend deployed on Railway and a React + Vite frontend deployed on Vercel.

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS (deployed on Vercel)
- **Backend:** FastAPI (Python) (deployed on Railway)
- **Database:** PostgreSQL (via asyncpg)

## Deployment

This project is designed to be deployed as follows:

| Service  | Platform | Directory   |
| -------- | -------- | ----------- |
| Backend  | Railway  | `backend/`  |
| Frontend | Vercel   | `frontend/` |

- **Railway** automatically detects the `backend/` directory, installs Python dependencies from `requirements.txt`, and runs the FastAPI app.
- **Vercel** automatically detects the `frontend/` directory, installs npm dependencies, and builds the Vite project.

Make sure the frontend's API calls point to your Railway backend URL (set `VITE_API_URL` in your Vercel environment variables).

## Getting Started

### Backend

1. Navigate to the `backend` directory.
2. Start the virtual environment and install requirements.
3. Run the development server: `python -m uvicorn main:app --reload`

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
