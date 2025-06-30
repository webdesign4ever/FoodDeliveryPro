# FreshBox - Fresh Fruits & Vegetables Delivery Platform

## Overview

FreshBox is a modern e-commerce platform for ordering fresh organic fruits and vegetables with customizable boxes and digital payment integration. The application provides a seamless online ordering experience for customers while offering comprehensive administrative tools for business management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system (fresh green and sunny yellow theme)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **API Design**: RESTful endpoints with comprehensive CRUD operations

### Build & Development
- **Development**: Vite dev server with HMR and error overlay
- **Production Build**: ESBuild for server bundling, Vite for client bundling
- **TypeScript**: Full type safety across client, server, and shared code

## Key Components

### Database Schema
- **Users**: Admin authentication and role management
- **Box Types**: Configurable box sizes (Small, Medium, Large) with pricing
- **Products**: Fruits and vegetables inventory with categories and availability
- **Customers**: Customer information and contact details
- **Orders**: Order management with status tracking and payment processing
- **Order Items**: Line items linking orders to products with quantities
- **Contact Messages**: Customer support message handling

### Authentication & Authorization
- Basic session-based authentication for admin panel
- Role-based access control (user/admin roles)
- No customer authentication required for ordering

### Payment Integration
- Easypaisa and JazzCash digital payment methods
- No cash-on-delivery option
- Payment status tracking and confirmation

### SEO Optimization
- Comprehensive meta tags and Open Graph protocol
- Schema.org structured data for local business
- Mobile-first responsive design
- Optimized images and performance

## Data Flow

### Customer Ordering Flow
1. Customer selects box type (Small/Medium/Large)
2. Customizes box contents from available products inventory
3. Provides contact and delivery information
4. Completes payment via Easypaisa or JazzCash
5. Order confirmation and tracking

### Admin Management Flow
1. Admin authentication and dashboard access
2. Product inventory management (CRUD operations)
3. Order status and payment tracking
4. Customer message handling
5. Business analytics and reporting

### API Structure
- `/api/box-types` - Box configuration management
- `/api/products` - Product inventory with filtering
- `/api/orders` - Order processing and status updates
- `/api/customers` - Customer data management
- `/api/contact` - Customer support messages
- `/api/stats` - Business analytics and metrics

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **UI Framework**: React with Radix UI and shadcn/ui
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React and React Icons

### Development Tools
- **Build Tools**: Vite, ESBuild, TypeScript compiler
- **Code Quality**: TypeScript strict mode configuration
- **Development Experience**: Replit-specific plugins and error handling

## Deployment Strategy

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Node.js environment detection (`NODE_ENV`)
- Replit-specific optimizations and plugins

### Build Process
1. Client build: Vite processes React application into static assets
2. Server build: ESBuild bundles Express server with external dependencies
3. Static serving: Express serves built client files in production

### Production Setup
- Server runs on Node.js with Express
- Static files served from `dist/public`
- Database migrations handled via Drizzle Kit
- Session storage in PostgreSQL

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Added comprehensive billing and invoicing dashboard with financial record management
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```