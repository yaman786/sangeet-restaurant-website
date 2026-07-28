# Contributing Guidelines

First off, thank you for considering contributing to Sangeet Restaurant! This document outlines the process and standards for developing on this platform.

## 1. Local Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/yaman786/sangeet-restaurant-website.git
   cd sangeet-restaurant-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in the required keys (Supabase, Pusher, Brevo, Upstash).

4. **Prisma Client Generation**
   ```bash
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:3000`.

## 2. Branching Strategy

We use a standard branching strategy:
- `main` - Production branch. Should always be deployable.
- `feat/feature-name` - For new features.
- `fix/bug-name` - For bug fixes.
- `chore/task-name` - For maintenance tasks (e.g., dependency updates, linting).

## 3. Coding Standards

- **TypeScript Strict Mode**: We enforce strict typing. Avoid using `any` wherever possible.
- **ESLint & Prettier**: We use the Next.js Core Web Vitals config alongside strict unused-variable rules. Run `npm run lint` before committing.
- **React 19 & Next.js 15**: Use App Router (`app/`). Understand the boundary between Server Components (`page.tsx`, `layout.tsx`) and Client Components (`"use client"`). Data should be fetched on the server using Prisma whenever possible for public pages.

## 4. Mandatory Pre-Deployment Rule

> [!WARNING]
> Before committing and pushing ANY code to the production `main` branch, you MUST execute the `./scripts/pre_deploy.sh` script and verify that it passes 100%.

If the script fails, you must fix the errors before pushing. This guarantees zero downtime for the restaurant business.

## 5. Pull Requests

1. Commit your changes with descriptive messages (e.g., `feat: added KDS push notifications`).
2. Run `./scripts/pre_deploy.sh` locally.
3. Open a Pull Request against `main`.
4. Ensure all CI checks pass.
