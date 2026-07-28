# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1163 nodes · 2578 edges · 107 communities (52 shown, 55 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `53951680`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- api/index.ts
- types/index.ts
- handleApiError
- design_system.py
- menuActions.ts
- UnifiedDashboard/index.tsx
- authService.ts
- devDependencies
- errors.ts
- authenticateToken
- lib/auth.ts
- compilerOptions
- app/layout.tsx
- ProtectedRoute.tsx
- PusherClientService
- dtos.ts
- db.ts
- OrderService
- ReservationService
- manifest.json
- AuthContext.tsx
- useLocation
- useNavigate
- OrderManagement/index.tsx
- CustomDropdown.tsx
- validations/index.ts
- EventService
- QRService
- AdminHeader.tsx
- useStaffManagement.ts
- rules
- QRManagement/index.tsx
- AnalyticsService
- ReviewService
- ReservationsPage.tsx
- StaffManagement/index.tsx
- dependencies
- TrackingView.tsx
- KitchenDisplayPage.tsx
- React App Root
- contact/page.tsx
- location/page.tsx
- middleware.ts
- Backend Entry Point
- check-db.js
- seed_analytics.ts
- seed-full-menu.ts
- lib/rateLimit.ts
- seed.ts
- history/page.tsx
- orders/page.tsx
- display/page.tsx
- about/page.tsx
- seed-test-data.ts
- bcryptjs
- browser-image-compression
- date-fns
- dayjs
- framer-motion
- jose
- jsonwebtoken
- Menu Items Table
- next
- next.config.mjs
- nodemailer
- pg
- @prisma/adapter-pg
- @prisma/client
- puppeteer
- pusher-js
- react-dom
- react-hook-form
- react-hot-toast
- recharts
- sharp
- @supabase/supabase-js
- @tanstack/react-query
- @upstash/ratelimit
- @upstash/redis
- zod
- postcss.config.mjs
- Reservations Table
- dump.js
- test-merge.js
- test-ui.js
- test-ui-correct.js
- pre_deploy.sh
- Logo SVG
- tailwind.config.ts
- vercel.json
- Project Overview
- Favicon SVG
- Sangeet Restaurant Logo (JPG)
- QR Card Template (White)
- 404 Deployment Not Found Error

## God Nodes (most connected - your core abstractions)
1. `handleApiError()` - 126 edges
2. `authenticateToken()` - 102 edges
3. `apiCallWrapper()` - 94 edges
4. `requireRole()` - 43 edges
5. `requireAdmin()` - 38 edges
6. `useNavigate()` - 37 edges
7. `requireAuth()` - 23 edges
8. `PusherClientService` - 22 edges
9. `WebsiteService` - 21 edges
10. `OrderService` - 18 edges

## Surprising Connections (you probably didn't know these)
- `React App Root` --conceptually_related_to--> `Design System Master`  [INFERRED]
  frontend/src/App.js → design-system/sangeet-restaurant/MASTER.md
- `QR Card Template (Dark)` --references--> `Logo SVG`  [INFERRED]
  templates/qr-card-template.html → src/assets/images/logo.svg
- `Homepage Desktop Baseline` --references--> `React App Root`  [EXTRACTED]
  tests/visual.spec.ts-snapshots/homepage-baseline-chromium-darwin.png → frontend/src/App.js
- `Menu Desktop Baseline` --references--> `React App Root`  [EXTRACTED]
  tests/visual.spec.ts-snapshots/menu-baseline-chromium-darwin.png → frontend/src/App.js
- `emitOrderDeleted()` --references--> `pusher`  [EXTRACTED]
  src/lib/services/pusherServer.ts → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Real-Time Order Flow** — backend_src_socket, frontend_src_services_socketservice, orders_table [EXTRACTED 0.95]
- **Restaurant Management System** — backend_src_index, frontend_src_app, project_overview [EXTRACTED 1.00]

## Communities (107 total, 55 thin omitted)

### Community 0 - "api/index.ts"
Cohesion: 0.05
Nodes (104): FALLBACK_EVENTS, FALLBACK_MENU, FALLBACK_REVIEWS, Home(), metadata, metadata, OrderQueue(), pusherClient (+96 more)

