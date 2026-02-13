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
3. Create a `.env` file (copy from `.env.example`) and set your `MONGODB_URI`.
4. Initialize the database: `node initDb.js`
5. Start server: `node index.js`

### Frontend
1. `cd frontend`
2. `npm install`
3. Start dev server: `npm run dev`

## Architecture Decisions
- **Source of Truth**: The MongoDB Atlas database is the single source of truth. The server fetches the initial state from DB and only broadcasts updates once the DB record is updated.
- **Concurrency**: By using MongoDB's atomic `findOneAndUpdate` with a query filter `{ owner_id: null }`, we prevent two users from claiming the same block at the exact same millisecond. The database enforces the "first-come, first-served" rule at the document level.
- **State Management**: React handles the grid state, updating only the specific block that changed when a `block-updated` event is received, ensuring performance.
- **Responsive Design**: CSS Grid with media queries allows the 20x20 grid to be usable on smaller screens.
