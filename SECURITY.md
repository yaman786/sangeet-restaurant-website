# Security Policy

Security is critical to Sangeet Restaurant's operations, protecting both our business data and our customers' personal information.

## Supported Versions

Currently, only the `main` branch deployed to production is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within the platform, please DO NOT report it publicly or open a GitHub issue. Instead, please send an email to the repository owner or the lead developer immediately.

All security vulnerabilities will be promptly addressed.

## Architecture Security Measures

### 1. Environment Variables & Secrets
No secrets (API keys, JWT secrets, database connection strings) are ever committed to the repository. They are exclusively managed via `.env` in local development and via the hosting provider's secure environment settings in production.

### 2. Authentication & JWT
Authentication is handled via JWT tokens stored securely. The secret is enforced strictly; the application will refuse to start in production if `JWT_SECRET` is missing.

### 3. API Rate Limiting
Public-facing API endpoints (e.g., reservation creation, review submission, QR code validation) are protected by **Upstash Redis** rate limiting algorithms to prevent abuse, brute-force attacks, and DDoS attempts.

### 4. Database Access
Direct database queries using Prisma are strictly confined to Next.js Server Components and Server API routes. Client components NEVER have direct database access, utilizing secure internal API endpoints instead.
