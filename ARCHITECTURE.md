# System Architecture

This document describes the high-level architecture of the Sangeet Restaurant platform. The system was recently migrated from a decoupled Express.js/React stack into a modern **Next.js 15 Monolith**.

## High-Level Architecture (C4 Context)

The Sangeet Restaurant platform acts as the central hub connecting customers, kitchen staff, and management.

```mermaid
C4Context
  title System Context Diagram for Sangeet Restaurant

  Person(customer, "Customer", "Browses menu, places QR orders, books reservations, leaves reviews.")
  Person(kitchen, "Kitchen Staff", "Views and manages real-time order tickets via KDS.")
  Person(admin, "Restaurant Manager", "Manages menus, staff, reservations, and views analytics.")

  System(sangeet, "Sangeet Platform", "Next.js 15 App Router handling public site, QR menus, and admin dashboard.")
  
  System_Ext(supabase, "Supabase (PostgreSQL)", "Primary database and file storage.")
  System_Ext(pusher, "Pusher", "Real-time WebSocket event broadcasting.")
  System_Ext(resend, "Resend", "Transactional email delivery.")
  System_Ext(upstash, "Upstash (Redis)", "Rate limiting and caching.")

  Rel(customer, sangeet, "Visits public site, scans QR", "HTTPS")
  Rel(kitchen, sangeet, "Uses Kitchen Display System", "HTTPS")
  Rel(admin, sangeet, "Uses Admin Dashboard", "HTTPS")

  Rel(sangeet, supabase, "Reads/Writes Data", "Prisma ORM")
  Rel(sangeet, pusher, "Triggers real-time events", "HTTPS/WSS")
  Rel(sangeet, resend, "Sends confirmation emails", "REST API")
  Rel(sangeet, upstash, "Enforces rate limits", "REST API")
```

## Container Architecture

The application is structured as a monolithic Next.js repository using the App Router.

```mermaid
C4Container
  title Container Diagram for Sangeet Restaurant

  Person(users, "All Users", "Customers, Kitchen, Admin")

  System_Boundary(nextjs, "Next.js 15 Monolith") {
    Container(client, "Client Components", "React 19", "Browser-rendered UI with React Query for interactive state.")
    Container(rsc, "Server Components", "React 19", "Server-rendered UI with direct database access for optimal SEO & performance.")
    Container(api, "API Routes", "Next.js Route Handlers", "REST-ful endpoints serving client-side fetches and external webhooks.")
    Container(services, "Service Layer", "TypeScript", "Business logic (menuService, orderService, etc.) abstracting Prisma calls.")
  }

  ContainerDb(db, "PostgreSQL Database", "Supabase", "Stores all persistent application state.")

  Rel(users, client, "Interacts with UI", "HTTPS")
  Rel(users, rsc, "Requests pages", "HTTPS")
  
  Rel(client, api, "Fetches data (QR Menu, Dashboard)", "JSON/HTTPS")
  Rel(rsc, services, "Direct invocation", "Internal")
  Rel(api, services, "Delegates logic", "Internal")
  
  Rel(services, db, "Reads/Writes", "Prisma/TCP")
```

## Key Architectural Decisions

1. **Monolithic App Router (Next.js 15)**
   By moving away from a separate Express backend, we eliminate CORS issues, simplify deployment to a single provider (e.g., Vercel), and leverage Next.js Server Components for secure, direct database access on public pages.
   
2. **Real-Time Communication via Pusher**
   Next.js API routes are serverless, making native `Socket.IO` long-polling impossible. We use **Pusher** to broadcast events (like new orders or reservation updates) to subscribed clients in real-time.

3. **Prisma ORM**
   We use Prisma to ensure type-safe database queries. The database schema is the single source of truth, and generated types are used throughout the service layer.

4. **Rate Limiting with Upstash Redis**
   To protect public endpoints (like review submissions or reservation creation) from abuse, we use Upstash Redis for global edge-compatible rate limiting.

5. **State Management**
   - **Server State**: Managed via React Query (`@tanstack/react-query`) for client-side data fetching, caching, and synchronization.
   - **UI State**: Handled natively via React `useState` and `useReducer`.
   - **Render Optimization**: Use of `queueMicrotask` to handle state transitions preventing cascading React Compiler loops.
