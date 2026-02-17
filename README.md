# MarketPulse: Distributed Market Analytics System

MarketPulse is a professional-grade, full-stack ecosystem designed to track commodity price inflation in Naira (NGN). The project demonstrates a distributed architecture consisting of a **Cross-Platform Mobile App (React Native/Expo)**, a **Systems-Level API (Rust/Axum)**, and a **Persistent Relational Database (PostgreSQL)**.

## 🚀 Key Features

*   **Real-time Price Tracking**: Monitor commodity prices (Grains, Tubers, Proteins, etc.) with live updates.
*   **Inflation Analytics**: Visualized trend lines, percentage change indicators, and volatility analysis.
*   **Smart Insights**:
    *   **Buy Recommendations**: automated advice (Great Buy, Fair Price, High Price) based on historical data.
    *   **Volatility Metrics**: visual indicators for price stability (Stable, Moderate, High Fluctuation).
    *   **Last Updated**: relative time indicators for data freshness.
*   **Detailed History**: Interactive charts and tabulated history of price changes per unit.
*   **Item Management**: Create, edit, and delete items with support for images and multiple units (kg, mudu, bag, etc.).
*   **Secure Authentication**: robust user management with secure password handling.
*   **Cross-Platform**: Runs seamlessly on Android and iOS via Expo.

## 🏗️ Architecture

The system is composed of the following micro-components:

### 1. Mobile Frontend (`/UI`)
*   **Framework**: React Native (Expo Managed Workflow)
*   **Routing**: Expo Router (File-based routing)
*   **Styling**: NativeWind (Tailwind CSS for React Native)
*   **Charts**: Victory Native (High-performance visualizations)
*   **Icons**: Lucide React Native
*   **State Management**: React Hooks & Context API
*   **Networking**: Axios with centralized API client

### 2. Backend API (`/backend`)
*   **Language**: Rust (2021 Edition)
*   **Web Framework**: Axum (Tokio-based)
*   **Database ORM**: Diesel (Type-safe SQL queries)
*   **Database**: PostgreSQL
*   **Architecture**: Modular design (Handlers, Routes, Services, Models)

## 📂 Project Structure

```bash
cls-marketpulse/
├── UI/                   # React Native Expo Frontend
│   ├── app/              # Expo Router Pages & Layouts
│   ├── components/       # Reusable UI Components
│   ├── context/          # Global State (Auth, Toast)
│   ├── api/              # API Client Configuration
│   └── types/            # TypeScript Definitions
├── backend/              # Rust API Backend
│   ├── src/
│   │   ├── db/           # Database Connection & Models
│   │   ├── handlers/     # Request Controllers
│   │   ├── routes/       # API Route Definitions
│   │   └── middleware/   # Auth & Logging Middleware
│   └── migrations/       # SQL Database Migrations
├── k8s/                  # Kubernetes Deployment Configs
└── docker-compose.yml    # Development Database Setup
```

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Rust (Cargo)
*   Docker & Docker Compose

### 1. Setup Backend (Database + API)

First, start the PostgreSQL database and run migrations:

```bash
# Start Database
docker-compose up -d

# Navigate to backend
cd backend

# Install Diesel CLI (if not installed)
cargo install diesel_cli --no-default-features --features postgres

# Run Migrations
diesel migration run

# Start the API Server
cargo run
```
The API will start at `http://localhost:3000`.

### 2. Run the Mobile App

Open a new terminal and navigate to the UI directory:

```bash
cd UI

# Install Dependencies
npm install

# Start the Expo Dev Server
npx expo start
```

*   Press `a` to run on Android Emulator.
*   Press `i` to run on iOS Simulator (macOS only).
*   Scan the QR code with the **Expo Go** app on your physical device.

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/auth/me` | Get current user profile |
| **Items** | | |
| `GET` | `/items` | List all tracked items |
| `POST` | `/items` | Create a new item (Multipart/Form-Data) |
| `GET` | `/items/:id` | Get item details |
| `PUT` | `/items/:id` | Update item details |
| `DELETE` | `/items/:id` | Delete an item |
| **Prices** | | |
| `POST` | `/prices` | Add a new price entry |
| `GET` | `/prices/history/:id` | Get price history for an item |
| **Metadata** | | |
| `GET` | `/categories` | List available categories |
| `GET` | `/units` | List available units |

## 👥 Contributors
Developed as part of the Class Project for Distributed Systems.
