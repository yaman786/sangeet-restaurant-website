# Graph Report - .  (2026-07-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1181 nodes · 2345 edges · 124 communities (63 shown, 61 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6377e464`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- design_system.py
- app/layout.tsx
- devDependencies
- ProtectedRoute.tsx
- authenticateToken
- authService.ts
- dtos.ts
- menuActions.ts
- requireRole
- compilerOptions
- lib/auth.ts
- reservationService.ts
- api/index.ts
- handleApiError
- types/index.ts
- errors.ts
- PusherClientService
- apiCallWrapper
- router-mock.ts
- useStaffManagement.ts
- menuService.ts
- db.ts
- pusherClient.ts
- OrderService
- ReservationsPage.tsx
- client.ts
- NotFoundError
- emailService.ts
- websiteApi.ts
- menuApi.ts
- dependencies
- manifest.json
- KitchenDisplayPage.tsx
- EventService
- OrderManagement/index.tsx
- pusherServer.ts
- validations/index.ts
- QRService
- BeautifulQRGenerator
- AuthContext.tsx
- CustomDropdown.tsx
- rules
- orders/route.ts
- UnifiedDashboard/index.tsx
- logger.ts
- AdminHeader.tsx
- AnalyticsService
- ReviewService
- qrApi.ts
- (public)/page.tsx
- AboutPage.tsx
- MenuPage.tsx
- Sangeet Logo
- contact/page.tsx
- location/page.tsx
- qr-codes/page.tsx
- middleware.ts
- eslint.config.mjs
- check-db.js
- seed_analytics.ts
- seed.ts
- track-order/page.tsx
- seed-test-data.ts
- sharp
- browser-image-compression
- dayjs
- framer-motion
- CI Workflow
- @hookform/resolvers
- jsonwebtoken
- Menu Items Table
- next
- next.config.mjs
- pg
- @prisma/adapter-pg
- @prisma/client
- puppeteer
- pusher-js
- react-dom
- react-hot-toast
- recharts
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
- vercel.json
- Architect Design Workflow
- Code Migration Workflow
- Code Refactor Workflow
- Design System Master
- Project Overview
- Favicon SVG
- Ops Excellence Skill
- UI/UX Pro Max Skill
- Sangeet Restaurant Logo (JPG)
- QR Card Template (White)
- 404 Deployment Not Found Error
- Homepage Desktop Baseline
- Menu Desktop Baseline
- Next.js App Router Workflow
- Code Review Workflow

## God Nodes (most connected - your core abstractions)
1. `handleApiError()` - 101 edges
2. `authenticateToken()` - 95 edges
3. `apiCallWrapper()` - 94 edges
4. `requireRole()` - 41 edges
5. `requireAdmin()` - 37 edges
6. `PusherClientService` - 22 edges
7. `requireAuth()` - 22 edges
8. `WebsiteService` - 21 edges
9. `useNavigate()` - 21 edges
10. `NotFoundError` - 20 edges

## Surprising Connections (you probably didn't know these)
- `QR Card Template (Dark)` --references--> `Logo SVG`  [INFERRED]
  templates/qr-card-template.html → src/assets/images/logo.svg
- `emitOrderDeleted()` --references--> `pusher`  [EXTRACTED]
  src/lib/services/pusherServer.ts → package.json
- `emitNewReservation()` --references--> `pusher`  [EXTRACTED]
  src/lib/services/pusherServer.ts → package.json
- `emitReservationUpdate()` --references--> `pusher`  [EXTRACTED]
  src/lib/services/pusherServer.ts → package.json
- `generateQRCode()` --references--> `qrcode`  [EXTRACTED]
  src/lib/utils/qrGenerator.ts → package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Agent Operational Guidelines** — agents_agents, skills_ops_excellence, skills_ui_ux_pro_max, workflows_approuter_nextjs, agents_workflows_architect_design, agents_workflows_code_migrate, agents_workflows_code_refactor, workflows_code_review [EXTRACTED 1.00]
