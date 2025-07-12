# Grace Period Artist Website

## Overview

This is a full-stack web application for Grace Period, a singer/songwriter from London. The application serves as the artist's official website with features for fan engagement, music promotion, and content management. Built with React/TypeScript frontend, Express backend, PostgreSQL database, and Notion CMS integration.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend, backend, and data layers:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (Grace Period brand colors)
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with custom middleware for logging and error handling
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (Neon serverless in production)
- **Email Service**: Resend for transactional emails
- **CMS Integration**: Notion API for content management

### Development Environment
- **Platform**: Replit with Node.js 20, PostgreSQL 16
- **Hot Reload**: Vite dev server with HMR
- **Type Checking**: TypeScript with strict mode enabled
- **Development Server**: tsx for TypeScript execution

## Key Components

### Email Subscription System
- Collects fan email addresses with optional location data
- Prevents duplicate subscriptions with database constraints
- Sends notification emails to the artist when new subscribers join
- Form validation with Zod schemas and React Hook Form

### Visitor Counter
- Tracks website visits with persistent counter in database
- Default starting count of 1012 for social proof
- Automatic incrementing on page loads

### Content Management (Notion Integration)
- Fetches blog posts and updates from Notion databases
- Displays formatted content with images and metadata
- Automatic content refresh every 5 minutes
- Fallback UI for loading and error states

### User Authentication (Basic Structure)
- Database schema for users with username/password
- Ready for future authentication features

## Data Flow

1. **Frontend Request**: React components make API calls using TanStack Query
2. **Backend Processing**: Express routes handle requests, validate data with Zod
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **External Services**: Integration with Resend for emails, Notion for content
5. **Response**: JSON responses sent back to frontend for UI updates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: react, react-dom, react-hook-form, @tanstack/react-query
- **Backend**: express, drizzle-orm, @neondatabase/serverless
- **UI Components**: @radix-ui/* packages for accessible components
- **Validation**: zod for runtime type checking
- **Styling**: tailwindcss, class-variance-authority, clsx

### Third-Party Services
- **Resend**: Email delivery service for subscriber notifications
- **Notion**: Content management system for blog posts
- **Neon**: Serverless PostgreSQL database hosting

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Backend bundling for production

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations ensure schema is up to date

### Environment Configuration
- **Development**: Uses local PostgreSQL and hot reload
- **Production**: Deployed to Replit with autoscale, serves on port 80
- **Database**: Environment variable `DATABASE_URL` for connection string
- **API Keys**: `RESEND_API_KEY`, `NOTION_INTEGRATION_SECRET`, `NOTION_PAGE_URL`

### Deployment Commands
- `npm run dev`: Development server with hot reload
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server
- `npm run db:push`: Apply database schema changes

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```