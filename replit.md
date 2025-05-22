# CampaignIQ - Marketing Analytics Dashboard

## Overview

CampaignIQ is a full-stack web application that provides a unified dashboard for digital marketing campaign analytics across multiple platforms (Google Ads, Facebook/Meta Ads, TikTok Ads). The application connects to advertising platform APIs via OAuth, fetches campaign metrics, normalizes the data, and presents it through an interactive dashboard with various visualizations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

CampaignIQ follows a modern full-stack JavaScript architecture:

1. **Frontend**: React application with TypeScript, using Tailwind CSS for styling and shadcn/ui components
2. **Backend**: Express.js server with TypeScript
3. **Database**: PostgreSQL with Drizzle ORM for schema management and querying
4. **Authentication**: OAuth 2.0 (Google for user authentication, platform-specific OAuth for ad platform connections)
5. **State Management**: React Query for data fetching, caching, and state management
6. **Bundling/Building**: Vite for frontend bundling and development server

The application uses a monorepo structure with client, server, and shared code organized in separate directories. The server handles API requests, authentication, and database interactions, while the client provides the user interface and data visualization.

## Key Components

### Frontend

1. **Pages**:
   - Login page for user authentication via Google OAuth
   - Dashboard page with performance metrics and visualizations
   - Not found page for handling invalid routes

2. **Components**:
   - UI components (built on shadcn/ui and Radix UI primitives)
   - Dashboard components (metrics cards, charts, tables)
   - Layout components (header, sidebar, navigation)
   - Modal components for connecting ad platforms

3. **Hooks**:
   - `usePlatforms` - Manages ad platform connections
   - `useMetrics` - Fetches and manages analytics data
   - `useCampaigns` - Handles campaign-specific data

4. **Utilities**:
   - API adapters for each ad platform
   - Authentication utilities (PKCE implementation)
   - Query client configuration

### Backend

1. **API Routes**:
   - Authentication endpoints (/api/auth/*)
   - Platform connection endpoints (/api/platforms/*)
   - Metrics endpoints (/api/metrics/*)
   - Campaign endpoints (/api/campaigns/*)

2. **Services**:
   - Storage service for database interactions
   - Authentication service for user management
   - Platform-specific services for API interactions

3. **Middleware**:
   - Authentication middleware to protect routes
   - Logging middleware for request/response tracking

### Database Schema

The database uses three main tables:

1. **users** - Stores user information from Google authentication
2. **platform_connections** - Stores OAuth tokens and account information for connected ad platforms
3. **campaign_metrics** - Stores normalized campaign performance data from all platforms

## Data Flow

1. **User Authentication**:
   - Users sign in with Google OAuth
   - Backend validates credentials and creates/retrieves user record
   - Session is established for authenticated requests

2. **Platform Connection**:
   - User initiates connection to an ad platform (Google Ads, Facebook Ads, TikTok Ads)
   - Application redirects to platform OAuth flow
   - After authorization, platform provides access tokens
   - Tokens are stored securely for future API requests

3. **Data Retrieval**:
   - Backend uses stored access tokens to fetch campaign data from platforms
   - Data is normalized into a common format and stored in the database
   - Metrics are aggregated and prepared for visualization

4. **Data Visualization**:
   - Frontend requests metrics data from backend API
   - React Query manages data fetching, caching, and state
   - UI components render visualizations based on the retrieved data

## External Dependencies

### Frontend Libraries
- React for UI components
- React Query for data fetching and state management
- shadcn/ui and Radix UI for UI components
- Tailwind CSS for styling
- date-fns for date manipulation
- Recharts (implied) for data visualization

### Backend Libraries
- Express.js for HTTP server
- Passport.js for authentication
- Drizzle ORM for database interactions
- zod for schema validation

### External Services
- Google OAuth for user authentication
- Ad Platform APIs:
  - Google Ads API
  - Facebook/Meta Ads API
  - TikTok Ads API

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Mode**:
   - `npm run dev` - Runs the server with development configuration
   - Vite dev server provides hot module replacement for frontend

2. **Production Build**:
   - `npm run build` - Builds the frontend with Vite and bundles the server with esbuild
   - Creates optimized assets in the `/dist` directory

3. **Production Mode**:
   - `npm run start` - Starts the production server from the built assets
   - Serves static frontend files and handles API requests

4. **Database**:
   - PostgreSQL is provisioned through Replit
   - DATABASE_URL environment variable connects to the database
   - Drizzle handles schema migrations with `npm run db:push`

## Setup Requirements

To set up the project, the following environment variables are needed:

1. **Database Configuration**:
   - `DATABASE_URL` - PostgreSQL connection string

2. **Authentication**:
   - `SESSION_SECRET` - Secret for session encryption
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `CALLBACK_URL` - OAuth callback URL

3. **Ad Platform Integration**:
   - Google Ads credentials (`GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`)
   - Facebook Ads credentials (`FACEBOOK_ADS_CLIENT_ID`, `FACEBOOK_ADS_CLIENT_SECRET`)
   - TikTok Ads credentials (`TIKTOK_ADS_CLIENT_ID`, `TIKTOK_ADS_CLIENT_SECRET`)
   - `REDIRECT_URI_BASE` - Base URL for OAuth redirects

The application will run on port 5000 by default, with the API available at `/api/*` endpoints and the React application serving the frontend.