- **Visual Regression Testing** — tests_visual_admin_login_mobile, tests_visual_admin_login_desktop, tests_visual_homepage_mobile, tests_visual_menu_mobile, github_workflows_ci [INFERRED 0.90]
- **Real-Time Order Flow** — orders_table [EXTRACTED 0.95]
- **Restaurant Management System** — project_overview [EXTRACTED 1.00]

## Communities (124 total, 61 thin omitted)

### Community 0 - "design_system.py"
Cohesion: 0.06
Nodes (42): BM25, detect_domain(), _load_csv(), Lowercase, split, remove punctuation, filter short words, Build BM25 index from documents, Score all documents against query, Load CSV and return list of dicts, Core search function using BM25 (+34 more)

### Community 1 - "app/layout.tsx"
Cohesion: 0.05
Nodes (15): metadata, metadata, inter, karla, metadata, outfit, playfair, playfairSC (+7 more)

### Community 2 - "devDependencies"
Cohesion: 0.04
Nodes (46): eslint, @eslint/compat, eslint-config-next, @eslint/eslintrc, eslint-plugin-react-hooks, devDependencies, eslint, @eslint/compat (+38 more)

### Community 3 - "ProtectedRoute.tsx"
Cohesion: 0.06
Nodes (15): metadata, metadata, metadata, metadata, metadata, metadata, metadata, metadata (+7 more)

### Community 4 - "authenticateToken"
Cohesion: 0.12
Nodes (23): GET(), GET(), GET(), GET(), GET(), DELETE(), GET(), PATCH() (+15 more)

### Community 5 - "authService.ts"
Cohesion: 0.09
Nodes (21): POST(), User, ConflictError, UnauthorizedError, AuthService, LoginInput, ChangePasswordDTO, UpdateUserDTO (+13 more)

### Community 6 - "dtos.ts"
Cohesion: 0.07
Nodes (13): WebsiteService, AnalyticsQueryDTO, BannerDTO, BusinessHoursDTO, CreateTimeSlotDTO, FooterSettingsDTO, OrderQueryDTO, SeoSettingsDTO (+5 more)

### Community 7 - "menuActions.ts"
Cohesion: 0.11
Nodes (18): createCategoryAction(), createMenuItemAction(), deleteCategoryAction(), deleteMenuItemAction(), updateCategoryAction(), updateMenuItemAction(), uploadMenuImageAction(), getAuthUser() (+10 more)

### Community 8 - "requireRole"
Cohesion: 0.12
Nodes (16): DELETE(), PUT(), DELETE(), PUT(), DELETE(), GET(), GET(), POST() (+8 more)

### Community 9 - "compilerOptions"
Cohesion: 0.07
Nodes (26): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+18 more)

### Community 10 - "lib/auth.ts"
Cohesion: 0.14
Nodes (16): bulkUpdateSchema, PATCH(), GET(), PATCH(), updateStatusSchema, GET(), GET(), GET() (+8 more)

### Community 11 - "reservationService.ts"
Cohesion: 0.15
Nodes (10): emitNewReservation(), emitReservationUpdate(), calculateDiningDuration(), ReservationService, CreateReservationDTO, ReservationQueryDTO, UpdateReservationDTO, UpdateTimeSlotDTO (+2 more)

### Community 12 - "api/index.ts"
Cohesion: 0.16
Nodes (21): checkApiHealth(), exportAnalyticsData(), getAnalyticsDrillDown(), getBusinessAnalytics(), getCustomerInsights(), getMenuAnalytics(), getPerformanceMetrics(), getReservationTrends() (+13 more)

### Community 13 - "handleApiError"
Cohesion: 0.14
Nodes (15): GET(), POST(), GET(), POST(), GET(), POST(), GET(), POST() (+7 more)

