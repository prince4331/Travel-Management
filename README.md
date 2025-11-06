# Travel Management App (Web + Mobile)

## Overview

This project is a **full-stack, enterprise-grade Travel Management App** for both **web and mobile** platforms.  
It helps **solo travelers** and **group trips** with features like expense sharing, invitations, emergency alerts, offline maps, and payment integration.

The app must be:

- **Offline-first** (sync when online)
- **Cross-platform** (Web, Android, iOS)
- **Secure & scalable** (RBAC, encryption, logging, monitoring)
- **Professional & enterprise-level** (clean architecture, modular code, maintainable)

---

## Features

### 🔑 Authentication & Users

- Email/password login
- Phone OTP login
- Social logins (Google, Facebook)
- Role-based access (Admin, Member, Super Admin)
- Profile with photo, blood group, emergency contact

### 👥 Groups & Members

- Create / manage private or public groups
- Join via **QR code** or **invite link**
- Group roles (Admin, Moderator, Member)
- View member list with roles & emergency contacts

### 💰 Expenses & Finance

- Add and split group expenses
- Automatic balance calculation
- Export to CSV/PDF
- Settlement tracking
- Multi-currency support

### 📄 Documents & Photos

- Upload travel docs (passport, tickets, ID)
- Secure file storage with encryption
- Time-limited & revocable share links

### 🌍 Maps & Itinerary

- Offline maps (OpenStreetMap tiles)
- Itinerary creation
- Check-ins and meeting points
- Travel guide content packs (download per destination)

### 📡 Offline & Mesh Communication

- **Offline-first architecture** with IndexedDB storage
- **Service Worker** with background sync
- **Automatic caching** of trip data (24-hour refresh)
- **Offline maps** with automatic tile caching
- **Offline expense creation** with auto-sync
- **🔗 Bluetooth Mesh Network** for peer-to-peer communication
  - Real-time chat without internet
  - Expense sync between nearby devices
  - Multi-hop mesh routing
  - Range: up to 100m per hop
  - See [MESH_NETWORK.md](./MESH_NETWORK.md) for details
- SMS fallback for emergency alerts

### 📢 Notifications

- Push notifications (FCM/APNs)
- Email + SMS fallback
- In-app alerts

### 💳 Payments

- Integration with Stripe/PayPal
- Regional wallets (bKash/Nagad adapters)
- Prepayment for public trips
- Automated settlement flows

### 🛡️ Security

- Role-based access control
- Encrypted data at rest + in transit
- Audit logs for financial data
- GDPR-compliant delete/export account

---

## Tech Stack

**Frontend (Web):**

- React + Next.js (with PWA support)
- TailwindCSS + Shadcn/UI
- Redux Toolkit / Zustand for state management

**Mobile (Android/iOS):**

- React Native (shared codebase)
- Native modules for Bluetooth/WiFi Direct

**Backend:**

- Node.js + NestJS (TypeScript) OR Go
- REST + GraphQL APIs
- Embedded SQLite via SQL.js (structured data; no external database required)
- Redis (cache + ephemeral sync)
- S3-compatible storage (for docs/photos)

**DevOps:**

- Docker + Kubernetes
- GitHub Actions CI/CD
- Monitoring: Prometheus + Grafana, Sentry
- Infra-as-Code: Terraform

---

## System Architecture

## System Architecture

The system is designed as a **modular, cross-platform, offline-first architecture** for web and mobile clients.

## System Architecture

                ┌───────────────────────┐
                │ React / Next.js Web    │
                └───────────────────────┘
                          │
                          ▼
                ┌───────────────────────┐
                │ React Native Mobile   │
                └───────────────────────┘
                          │
                          ▼
                ┌───────────────────────────────┐
                │        Backend API Layer       │
                │  (REST + GraphQL + Auth + RBAC) │
                └───────────────────────────────┘
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼

┌────────────────┐ ┌───────────────┐ ┌─────────────┐
│ SQL.js (SQLite) │ │ Redis │ │ S3 Storage │
│ (structured │ │ (cache, │ │ (documents, │
│ data: users, │ │ ephemeral │ │ photos) │
│ groups, │ │ sync data) │ │ │
│ expenses) │ │ │ │ │
└────────────────┘ └───────────────┘ └─────────────┘
│
▼
┌─────────────────────────┐
│ Sync Engine / Mesh SDK │
│ (offline-first, Bluetooth│
│ / WiFi Direct, SMS fallback) │
└─────────────────────────┘

## API Endpoints (Phase 1 MVP)

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/otp`
- `POST /auth/verify-otp`

### Groups

- `POST /groups`
- `GET /groups/:id`
- `POST /groups/:id/invite`
- `GET /groups/:id/members`

### Expenses

- `POST /groups/:id/expenses`
- `GET /groups/:id/balance`

### Documents

- `POST /upload/document`
- `GET /documents/:id`

---

## Database Schema (Simplified)

- **users** → {id, name, email, phone, photoUrl, bloodGroup, emergencyContact, role}
- **groups** → {id, title, type, adminId, createdAt}
- **group_members** → {groupId, userId, role, status}
- **expenses** → {id, groupId, amount, payerId, participants[], createdAt}
- **documents** → {id, ownerType, ownerId, fileUrl, encryptedMeta}
- **invitations** → {id, groupId, code, method, expiresAt}

---

## Development Plan

### Phase 1 (MVP)

- Authentication
- Groups & Members
- Basic Expenses
- Basic Web & Mobile clients
- CI/CD setup

### Phase 2

- Offline storage & sync engine
- Conflict resolution UI
- Mesh communication prototype

### Phase 3

- Payments (Stripe, bKash)
- Finance settlement automation
- Reports & exports

### Phase 4

- Offline maps & guides
- Travel itinerary features

### Phase 5

- Security hardening
- Admin dashboard
- Business/agency features

---

## Instructions for AI (Gemini CLI / Copilot)

When generating code:

1. **Follow this README exactly** — no deviations.
2. Use **clean architecture**: `frontend/`, `mobile/`, `backend/`, `infra/`.
3. Generate **error-free, production-ready code** with TypeScript and proper typing.
4. Apply **enterprise best practices**:
   - Linting & formatting (ESLint + Prettier)
   - Unit + integration tests
   - Error handling & logging
   - Environment configs (`.env`)
5. Ensure **offline-first support** with sync logic.
6. Implement **RBAC middleware** in backend.
7. Scaffold CI/CD pipelines (GitHub Actions).
8. Write Dockerfiles for frontend, mobile, backend.
9. Generate **seed data + migrations** for DB.
10. Create API documentation with Swagger/OpenAPI.

---

## Deliverables

- Web app (Next.js)
- Mobile app (React Native, Android & iOS)
- Backend API (NestJS or Go)
- Database schema & migrations
- CI/CD pipelines
- Infrastructure (Docker + K8s + Terraform)
- Automated tests
- Full documentation

---

## License

Proprietary — for personal & enterprise use only.
