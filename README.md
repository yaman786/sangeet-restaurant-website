# 🍽️ Sangeet Restaurant

> **Authentic South Asian Cuisine in the Heart of Hong Kong**

Sangeet Restaurant is a premium, full-stack restaurant management platform. Built to handle everything from public reservations and QR-code table ordering to real-time kitchen displays and advanced admin analytics. 

Recently migrated to a **Next.js 15 Monolith**, the platform combines high-performance server components, strict type safety, and seamless real-time operations.

---

## 🚀 Features

### Customer Experience
- **Public Website:** Stunning, responsive landing pages to view menus, events, and reviews.
- **Reservations:** Book tables online with real-time availability and automated Brevo email confirmations.
- **QR Table Ordering:** Scan a QR code at the table to view the menu, add items to the cart, and place orders directly to the kitchen.

### Operations & Staff
- **Kitchen Display System (KDS):** Real-time order queue pushed via WebSockets (Pusher). Kitchen staff can bump orders from "Preparing" to "Ready".
- **Admin Dashboard:** Comprehensive control panel to manage menus, generate QR codes, handle reservations, and track financial analytics.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling:** React 19, Tailwind CSS 4, Framer Motion
- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Real-Time:** [Pusher](https://pusher.com/)
- **Rate Limiting:** [Upstash Redis](https://upstash.com/)
- **Email:** [Brevo](https://www.brevo.com/)

---

## 📖 Documentation

Please review the following industry-standard documentation files to understand the system design and how to contribute:

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) - High-level system design, Next.js Server/Client boundaries, and C4 context diagrams.
- [**CONTRIBUTING.md**](./CONTRIBUTING.md) - Branching strategy, PR guidelines, and mandatory pre-deployment checks.
- [**SECURITY.md**](./SECURITY.md) - Vulnerability reporting and access control patterns.

---

## 💻 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/yaman786/sangeet-restaurant-website.git
cd sangeet-restaurant-website
npm install
```

### 2. Environment Variables
Copy the example environment file and fill in your secure credentials:
```bash
cp .env.example .env
```
Ensure you have the connection strings for Supabase, Pusher, Upstash, and Brevo.

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## ✅ Deployment

This project is configured for seamless deployment on **Vercel**. 

> **MANDATORY**: Before pushing to the `main` production branch, you must run the pre-deployment script to guarantee zero downtime.
```bash
./scripts/pre_deploy.sh
```

---
*© 2026 Sangeet Restaurant. All rights reserved.*
