# Shared Pixel Grid

A real-time, multi-user shared grid application.

## Features
- **Real-time Updates**: Powered by Socket.IO for instant visibility of block claims.
- **Concurrency Safety**: Uses MongoDB atomic operators (`findOneAndUpdate`) to ensure "first valid request wins".
- **Dynamic UX**: Premium dark-mode design with smooth hover and click animations.
- **No-Auth Entry**: Generates a persistent random user identity stored in `localStorage`.

## Tech Stack
- **Frontend**: React (Vite), Socket.IO Client, Vanilla CSS.
- **Backend**: Node.js, Express, Socket.IO, MongoDB Atlas (Mongoose).

## Setup

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account (or local MongoDB instance)

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file from `.env.example` and add your `MONGODB_URI`.
4. Seed the grid: `npm run seed`
5. Start server: `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. Start dev server: `npm run dev`

## Architecture Decisions
- **Source of Truth**: The MongoDB Atlas database is the single source of truth. The server fetches the initial state from DB and only broadcasts updates once the DB record is updated atomically.
- **Concurrency Handling**: We use MongoDB's atomic `findOneAndUpdate` with a query filter `{ owner_id: null }`. This ensures that even with hundreds of simultaneous clicks, only the first request to reach the database succeeds. The database itself acts as the lock, preventing race conditions.
- **Real-time Engine**: Socket.IO handles the bi-directional communication. We use a "Differential Update" strategy—instead of re-sending the whole grid on every click, we only broadcast the individual updated block to minimize latency and bandwidth.
- **Premium UI/UX**: Built with a "mobile-first" CSS Grid approach. Added micro-interactions using CSS transforms and glassmorphism for a high-end feel.
- **Persistence**: User identities (Random IDs and Colors) are persisted in `localStorage` so users maintain their "captured" blocks even after a refresh.
