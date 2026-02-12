# MarketPulse: Distributed Market Analytics System

MarketPulse is a professional-grade, full-stack ecosystem designed to track commodity price inflation in Naira (NGN). The project demonstrates a distributed architecture consisting of a **Cross-Platform Mobile App (React Native/Expo)**, a **Systems-Level API (Rust/Axum)**, and a **Persistent Relational Database (PostgreSQL)**.

## 🚀 Key Features

*   **Real-time Price Tracking**: Monitor commodity prices (Grains, Tubers, etc.) with live updates.
*   **Inflation Analytics**: Visualized trend lines and percentage change indicators.
*   **Categories**: Filter items by category (Grains, Vegetables, Proteins, etc.).
*   **Secure Authentication**: OTP-based Passwordless Login.
*   **Cross-Platform**: Runs on Android and iOS via Expo.

## 🏗️ Architecture

The system is composed of the following micro-components:

1.  **Mobile Frontend (`/client`)**
    *   **Framework**: React Native (Expo Managed Workflow)
    *   **Styling**: NativeWind (Tailwind CSS)
    *   **State Management**: React Query
    *   **Navigation**: Expo Router (File-based)

2.  **Backend API (`/backend`)**
    *   **Language**: Rust
    *   **Framework**: Axum
    *   **Database ORM**: Diesel (PostgreSQL)
    *   **Auth**: JWT + OTP
    
## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Rust (Cargo)
*   Docker & Docker Compose

### 1. Run the Backend (Database + API)
```bash
# Start PostgreSQL Database
docker-compose up -d

# Run Rust API
cd backend
cargo run
```

### 2. Run the Mobile App
```bash
cd client
npx expo start
```
Scan the QR code with your **Expo Go** app (Android/iOS) or press `w` to run in the web browser.

## 📂 Project Structure

```
cls-marketpulse/
├── backend/          # Rust API Source Code
├── client/           # React Native Expo App
├── docker-compose.yml # Local Dev Database
└── README.md         # This file
```

## 👥 Contributors
Developed as part of the Class Project for Distributed Systems.