### Community 1 - "types/index.ts"
Cohesion: 0.05
Nodes (39): qrcode, qrcode, ApiErrorDetail, ApiErrorResponse, ColorTheme, EmailContent, EmailResult, EmailTemplate (+31 more)

### Community 2 - "handleApiError"
Cohesion: 0.07
Nodes (37): GET(), GET(), GET(), GET(), GET(), GET(), GET(), POST() (+29 more)

### Community 3 - "design_system.py"
Cohesion: 0.06
Nodes (42): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+34 more)

### Community 4 - "menuActions.ts"
Cohesion: 0.07
Nodes (28): createCategoryAction(), createMenuItemAction(), deleteCategoryAction(), deleteMenuItemAction(), updateCategoryAction(), updateMenuItemAction(), uploadMenuImageAction(), metadata (+20 more)

### Community 5 - "UnifiedDashboard/index.tsx"
Cohesion: 0.07
Nodes (18): metadata, StandaloneLayout(), FALLBACK_CATEGORIES, FALLBACK_MENU, MenuPage(), QRCartPage(), QRMenuPage(), ORDER_STATUSES (+10 more)

### Community 6 - "authService.ts"
Cohesion: 0.08
Nodes (24): POST(), POST(), AppError, ConflictError, ForbiddenError, RateLimitError, UnauthorizedError, AuthService (+16 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (40): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, @playwright/test, postcss, prisma (+32 more)

### Community 8 - "errors.ts"
Cohesion: 0.10
Nodes (16): pusher, pusher, GET(), GET(), GET(), GET(), POST(), GET() (+8 more)

### Community 9 - "authenticateToken"
Cohesion: 0.14
Nodes (22): DELETE(), PUT(), POST(), GET(), DELETE(), GET(), GET(), POST() (+14 more)

### Community 10 - "lib/auth.ts"
Cohesion: 0.11
Nodes (20): bulkUpdateSchema, PATCH(), GET(), PATCH(), updateStatusSchema, GET(), POST(), GET() (+12 more)

### Community 11 - "compilerOptions"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 12 - "app/layout.tsx"
Cohesion: 0.08
Nodes (12): inter, karla, metadata, outfit, playfair, playfairSC, Providers(), ErrorBoundary (+4 more)

### Community 13 - "ProtectedRoute.tsx"
Cohesion: 0.11
Nodes (8): metadata, metadata, metadata, metadata, metadata, metadata, metadata, ProtectedRoute()

### Community 15 - "dtos.ts"
Cohesion: 0.07
Nodes (13): WebsiteService, AnalyticsQueryDTO, BannerDTO, BusinessHoursDTO, FooterSettingsDTO, SeoSettingsDTO, SocialLinksDTO, UpdateBannerDTO (+5 more)

### Community 17 - "OrderService"
Cohesion: 0.15
Nodes (4): OrderService, emitOrderStatusUpdate(), OrderQueryDTO, CreateOrderInput

### Community 18 - "ReservationService"
Cohesion: 0.13
Nodes (9): emitReservationUpdate(), calculateDiningDuration(), ReservationService, CreateReservationDTO, CreateTimeSlotDTO, ReservationQueryDTO, UpdateTimeSlotDTO, sendReservationCreatedEmail() (+1 more)

### Community 20 - "manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lang, name, orientation (+6 more)

### Community 21 - "AuthContext.tsx"
Cohesion: 0.20
Nodes (9): AuthContext, AuthContextType, AuthProviderProps, useAuth(), User, AdminDashboard(), KitchenDisplayPage(), LoginPage() (+1 more)

### Community 22 - "useLocation"
Cohesion: 0.23
Nodes (8): metadata, Header(), NAVIGATION_ITEMS, OrderRow, OrderTrackingPage(), UnifiedOrderPage(), getOrderById(), useLocation()

### Community 23 - "useNavigate"
Cohesion: 0.28
Nodes (6): AboutGallery(), ReviewsSection(), AboutPage(), HomePage(), OrderSuccessPage(), useNavigate()

### Community 24 - "OrderManagement/index.tsx"
Cohesion: 0.17
Nodes (5): Order, OrderAnalytics(), OrderAnalyticsProps, Stats, OrderManagement()

### Community 25 - "CustomDropdown.tsx"
Cohesion: 0.17
Nodes (3): react, react, OrderFilters()

### Community 26 - "validations/index.ts"
Cohesion: 0.30
Nodes (5): submitReviewAction(), metadata, ReviewModal(), reviewSchema, ReviewSubmissionPage()

### Community 27 - "EventService"
Cohesion: 0.17
Nodes (3): EventService, CreateEventDTO, UpdateEventDTO

### Community 28 - "QRService"
Cohesion: 0.18
Nodes (3): QRService, BulkQRGenerateDTO, QRDesignDTO

### Community 29 - "AdminHeader.tsx"
Cohesion: 0.31
Nodes (8): AdminHeader(), NotFoundPage(), getCurrentUser(), getUserRole(), isAdmin(), isAuthenticated(), isStaff(), logout()

### Community 30 - "useStaffManagement.ts"
Cohesion: 0.42
Nodes (9): UserRow, useStaffManagement(), createUser(), deleteUser(), getAllUsers(), getProfile(), getUserStats(), toggleUserStatus() (+1 more)

### Community 31 - "rules"
Cohesion: 0.20
Nodes (9): extends, rules, react-hooks/exhaustive-deps, react/no-unescaped-entities, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, next/core-web-vitals (+1 more)

### Community 32 - "QRManagement/index.tsx"
Cohesion: 0.24
Nodes (4): metadata, QRManagement(), filterOptions, QRFilters()

### Community 35 - "ReservationsPage.tsx"
Cohesion: 0.36
Nodes (4): createReservationAction(), metadata, reservationSchema, ReservationsPage()

### Community 37 - "dependencies"
Cohesion: 0.29
Nodes (7): axios, @hookform/resolvers, lucide-react, dependencies, axios, @hookform/resolvers, lucide-react

### Community 38 - "TrackingView.tsx"
Cohesion: 0.52
Nodes (5): isNewItem(), OrderCard(), getSessionTitle(), groupItemsBySession(), hasMultipleSessions()

### Community 39 - "KitchenDisplayPage.tsx"
Cohesion: 0.76
Nodes (4): OrderDetailModal(), getTimeSinceAdded(), isNewItem(), sortItemsByNewness()

### Community 40 - "React App Root"
Cohesion: 0.40
Nodes (5): Design System Master, React App Root, Axios API Client, Homepage Desktop Baseline, Menu Desktop Baseline

### Community 43 - "middleware.ts"
Cohesion: 0.40
Nodes (3): config, JWT_SECRET, protectedPaths

### Community 44 - "Backend Entry Point"
Cohesion: 0.50
Nodes (4): Database Config, Backend Entry Point, Socket.IO Server, Socket.IO Client

### Community 46 - "seed_analytics.ts"
Cohesion: 0.83
Nodes (3): main(), randomDate(), randomInt()

### Community 47 - "seed-full-menu.ts"
Cohesion: 0.67
Nodes (3): main(), menuData, titleCase()

### Community 48 - "lib/rateLimit.ts"
Cohesion: 0.50
Nodes (3): lastCleanup, RateLimitStore, store

## Knowledge Gaps
- **192 isolated node(s):** `next/core-web-vitals`, `next/typescript`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/ban-ts-comment` (+187 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `types/index.ts`, `devDependencies`, `errors.ts`, `CustomDropdown.tsx`, `bcryptjs`, `browser-image-compression`, `date-fns`, `dayjs`, `framer-motion`, `jose`, `jsonwebtoken`, `next`, `nodemailer`, `pg`, `@prisma/adapter-pg`, `@prisma/client`, `puppeteer`, `pusher-js`, `react-dom`, `react-hook-form`, `react-hot-toast`, `recharts`, `sharp`, `@supabase/supabase-js`, `@tanstack/react-query`, `@upstash/ratelimit`, `@upstash/redis`, `zod`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `pusher` connect `errors.ts` to `OrderService`, `ReservationService`, `dependencies`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `handleApiError()` connect `handleApiError` to `errors.ts`, `authenticateToken`, `lib/auth.ts`, `authService.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `next/typescript`, `@typescript-eslint/no-explicit-any` to the rest of the system?**
  _192 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `api/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050312283136710614 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05028248587570622 - nodes in this community are weakly interconnected._
- **Should `handleApiError` be split into smaller, more focused modules?**
  _Cohesion score 0.07481005260081823 - nodes in this community are weakly interconnected._