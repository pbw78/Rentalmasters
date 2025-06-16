# Property Management System (RentalMaster)

## Overview

This is a full-stack property management application built with React, Express, and PostgreSQL. The application allows property managers to handle properties, tenants, contracts, payments, and service requests through a modern web interface with multilingual support (Polish, English, Danish).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL driver with connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with TTL support
- **User Management**: Role-based access control (user/admin roles)
- **Security**: HTTP-only cookies with secure flags for production

### Core Entities
1. **Properties**: Real estate units with detailed specifications
2. **Tenants**: Individual renters with contact and emergency information
3. **Contracts**: Rental agreements linking properties to tenants
4. **Payments**: Rent and fee tracking with multiple payment methods
5. **Service Requests**: Maintenance and repair request management

### API Architecture
- **Pattern**: RESTful API with standard HTTP methods
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware with proper status codes
- **Logging**: Request/response logging with performance metrics

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Layer**: Express routes handle authentication and business logic
3. **Database Layer**: Drizzle ORM manages PostgreSQL interactions
4. **Response**: JSON responses with proper error handling and status codes

### Authentication Flow
1. User clicks login → redirected to Replit Auth
2. Successful auth → user session created in PostgreSQL
3. Subsequent requests → session validation via cookies
4. Protected routes → middleware checks authentication status

### Data Mutations
1. Form submission → Zod validation
2. API request → Express route handler
3. Database operation → Drizzle ORM query
4. Cache invalidation → TanStack Query updates UI

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management with validation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Authentication Dependencies
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 with automatic provisioning
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Internal port 5000, external port 80

### Production Build
- **Frontend**: Vite build to `dist/public` directory
- **Backend**: ESBuild compilation to `dist/index.js`
- **Static Assets**: Served via Express static middleware
- **Deployment Target**: Replit Autoscale with automatic scaling

### Environment Configuration
- **Database URL**: Automatically provisioned PostgreSQL connection
- **Session Secret**: Required for secure session management
- **Replit Integration**: OIDC configuration for authentication

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 14, 2025. Initial setup