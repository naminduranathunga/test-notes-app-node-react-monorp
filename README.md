# MindFlow Notes App

A beautiful, light-weight notes application built with React, Node.js, and MySQL.

## Features
- ✨ Premium dark UI with glassmorphism effects.
- 🌈 Color-coded notes.
- 🚀 Fast and responsive.
- 🦀 Simple CRUD operations (Create, Read, Delete).
- 🔒 No login required.

## Project Structure
- `frontend/`: React + Vite + TypeScript.
- `backend/`: Node.js + Express + MySQL.

## Getting Started

### Prerequisites
- Node.js installed.
- MySQL server running locally.

### 1. Database Setup
1. Open your MySQL client.
2. The backend will automatically create the `notes_db` database and `notes` table on startup if you have the correct permissions. 
3. If you need to change database credentials, update `backend/.env`.

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL user (default: root)
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name (default: notes_db)

## Deployment Instructions

### Frontend Build
```bash
cd frontend
npm run build
```
The production-ready files will be in `frontend/dist`.

### Backend Deployment
1. Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correctly set in the environment variables of your hosting provider.
2. Run `npm install --production` in the `backend` folder.
3. Use a process manager like `pm2` to run `index.js`.
4. If you are serving both from the same server, you might want to serve the `frontend/dist` folder using Express:
   ```javascript
   // Add to backend/index.js for production
   import path from 'path';
   const __dirname = path.resolve();
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../frontend/dist')));
     app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html')));
   }
   ```
