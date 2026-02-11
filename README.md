# 🦁 English Premier League (EPL) Full-Stack App

A modern, high-performance web application for tracking English Premier League matches, standings, and player statistics. Built with a robust **Go** backend and a premium **React/Vite** frontend.

## 🚀 Key Features

- **Live Standings**: Real-time table with automated points, GD, and form calculation.
- **Match Center**: Comprehensive fixture list, including results and upcoming matches.
- **Player Statistics**: Dedicated leaderboards for **Top Scorers**, **Most Assists**, and **Most Clean Sheets**.
- **Specialized Data Flow**: Uses optimized MongoDB collections for high-speed statistics retrieval.
- **Admin Dashboard**: Secure management for matches, players, and live goal events.
- **Premium UI**: Ultra-modern dark theme with smooth animations and responsive design.

## 🛠 Tech Stack

### Backend
- **Language**: Go (Golang)
- **Web Framework**: Gin Gonic
- **Database**: MongoDB (with specialized collections for stats)
- **Authentication**: JWT & Bcrypt

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS & Lucide Icons
- **Animations**: Framer Motion
- **State Management**: React Hooks & Axios

---

## 🏗 Project Structure

```text
├── backend/                # Go Backend
│   ├── cmd/
│   │   ├── server/         # Main Entry Point (main.go)
│   │   └── tools/          # CLI Utility Tools (Seeding, DB, Debug)
│   ├── internal/           # Core Logic (Handlers, Services, Repos)
│   └── models/             # Data Structures
├── src/                    # React Frontend
│   ├── components/         # Reusable UI Components
│   ├── pages/              # Page Views
│   └── lib/                # API Service and Utilities
```

---

## 🚦 Getting Started

### Prerequisites
- **Go** (1.21 or higher)
- **Node.js** (v18+) & **npm**
- **MongoDB** (Running on `localhost:27017` or configured via `.env`)

### 1. Backend Setup
```bash
cd backend
go mod tidy
```

**Run the Server:**
```bash
go run cmd/server/main.go
```

**Database Tools (CLI):**
The tools are organized in `backend/cmd/tools/`. To seed the initial data:
```bash
# 1. Seed base data (Players, Teams)
go run cmd/tools/seed/db/seed_db.go

# 2. Seed match results and stats
go run cmd/tools/seed/stats/seed_stats.go

# 3. Populate specialized statistics collections
go run cmd/tools/db/stats/populate_stats.go

# 4. Check database status
go run cmd/tools/debug/db/check_db.go
```

### 2. Frontend Setup
```bash
# From the root directory
npm install
```

**Run Development Server:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the app.

---

## 🔒 Security & Environment
Ensure you create a `.env` file in the `backend/` directory with the following variables:
- `MONGO_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secure key for token generation.
- `PORT`: Server port (default: 8080).

## 📄 License
This project is for educational purposes. All data is simulated for the 2025/26 season.
