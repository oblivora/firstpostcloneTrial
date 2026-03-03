# WebAnalytic Documentation

## Overview

**WebAnalytic** is a real-time analytics dashboard powered by the Google Analytics Data API, providing a beautiful, user-friendly interface to visualize website traffic, audience insights, acquisition channels, and user behavior. Created by **Aman web service**.

## Features

- **Real-Time Analytics**: View active users and active pages currently on the site, updating every 10 seconds.
- **Traffic Overview**: Visualize sessions, active users, new users, page views, bounce rate, and average session duration with line charts over customizable date ranges (7, 14, 30, 90 days).
- **Audience Insights**: Device category breakdowns (desktop, mobile, tablet) and top countries by active users.
- **Acquisition Channels**: Track which traffic sources (organic, direct, social, referral) are driving sessions and conversions.
- **Behavior & Events**: Analyze top events, page views, and user engagement metrics across individual page paths.
- **Secure Authentication**: Built-in JWT-based registration and login system with bcrypt password hashing.
- **Google OAuth2 Integration**: Seamless generation and storage of refresh tokens to access users' GA4 properties securely.

## Tech Stack & Architecture

### Frontend
- **HTML5 & CSS3**: Custom responsive styling featuring a modern dark theme, glassmorphism, and smooth animations.
- **Vanilla JavaScript**: Lightweight client-side API interaction and DOM manipulation (`api.js`, `auth.js`, `analytics.js`).
- **Chart.js**: Utilized for rendering responsive line charts, bar charts, and doughnut charts (`charts.js`).

### Backend
- **Node.js & Express**: Handling API routing, static file serving, and authentication middleware.
- **SQLite (sql.js)**: A lightweight, serverless database storing user credentials and connected GA4 properties.
- **Google Analytics Data API (`@google-analytics/data`)**: Backend proxy to fetch securely from the GA4 endpoint properties.
- **Google Auth API (`google-auth-library`)**: Managing OAuth2 flows and token refreshes.

## Setup Instructions

### Prerequisites
- Node.js installed on your local machine.
- Google Cloud Console account with the **Google Analytics Data API** enabled.
- OAuth 2.0 Client credentials (Client ID and Client Secret) configured in Google Cloud.

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key

   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   REDIRECT_URI=http://localhost:3000/api/google/callback
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the Development Server:**
   ```bash
   node server.js
   # Or using nodemon for automatic restarts
   npx nodemon server.js
   ```

4. **Access the Application:**
   Open a browser and navigate to `http://localhost:3000`.

## Connecting GA4 Properties

1. **Create an Account**: Register a new user account via the WebAnalytic interface.
2. **Add Property**: Navigate to **Settings**, input an arbitrary Display Name and your real **GA4 Property ID** (e.g., `123456789`).
3. **Authorize**: Click **Connect Google** on the property list, which directs you to the Google OAuth consent screen to grant WebAnalytic read-only access to your Google Analytics data.
4. **View Data**: Select the connected property from the sidebar dropdown to populate the dashboard with active metrics.

## Security Considerations

- **Passwords**: Hashed via `bcryptjs` before storage in the SQLite database.
- **Session Management**: Handled via `httpOnly` secure JWT cookies to prevent XSS data extraction.
- **OAuth Tokens**: Google Refresh Tokens are stored server-side to orchestrate API requests; the frontend never interacts directly with GA4 endpoints or Google tokens.