### Community 14 - "types/index.ts"
Cohesion: 0.14
Nodes (17): ApiErrorDetail, ApiErrorResponse, ColorTheme, CreateOrderInput, HealthCheckResponse, NewItemsAddedPayload, OrderEventPayload, OrderItemRow (+9 more)

### Community 17 - "apiCallWrapper"
Cohesion: 0.18
Nodes (20): TableRow, useOrderFlow(), apiCallWrapper(), archiveCompletedOrders(), bulkUpdateOrderStatus(), cancelOrderItemApi(), createOrder(), deleteOrder() (+12 more)

### Community 18 - "router-mock.ts"
Cohesion: 0.15
Nodes (3): NAVIGATION_ITEMS, useLocation(), useNavigate()

### Community 19 - "useStaffManagement.ts"
Cohesion: 0.16
Nodes (11): UserRow, useStaffManagement(), changePassword(), createUser(), deleteUser(), getAllUsers(), getProfile(), getUserStats() (+3 more)

### Community 20 - "menuService.ts"
Cohesion: 0.17
Nodes (8): MenuService, MenuQueryDTO, CategoryRow, MenuItemRow, CategoryInput, categorySchema, MenuItemInput, menuItemSchema

### Community 21 - "db.ts"
Cohesion: 0.12
Nodes (4): main(), menuData, titleCase(), adapter

### Community 22 - "pusherClient.ts"
Cohesion: 0.18
Nodes (4): pusherClient, clearAllCartData(), clearCartData(), devLog()

### Community 24 - "ReservationsPage.tsx"
Cohesion: 0.15
Nodes (6): createReservationAction(), metadata, formatRestaurantTime(), reservationSchema, updateReservationSchema, getAvailableTimeSlots()

### Community 25 - "client.ts"
Cohesion: 0.13
Nodes (11): api, API_CONFIG, API_ERROR_TYPES, ApiError, handleApiError(), handleAuthFailure(), retryApiCall(), fetchReviewById() (+3 more)

### Community 26 - "NotFoundError"
Cohesion: 0.13
Nodes (4): AppError, NotFoundError, ValidationError, ReviewRow

### Community 27 - "emailService.ts"
Cohesion: 0.18
Nodes (12): EmailContent, EmailResult, EmailTemplate, emailTemplates, getApiKey(), getSenderEmail(), ReservationEmailData, sendEmail() (+4 more)

### Community 28 - "websiteApi.ts"
Cohesion: 0.12
Nodes (15): RestaurantSettingRow, WebsiteContentRow, WebsiteMediaRow, deleteWebsiteMedia(), fetchEventById(), fetchEvents(), fetchFeaturedEvents(), fetchUpcomingEvents() (+7 more)

### Community 29 - "menuApi.ts"
Cohesion: 0.14
Nodes (15): serverFetch(), createCategory(), createMenuItem(), deleteCategory(), deleteMenuItem(), fetchMenuCategories(), fetchMenuItemById(), fetchMenuItems() (+7 more)

### Community 30 - "dependencies"
Cohesion: 0.13
Nodes (15): axios, bcryptjs, date-fns, jose, lucide-react, dependencies, axios, bcryptjs (+7 more)

### Community 31 - "manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, lang, name, orientation (+6 more)

### Community 32 - "KitchenDisplayPage.tsx"
Cohesion: 0.25
Nodes (8): isNewItem(), OrderCard(), getSessionTitle(), getTimeSinceAdded(), groupItemsBySession(), hasMultipleSessions(), isNewItem(), sortItemsByNewness()

### Community 33 - "EventService"
Cohesion: 0.16
Nodes (4): EventService, CreateEventDTO, UpdateEventDTO, EventRow

### Community 34 - "OrderManagement/index.tsx"
Cohesion: 0.16
Nodes (6): Order, OrderAnalytics(), OrderAnalyticsProps, Stats, useOrderManagement(), OrderManagement()

### Community 35 - "pusherServer.ts"
Cohesion: 0.22
Nodes (8): pusher, pusher, POST(), POST(), emitNewOrder(), emitOrderDeleted(), emitOrderStatusUpdate(), pusherServer

### Community 36 - "validations/index.ts"
Cohesion: 0.24
Nodes (3): submitReviewAction(), metadata, reviewSchema

### Community 37 - "QRService"
Cohesion: 0.18
Nodes (3): QRService, BulkQRGenerateDTO, QRDesignDTO

### Community 38 - "BeautifulQRGenerator"
Cohesion: 0.31
Nodes (4): qrcode, qrcode, QRGenerationOptions, BeautifulQRGenerator

### Community 39 - "AuthContext.tsx"
Cohesion: 0.22
Nodes (4): AuthContext, AuthContextType, AuthProviderProps, useAuth()

### Community 40 - "CustomDropdown.tsx"
Cohesion: 0.24
Nodes (3): sortOrdersByTable(), useOrderManagement(), OrderFilters()

### Community 41 - "rules"
Cohesion: 0.20
Nodes (9): extends, rules, react-hooks/exhaustive-deps, react/no-unescaped-entities, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, next/core-web-vitals (+1 more)

### Community 42 - "orders/route.ts"
Cohesion: 0.22
Nodes (5): RateLimitError, lastCleanup, rateLimit(), RateLimitStore, store

### Community 44 - "logger.ts"
Cohesion: 0.24
Nodes (4): ImageSizes, OptimizedImages, ImageOptimizer, Logger

### Community 45 - "AdminHeader.tsx"
Cohesion: 0.33
Nodes (6): getCurrentUser(), getUserRole(), isAdmin(), isAuthenticated(), isStaff(), logout()

### Community 48 - "qrApi.ts"
Cohesion: 0.22
Nodes (8): bulkGenerateTableQRCodes(), deleteQRCode(), downloadPrintableQRCode(), generateTableQRCode(), getAllQRCodes(), getQRCodeAnalytics(), restoreQRCode(), updateQRCodeDesign()

### Community 49 - "(public)/page.tsx"
Cohesion: 0.32
Nodes (7): FALLBACK_EVENTS, FALLBACK_MENU, FALLBACK_REVIEWS, Home(), metadata, serverFetchReviews(), serverFetchEvents()

### Community 51 - "MenuPage.tsx"
Cohesion: 0.29
Nodes (3): metadata, FALLBACK_CATEGORIES, FALLBACK_MENU

### Community 52 - "Sangeet Logo"
Cohesion: 0.33
Nodes (5): Sangeet Logo, Admin Login Desktop Baseline, Admin Login Mobile Baseline, Homepage Mobile Baseline, Menu Mobile Baseline

### Community 56 - "middleware.ts"
Cohesion: 0.40
Nodes (3): config, JWT_SECRET, protectedPaths

### Community 57 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): compat, __dirname, __filename

### Community 59 - "seed_analytics.ts"
Cohesion: 0.83
Nodes (3): main(), randomDate(), randomInt()

## Knowledge Gaps
- **208 isolated node(s):** `next/core-web-vitals`, `next/typescript`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unused-vars`, `@typescript-eslint/ban-ts-comment` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `pusherServer.ts`, `BeautifulQRGenerator`, `sharp`, `browser-image-compression`, `dayjs`, `framer-motion`, `@hookform/resolvers`, `jsonwebtoken`, `next`, `pg`, `@prisma/adapter-pg`, `@prisma/client`, `puppeteer`, `pusher-js`, `react-dom`, `react-hot-toast`, `recharts`, `@supabase/supabase-js`, `@tanstack/react-query`, `@upstash/ratelimit`, `@upstash/redis`, `zod`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `pusher` connect `pusherServer.ts` to `reservationService.ts`, `dependencies`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `next/typescript`, `@typescript-eslint/no-explicit-any` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `design_system.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05576441102756892 - nodes in this community are weakly interconnected._
- **Should `app/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.051418439716312055 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `ProtectedRoute.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06025369978858351 - nodes in this community are weakly interconnected._